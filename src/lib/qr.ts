import QRCode from 'qrcode';

/** Quiet-zone modules around the symbol (spec minimum is four). */
const QUIET = 4;

export type QrRun = { x: number; y: number; width: number };

export type Qr = {
  size: number;
  runs: QrRun[];
};

/** Builds the QR module matrix for a string as horizontal runs, sized with the quiet zone. */
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
