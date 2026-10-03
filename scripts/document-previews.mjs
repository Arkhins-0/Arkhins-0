/**
 * Renders a small preview of every certificate listed in src/content/documents.json, from the files in the
 * sibling `assets` folder (the `assets` branch), into public/<section>/previews/<slug>.webp.
 *
 *   npm run previews
 *
 * Runs locally: the PDFs are drawn with pdf.js onto a native canvas, then shrunk and encoded with sharp.
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"
import sharp from "sharp"

const require = createRequire(import.meta.url)
const root = path.resolve(import.meta.dirname, "..")
const assets = path.resolve(root, "../assets")
const documents = JSON.parse(fs.readFileSync(path.join(root, "src/content/documents.json"), "utf8"))

// pdf.js wants these as forward-slash paths ending in "/", even on Windows.
const pdfjsDir = path.dirname(require.resolve("pdfjs-dist/package.json")).replaceAll("\\", "/")
const WIDTH = 640

export const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/** First page of a PDF as a PNG buffer, drawn at twice the preview width so the shrink stays sharp. */
async function renderPdf(file) {
  const task = getDocument({
    data: new Uint8Array(fs.readFileSync(file)),
    standardFontDataUrl: `${pdfjsDir}/standard_fonts/`,
    cMapUrl: `${pdfjsDir}/cmaps/`,
    cMapPacked: true,
    verbosity: 0,
  })
  const pdf = await task.promise
  const page = await pdf.getPage(1)
  const scale = (WIDTH * 2) / page.getViewport({ scale: 1 }).width
  const viewport = page.getViewport({ scale })
  const { canvas, context } = pdf.canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height))
  await page.render({ canvas, canvasContext: context, viewport }).promise
  const png = canvas.toBuffer("image/png")
  await task.destroy()
  return png
}

let made = 0
for (const [section, entries] of Object.entries(documents)) {
  const outDir = path.join(root, "public", section, "previews")
  fs.mkdirSync(outDir, { recursive: true })

  for (const [name, fileName] of Object.entries(entries)) {
    const file = path.join(assets, fileName)
    if (!fs.existsSync(file)) {
      console.warn(`missing  ${section}/${name}: ${fileName}`)
      continue
    }
    const source = fileName.toLowerCase().endsWith(".pdf") ? await renderPdf(file) : fs.readFileSync(file)
    const out = path.join(outDir, `${slug(name)}.webp`)
    await sharp(source).flatten({ background: "#ffffff" }).resize({ width: WIDTH }).webp({ quality: 80 }).toFile(out)
    console.log(`preview  ${path.relative(root, out)}`)
    made++
  }
}
console.log(`${made} previews written`)
