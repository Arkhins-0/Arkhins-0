/** Indian digit grouping (5,00,000) without relying on the runtime's ICU data, so server and client agree. */
export function inr(n: number, decimals = 0): string {
  const neg = n < 0;
  const fixed = Math.abs(n).toFixed(decimals);
  const [whole, frac] = fixed.split('.');
  let out = whole;
  if (whole.length > 3) {
    const head = whole.slice(0, -3);
    const tail = whole.slice(-3);
    out = head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + tail;
  }
  return `${neg ? '−' : ''}₹${out}${frac ? '.' + frac : ''}`;
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);
export const pad = (n: number) => String(n).padStart(2, '0');
