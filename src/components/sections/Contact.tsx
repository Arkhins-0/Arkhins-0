'use client';

import { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  MapPin,
  Send,
} from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin, FaTelegram } from 'react-icons/fa6';
import { FaDiscord } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';
import portfolioData from '@/data/portfolio.json';
import { NeonButton, Panel, Reveal, SectionHead } from '@/components/fx';
import { cn } from '@/lib/utils';

const { basics, socialLinks } = portfolioData;

const SOCIAL_ICON: Record<string, React.ReactNode> = {
  github: <FaGithub size={17} />,
  linkedin: <FaLinkedin size={17} />,
  instagram: <FaInstagram size={17} />,
  google: <SiGoogle size={17} />,
  discord: <FaDiscord size={17} />,
  telegram: <FaTelegram size={17} />,
};

/* Google Form entry ids — keep in sync with the API route. */
const ENTRY = {
  name: 'entry.1444212408',
  email: 'entry.12430413',
  subject: 'entry.1777991339',
  message: 'entry.445717152',
};

const FIELDS = [
  { name: 'name', label: 'your name', type: 'text', placeholder: 'Ada Lovelace' },
  { name: 'email', label: 'reply-to', type: 'email', placeholder: 'you@domain.com' },
  { name: 'subject', label: 'subject', type: 'text', placeholder: 'A project, a role, a hello' },
] as const;

type Status = 'idle' | 'sending' | 'success' | 'error';

