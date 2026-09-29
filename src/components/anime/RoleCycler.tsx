'use client';

import { useEffect, useState } from 'react';

/** Types each role out, holds, erases, moves to the next — a visual-novel text box. */
export function RoleCycler({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (!roles.length) return;
    const word = roles[i % roles.length];
    const done = !erasing && n === word.length;
    const empty = erasing && n === 0;
    const t = setTimeout(
      () => {
        if (done) setErasing(true);
        else if (empty) {
          setErasing(false);
          setI((v) => v + 1);
        } else setN((v) => v + (erasing ? -1 : 1));
      },
      done ? 1600 : erasing ? 35 : 70
    );
    return () => clearTimeout(t);
  }, [n, erasing, i, roles]);

  const word = roles.length ? roles[i % roles.length] : '';
  return (
    <span aria-live="polite">
      <span className="sr-only">{roles.join(', ')}</span>
      <span aria-hidden="true">
        {word.slice(0, n)}
        <span className="ml-0.5 inline-block w-[0.55ch] animate-[ak-blink_1s_steps(1)_infinite] text-[color:var(--ak-sakura)]">▍</span>
      </span>
    </span>
  );
}
