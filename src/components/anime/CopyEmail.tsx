'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked — the mailto link still works */
        }
      }}
      className="ak-tag bg-[color:var(--ak-sun)] px-3 py-1.5 transition-transform hover:-translate-y-0.5"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? done : label}
    </button>
  );
}
