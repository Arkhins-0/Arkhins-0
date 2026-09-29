'use client';

import { useEffect, useState } from 'react';
import { inr, pad } from './money';

/** An illustrative evening: members of a 20-seat chit bidding the discount they will forgo for this month's pot. */
const BIDS: { amount: number; paddle: number }[] = [
  { amount: 25000, paddle: 7 },
  { amount: 27500, paddle: 12 },
  { amount: 30000, paddle: 3 },
  { amount: 32500, paddle: 12 },
  { amount: 35000, paddle: 18 },
  { amount: 37500, paddle: 12 },
  { amount: 40000, paddle: 9 },
  { amount: 42500, paddle: 12 },
];

/** "Now bidding" strip under the cover. Cycles bids until the hammer falls, then starts the next lot. */
export function BidTicker({ lot = 'Lot 01' }: { lot?: string }) {
  const [i, setI] = useState(BIDS.length); // server + reduced motion: the hammered state
  const [still, setStill] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    setStill(false);
    setI(0);
    const t = window.setInterval(() => setI((v) => (v >= BIDS.length ? 0 : v + 1)), 2300);
    return () => window.clearInterval(t);
  }, []);

  const hammered = i >= BIDS.length;
  const idx = Math.min(i, BIDS.length - 1);
  const cur = BIDS[idx];
  const history = BIDS.slice(Math.max(0, idx - 2), idx).reverse();

  return (
    <div className="bn-ticker" role="group" aria-label="Illustrative live auction">
      <p className="bn-sr">
        Illustrative auction for a 20-member chit worth {inr(500000)}: the hammer falls at a discount bid of{' '}
        {inr(BIDS[BIDS.length - 1].amount)} from paddle {BIDS[BIDS.length - 1].paddle}.
      </p>
      <div className="bn-ticker-in" aria-hidden="true">
        <span className="bn-ticker-live">
          <i className={still ? '' : 'bn-pulse'} />
          {hammered ? 'Hammer' : 'Now bidding'}
        </span>
        <span className="bn-ticker-lot">{lot} · Chit of {inr(500000)} · 20 members</span>
        <span key={i} className={`bn-ticker-bid${hammered ? ' is-sold' : ''}`}>
          Bid <b>{inr(cur.amount)}</b> — Paddle {pad(cur.paddle)}
          {hammered && <em className="bn-ticker-sold">Sold</em>}
        </span>
        <span className="bn-ticker-hist">
          {history.map((b, k) => (
            <span key={k}>
              {inr(b.amount)} · P{pad(b.paddle)}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
