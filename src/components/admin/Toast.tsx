'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'ok' | 'error';
type Toast = { id: number; text: string; tone: Tone };

const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Tone = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6000 : 2600);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <p
            key={t.id}
            className={cn(
              'max-w-sm rounded-xl border-2 border-[#1c1633] px-4 py-2.5 text-sm font-bold shadow-[3px_3px_0_#1c1633]',
              t.tone === 'error' ? 'bg-red-100 text-red-800' : 'bg-[#1fcf9a] text-white'
            )}
          >
            {t.text}
          </p>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
