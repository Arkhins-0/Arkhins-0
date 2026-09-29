'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HIRE_EVENT } from './CastSelect';

type Field = { name: string; label: string; type: string; placeholder: string };

export type ContactFormCopy = {
  fields: Field[];
  messageField: { name: string; label: string; placeholder: string };
  submitLabel: string;
  sendingLabel: string;
  successLabel: string;
  errorLabel: string;
  endpoint: string;
  formEntries: Record<string, string>;
  iframeName: string;
  iframeTitle: string;
};

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputClass =
  'w-full rounded-xl border-[3px] border-[color:var(--ak-ink)] bg-[color:var(--ak-paper)] px-4 py-3 font-medium text-[color:var(--ak-ink)] outline-none transition-shadow placeholder:text-[rgb(74_67_104/0.5)] focus:shadow-[3px_3px_0_var(--ak-sakura)]';

/**
 * Posts to the Google Form relay at `endpoint`, or straight to the form into a hidden iframe
 * when NEXT_PUBLIC_GOOGLE_FORM_DIRECT is set (static hosting).
 */
export function ContactForm({ copy, title }: { copy: ContactFormCopy; title: string }) {
  const names = [...copy.fields.map((f) => f.name), copy.messageField.name];
  const empty = Object.fromEntries(names.map((n) => [n, ''])) as Record<string, string>;
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<Status>('idle');
  const submitted = useRef(false);

  // The role picker ("Hire me for this") prefills the subject.
  useEffect(() => {
    const onHire = (e: Event) => {
      const subject = (e as CustomEvent<{ subject: string }>).detail?.subject;
      if (subject) setForm((p) => ({ ...p, subject }));
    };
    window.addEventListener(HIRE_EVENT, onHire);
    return () => window.removeEventListener(HIRE_EVENT, onHire);
  }, []);

  const ACTION = process.env.NEXT_PUBLIC_GOOGLE_FORM_ACTION || '';
  const DIRECT = process.env.NEXT_PUBLIC_GOOGLE_FORM_DIRECT === 'true' && Boolean(ACTION);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const settle = (next: Status) => {
    setStatus(next);
    setTimeout(() => setStatus('idle'), 3500);
  };

  const submitViaApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(copy.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setForm(empty);
        settle('success');
      } else settle('error');
    } catch {
      settle('error');
    }
  };

  const onIframeLoad = () => {
    if (!submitted.current) return;
    submitted.current = false;
    setForm(empty);
    settle('success');
  };

  return (
    <form
      {...(DIRECT
        ? {
            action: ACTION,
            method: 'POST' as const,
            target: copy.iframeName,
            onSubmit: () => {
              setStatus('sending');
              submitted.current = true;
            },
          }
        : { onSubmit: submitViaApi })}
      className="ak-cel overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b-[3px] border-[color:var(--ak-ink)] bg-[color:var(--ak-sky)] px-5 py-3">
        <span className="h-3 w-3 rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sakura)]" />
        <span className="h-3 w-3 rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-sun)]" />
        <span className="h-3 w-3 rounded-full border-2 border-[color:var(--ak-ink)] bg-[color:var(--ak-mint)]" />
        <span className="ak-display ml-2 text-white [-webkit-text-stroke:1px_var(--ak-ink)] [paint-order:stroke_fill]">{title}</span>
      </div>

      {DIRECT && (
        <>
          <iframe name={copy.iframeName} title={copy.iframeTitle} onLoad={onIframeLoad} className="hidden" />
          {Object.entries(copy.formEntries).map(([key, id]) => (
            <input key={id} type="hidden" name={id} value={form[key] ?? ''} readOnly />
          ))}
        </>
      )}

      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-7">
        {copy.fields.map((f, i) => (
          <label key={f.name} className={cn('block', i === copy.fields.length - 1 && copy.fields.length % 2 === 1 && 'md:col-span-2')}>
            <span className="mb-1.5 block text-sm font-extrabold">{f.label}</span>
            <input
              type={f.type}
              name={f.name}
              required
              value={form[f.name] ?? ''}
              onChange={change}
              placeholder={f.placeholder}
              autoComplete={f.type === 'email' ? 'email' : f.name === 'name' ? 'name' : 'off'}
              className={inputClass}
            />
          </label>
        ))}
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-extrabold">{copy.messageField.label}</span>
          <textarea
            name={copy.messageField.name}
            rows={5}
            required
            value={form[copy.messageField.name] ?? ''}
            onChange={change}
            placeholder={copy.messageField.placeholder}
            className={cn(inputClass, 'resize-none')}
          />
        </label>

        <div className="flex flex-wrap items-center gap-4 md:col-span-2">
          <button type="submit" disabled={status === 'sending'} className="ak-btn">
            <Send size={16} />
            {status === 'sending' ? copy.sendingLabel : copy.submitLabel}
          </button>
          <p role="status" className="flex items-center gap-2 text-sm font-bold">
            {status === 'success' && (
              <>
                <CheckCircle2 size={16} className="text-[color:var(--ak-mint)]" />
                {copy.successLabel}
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle size={16} className="text-[color:var(--ak-sakura)]" />
                {copy.errorLabel}
              </>
            )}
          </p>
        </div>
      </div>
    </form>
  );
}
