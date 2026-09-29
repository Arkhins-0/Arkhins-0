/**
 * Semantic checks for a project's showcase document (src/types/content.ts). JSON that parses
 * can still name a block that does not exist or forget a picture; these say so before saving.
 */
const LOOKS = ['clinic', 'ledger', 'folio', 'pitwall', 'tower', 'blueprint', 'plain'];
const BLOCKS = ['stats', 'overview', 'cards', 'table', 'tabs', 'steps', 'compare', 'phones', 'gallery', 'columns', 'duo', 'marquee', 'markdown', 'outro'];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

export function validateShowcase(doc: unknown): string[] {
  const out: string[] = [];
  if (!isObj(doc)) return ['The page must be a JSON object (or empty for the generic page).'];

  if (doc.version !== 1) out.push('"version" should be 1.');

  const theme = doc.theme;
  if (!isObj(theme)) out.push('"theme" is missing: { look, accent: { hex, rgb }, accent2: { hex, rgb } }.');
  else {
    if (!LOOKS.includes(String(theme.look))) out.push(`theme.look "${String(theme.look)}" is not one of ${LOOKS.join(', ')}.`);
    for (const k of ['accent', 'accent2']) {
      const a = theme[k];
      if (!isObj(a) || !isStr(a.hex) || !isStr(a.rgb)) out.push(`theme.${k} needs { hex: "#rrggbb", rgb: "r g b" }.`);
    }
  }

  const screens = doc.screens;
  if (!isObj(screens) || !['light', 'dark'].includes(String(screens.default))) out.push('screens.default should be "light" or "dark".');

  const hero = doc.hero;
  if (!isObj(hero)) out.push('"hero" is missing.');
  else {
    if (!isStr(hero.title)) out.push('hero.title is required.');
    if (!isStr(hero.lede)) out.push('hero.lede is required.');
    if (hero.stage !== undefined) {
      if (!isObj(hero.stage) || !image(hero.stage.center)) out.push('hero.stage.center needs { light, alt }.');
      for (const side of ['left', 'right']) if (isObj(hero.stage) && hero.stage[side] !== undefined && !image(hero.stage[side])) out.push(`hero.stage.${side} needs { light, alt }.`);
    }
    for (const a of ((hero.actions as unknown[]) ?? [])) if (!isObj(a) || !isStr(a.label) || !isStr(a.href)) out.push('Every hero action needs { label, href }.');
  }

  if (!Array.isArray(doc.sections)) out.push('"sections" must be an array of blocks.');
  else {
    doc.sections.forEach((b, i) => {
      const at = `sections[${i}]`;
      if (!isObj(b)) return out.push(`${at} is not an object.`);
      const type = String(b.type);
      if (!BLOCKS.includes(type)) return out.push(`${at}: unknown block type "${type}". Known: ${BLOCKS.join(', ')}.`);
      const items = Array.isArray(b.items) ? (b.items as unknown[]) : null;
      if (['gallery', 'phones'].includes(type)) {
        if (!items) out.push(`${at} (${type}) needs "items".`);
        else items.forEach((it, j) => !image(it) && out.push(`${at}.items[${j}] needs { light, alt }.`));
      }
      if (type === 'steps' && items) items.forEach((it, j) => !(isObj(it) && image(it.image)) && out.push(`${at}.items[${j}].image needs { light, alt }.`));
      if (type === 'compare' && !image(b.image)) out.push(`${at} (compare) needs "image": { light, dark, alt }.`);
      if (type === 'duo') {
        const sides = Array.isArray(b.sides) ? (b.sides as unknown[]) : [];
        if (sides.length !== 2) out.push(`${at} (duo) needs exactly two "sides".`);
        sides.forEach((s, j) => !(isObj(s) && image(s.image)) && out.push(`${at}.sides[${j}].image needs { light, alt }.`));
      }
      if (type === 'markdown' && !isStr(b.file)) out.push(`${at} (markdown) needs "file", a path to a .md file.`);
      if (type === 'outro' && !Array.isArray(b.actions)) out.push(`${at} (outro) needs "actions".`);
      if (type === 'stats' && !items) out.push(`${at} (stats) needs "items": [{ value, label }].`);
      if (type === 'marquee' && !items) out.push(`${at} (marquee) needs "items": ["phrase", ...].`);
    });
  }
  return out;
}

function image(v: unknown): boolean {
  return isObj(v) && isStr(v.light) && typeof v.alt === 'string';
}
