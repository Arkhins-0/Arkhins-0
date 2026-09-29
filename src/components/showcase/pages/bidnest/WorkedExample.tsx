'use client';

import { useId, useState } from 'react';
import { inr, pad } from './money';
import { CastSprite } from '../cast';
import type { PageGuest } from '../types';

const POT = 500000;
const MEMBERS = 20;
const SHARE = POT / MEMBERS;

type Commission = 'percent' | 'fixed';

/**
 * One month of a chit, worked in whole paise so nothing drifts: the winning discount, less the foreman's
 * commission, plus whatever the last month carried in, is split across members, rounded down to the chosen
 * denomination, and the remainder is carried to the next auction.
 */
function hammer(bid: number, commission: Commission, round: number, carryIn: number) {
  const P = 100; // paise per rupee
  const fee = commission === 'percent' ? Math.round(POT * 0.05 * P) : 20000 * P;
  const pool = Math.max(0, bid * P - fee) + carryIn * P;
  const rawEach = pool / MEMBERS;
  const each = Math.floor(rawEach / (round * P)) * round * P;
  const carry = pool - each * MEMBERS;
  return {
    fee: fee / P,
    pool: pool / P,
    rawEach: rawEach / P,
    each: each / P,
    carry: carry / P,
    payout: POT - bid,
    pays: SHARE - each / P,
  };
}

/** "The auctioneer's sheet": an illustrative calculator for the roundoff and carry-forward rules in the case study. */
export function WorkedExample({ sprites = [], guest }: { sprites?: (string | undefined)[]; guest?: PageGuest }) {
  const id = useId();
  const [bid, setBid] = useState(42500);
  const [commission, setCommission] = useState<Commission>('percent');
  const [round, setRound] = useState(50);

  const now = hammer(bid, commission, round, 0);

  // Four sittings of the same group: discounts usually shrink as the pot nears its last months.
  const months: { m: number; bid: number; carryIn: number; r: ReturnType<typeof hammer> }[] = [];
  let carry = 0;
  for (let m = 0; m < 4; m++) {
    const b = Math.max(0, Math.round((bid * (1 - m * 0.15)) / 500) * 500);
    const r = hammer(b, commission, round, carry);
    months.push({ m: m + 1, bid: b, carryIn: carry, r });
    carry = r.carry;
  }

  return (
    <div className="bn-sheet">
      <div className={`bn-sheet-head${sprites[0] ? ' has-cast' : ''}`}>
        <div>
        <p className="bn-kicker">Auctioneer&rsquo;s sheet · worked example</p>
        <h3>How one lot is hammered</h3>
        <p className="bn-sheet-lede">
          In a chit, members bid the discount they will give up to take this month&rsquo;s pot. BidNest turns that
          discount into commission, a per-member dividend rounded to a friendly note, and a carry-forward so no
          rupee goes missing. Move the paddle and watch the ledger balance.
        </p>
        </div>
        <CastSprite src={sprites[0]} guest={guest} className="bn-cast bn-cast-point" />
      </div>

      <div className="bn-sheet-grid">
        <form className="bn-sheet-controls" onSubmit={(e) => e.preventDefault()} aria-label="Worked example inputs">
          <p className="bn-sheet-fixed">
            Chit value <b>{inr(POT)}</b> · {MEMBERS} members · {inr(SHARE)} a month each
          </p>

          <label className="bn-field" htmlFor={`${id}-bid`}>
            <span>Winning discount bid</span>
            <output htmlFor={`${id}-bid`} className="bn-field-value">
              {inr(bid)}
            </output>
          </label>
          <input
            id={`${id}-bid`}
            className="bn-range"
            type="range"
            min={20000}
            max={150000}
            step={500}
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
          />

          <fieldset className="bn-seg">
            <legend>Foreman&rsquo;s commission</legend>
            {(
              [
                ['percent', '5% of value'],
                ['fixed', 'Fixed ₹20,000'],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className={commission === v ? 'is-on' : ''}>
                <input type="radio" name={`${id}-c`} value={v} checked={commission === v} onChange={() => setCommission(v)} />
                {label}
              </label>
            ))}
          </fieldset>

          <fieldset className="bn-seg">
            <legend>Round dividends to</legend>
            {[10, 50, 100].map((v) => (
              <label key={v} className={round === v ? 'is-on' : ''}>
                <input type="radio" name={`${id}-r`} value={v} checked={round === v} onChange={() => setRound(v)} />
                ₹{v}
              </label>
            ))}
          </fieldset>
        </form>

        <dl className="bn-slip" aria-live="polite">
          <div>
            <dt>Winning discount</dt>
            <dd>{inr(bid)}</dd>
          </div>
          <div>
            <dt>Less commission</dt>
            <dd>{inr(-now.fee)}</dd>
          </div>
          <div className="is-sub">
            <dt>Dividend pool</dt>
            <dd>{inr(now.pool)}</dd>
          </div>
          <div>
            <dt>Per member, exact</dt>
            <dd>{inr(now.rawEach, 2)}</dd>
          </div>
          <div className="is-key">
            <dt>Per member, rounded to ₹{round}</dt>
            <dd>{inr(now.each)}</dd>
          </div>
          <div>
            <dt>Carried to next month</dt>
            <dd>{inr(now.carry)}</dd>
          </div>
          <div className="is-sub">
            <dt>Winner takes home</dt>
            <dd>{inr(now.payout)}</dd>
          </div>
          <div>
            <dt>Each member pays this month</dt>
            <dd>{inr(now.pays)}</dd>
          </div>
        </dl>
      </div>

      <div className={`bn-ledger-row${sprites[1] ? ' has-cast' : ''}`}>
      <CastSprite src={sprites[1]} guest={guest} className="bn-cast bn-cast-gasp" />
      <div className="bn-ledger-wrap">
        <table className="bn-ledger">
          <caption>Four sittings, carry-forward threaded through</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Bid</th>
              <th scope="col">Carry in</th>
              <th scope="col">Dividend</th>
              <th scope="col">Carry out</th>
            </tr>
          </thead>
          <tbody>
            {months.map((row) => (
              <tr key={row.m}>
                <th scope="row">{pad(row.m)}</th>
                <td>{inr(row.bid)}</td>
                <td>{inr(row.carryIn)}</td>
                <td>{inr(row.r.each)}</td>
                <td>{inr(row.r.carry)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      <p className="bn-fine">
        Illustrative figures for a hypothetical group, following the roundoff and carry-forward rules described in the
        case notes; not BidNest&rsquo;s production code or real member data.
      </p>
    </div>
  );
}
