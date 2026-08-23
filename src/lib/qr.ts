import QRCode from 'qrcode';

/**
 * Blank modules around the symbol. Four is the spec minimum; without it a
 * scanner cannot find the finder patterns against the card.
 */
const QUIET = 4;

export type QrRun = { x: number; y: number; width: number };

export type Qr = {
  /** side length in modules, quiet zone included */
  size: number;
  /** dark modules, merged into horizontal runs so the SVG stays small */
  runs: QrRun[];
};

/**
 * Build the module matrix for a string. Only the matrix is taken from the
 * library — no canvas, no image — so this runs once at build and ships as
 * plain SVG.
 */
export function qr(value: string): Qr | null {
  let matrix;
  try {
    matrix = QRCode.create(value, { errorCorrectionLevel: 'M' }).modules;
  } catch {
    return null;
  }

  const { size, data } = matrix;
  const runs: QrRun[] = [];

  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!data[y * size + x]) {
        x++;
        continue;
      }
      const start = x;
      while (x < size && data[y * size + x]) x++;
      runs.push({ x: QUIET + start, y: QUIET + y, width: x - start });
    }
  }

  return { size: size + QUIET * 2, runs };
}