export function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);
  const submitted = useRef(false);

  const ACTION = process.env.NEXT_PUBLIC_GOOGLE_FORM_ACTION || '';
  const DIRECT =
    process.env.NEXT_PUBLIC_GOOGLE_FORM_DIRECT === 'true' && Boolean(ACTION);

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const reset = (next: Status) => {
    setStatus(next);
    if (next !== 'sending') setTimeout(() => setStatus('idle'), 3200);
  };

  /* Route through the server action when it is available (Vercel), which keeps
     the Google Form endpoint off the client. */
  const submitViaApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/submit-google-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setForm({ name: '', email: '', subject: '', message: '' });
        reset('success');
      } else {
        reset('error');
      }
    } catch {
      reset('error');
    }
  };

  /* Static-host fallback: let the browser POST straight to Google, targeting a
     hidden iframe so the page never navigates away. */
  const submitDirect = () => {
    setStatus('sending');
    submitted.current = true;
  };

  const onIframeLoad = () => {
    if (!submitted.current) return;
    submitted.current = false;
    setForm({ name: '', email: '', subject: '', message: '' });
    reset('success');
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(basics.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the mailto link still works */
    }
  };

  return (
    <section id="contact" className="band overflow-hidden">
      <div className="shell">
        <SectionHead index="08" label="Open channel" title="Let's make" accentWord="contact" />

        {/* ------------------------------------------- giant mailto */}
        <Reveal className="mt-10">
          <a
            href={`mailto:${basics.email}`}
            className="group inline-block max-w-full"
          >
            <span className="block break-all font-display text-[clamp(1.35rem,4.7vw,3.1rem)] font-extrabold leading-[1] tracking-tightest transition-colors duration-500 group-hover:text-accent">
              {basics.email}
            </span>
            <span className="mt-3 block h-px w-full origin-left scale-x-0 neon-line transition-transform duration-700 ease-swift group-hover:scale-x-100" />
          </a>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* --------------------------------------------- left column */}
          <div className="space-y-8">
            <Reveal dir="right">
              <p className="max-w-md text-[0.98rem] leading-relaxed text-ink-dim">
                I&apos;m finishing my B.Tech and looking for a team where design
                and engineering aren&apos;t separate desks. Freelance, full-time,
                or a half-formed idea you want a second opinion on — all welcome.
              </p>
            </Reveal>

            <Reveal dir="right" delay={0.08}>
              <dl className="space-y-0 border-t border-white/8">
                <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
                  <dt className="hud text-ink-faint">Email</dt>
                  <dd className="flex items-center gap-3">
                    <span className="truncate text-sm">{basics.email}</span>
                    <button
                      onClick={copyEmail}
                      aria-label="Copy email address"
                      className="text-ink-faint transition-colors hover:text-accent"
                    >
                      {copied ? (
                        <CheckCircle2 size={14} className="text-accent" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
                  <dt className="hud text-ink-faint">Based in</dt>
                  <dd className="flex items-center gap-2 text-sm">
                    <MapPin size={13} className="text-accent" />
                    {basics.location.city}, {basics.location.country}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
                  <dt className="hud text-ink-faint">Status</dt>
                  <dd className="flex items-center gap-2 text-sm text-accent">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute h-full w-full rounded-full bg-accent animate-pulse-ring" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    {basics.availability}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal dir="right" delay={0.14}>
              <p className="eyebrow mb-4">Elsewhere</p>
              <ul className="flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 border border-white/10 px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/8"
                      aria-label={s.name}
                    >
                      <span className="text-ink-faint transition-colors group-hover:text-accent">
                        {SOCIAL_ICON[s.icon]}
                      </span>
                      <span className="hud text-ink-faint transition-colors group-hover:text-ink">
                        {s.username}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* --------------------------------------------- console form */}
          <Reveal dir="left" delay={0.1}>
            <Panel hot cut={24} className="scanlines">
              <form
                {...(DIRECT
                  ? {
                      action: ACTION,
                      method: 'POST' as const,
                      target: 'gform_sink',
                      onSubmit: submitDirect,
                    }
                  : { onSubmit: submitViaApi })}
                className="relative p-6 md:p-8"
              >
                {/* console chrome */}
                <div className="mb-7 flex items-center gap-2 border-b border-white/8 pb-4">
                  <span className="h-2 w-2 rotate-45 bg-accent" />
                  <span className="hud text-ink-faint">
                    message<span className="text-accent">.</span>compose
                  </span>
                  <span className="ml-auto hud text-ink-faint">
                    {DIRECT ? 'gform' : 'api'}
                  </span>
                </div>

                {DIRECT && (
                  <>
                    <iframe
                      name="gform_sink"
                      title="form target"
                      onLoad={onIframeLoad}
                      className="hidden"
                    />
                    <input type="hidden" name={ENTRY.name} value={form.name} readOnly />
                    <input type="hidden" name={ENTRY.email} value={form.email} readOnly />
                    <input type="hidden" name={ENTRY.subject} value={form.subject} readOnly />
                    <input type="hidden" name={ENTRY.message} value={form.message} readOnly />
                  </>
                )}

                <div className="space-y-6">
                  {FIELDS.map((f) => (
                    <Field
                      key={f.name}
                      {...f}
                      value={form[f.name]}
                      onChange={change}
                    />
                  ))}

                  <label className="block">
                    <span className="hud mb-2 flex items-center gap-2 text-ink-faint">
                      <span className="text-accent">{'>'}</span> message
                    </span>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={change}
                      placeholder="What are you building?"
                      className="w-full resize-none border-b border-white/12 bg-transparent pb-2 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink-faint/60 focus:border-accent"
                    />
                  </label>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <NeonButton
                    type="submit"
                    disabled={status === 'sending'}
                    magnetic={false}
                    icon={<Send size={14} />}
                  >
                    {status === 'sending' ? 'Transmitting' : 'Send message'}
                  </NeonButton>

                  <span
                    className={cn(
                      'hud flex items-center gap-2 transition-opacity duration-300',
                      status === 'idle' || status === 'sending'
                        ? 'opacity-0'
                        : 'opacity-100'
                    )}
                    role="status"
                  >
                    {status === 'success' && (
                      <>
                        <CheckCircle2 size={13} className="text-accent" />
                        <span className="text-accent">Delivered — talk soon</span>
                      </>
                    )}
                    {status === 'error' && (
                      <>
                        <AlertCircle size={13} className="text-rose" />
                        <span className="text-rose">
                          Failed. Email me directly?
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </form>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="hud mb-2 flex items-center gap-2 text-ink-faint">
        <span className="text-accent">{'>'}</span> {label}
      </span>
      <input
        type={type}
        name={name}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name === 'email' ? 'email' : 'off'}
        className="w-full border-b border-white/12 bg-transparent pb-2 font-mono text-sm text-ink outline-none transition-colors placeholder:text-ink-faint/60 focus:border-accent"
      />
    </label>
  );
}
