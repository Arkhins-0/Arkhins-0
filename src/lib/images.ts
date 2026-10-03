import "server-only"

import fs from "node:fs"
import path from "node:path"

export interface Size {
  width: number
  height: number
}

const cache = new Map<string, Size>()

/** Reads width and height from a PNG or JPEG header under /public, so next/image never has to guess. */
export function imageSize(src: string): Size {
  const hit = cache.get(src)
  if (hit) return hit

  let size: Size = { width: 1600, height: 1000 }
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", src))
    if (buf[0] === 0x89 && buf[1] === 0x50) {
      size = { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
    } else if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2
      while (i < buf.length) {
        const marker = buf[i + 1]
        const length = buf.readUInt16BE(i + 2)
        // SOF0..SOF15, minus DHT (c4), JPG (c8) and DAC (cc)
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          size = { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
          break
        }
        i += 2 + length
      }
    }
  } catch {
    // Missing or unreadable: keep the fallback ratio.
  }

  cache.set(src, size)
  return size
}
