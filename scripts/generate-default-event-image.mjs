// Generates src/data/images/events/default.jpg — the image events fall back
// to when they don't have their own photo. Run with:
//   npm run generate:event-image
//
// Brand maroon ground, a pattern of PrimeIcons (the site's icon font, used
// here through its raw SVGs) each slightly tilted with a soft shadow, and
// the light logo in the middle. Icons stand in for the encounters' themes:
// sparkles (magic), star, moon (meditation), headphones (dance), gift (a
// treat, e.g. chocolate), heart and sun.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const W = 1600;
const H = 1200;
const BG = '#3c0a0d'; // --color-hero-bg
const COLORS = ['#ecc98a', '#e2925f']; // gold-200, terracotta-300
const ICONS = [
  'sparkles',
  'star',
  'moon',
  'headphones',
  'gift',
  'heart',
  'sun',
];
const ICON_SIZE = 70;
const SPACING_X = 175;
const SPACING_Y = 150;
const LOGO_HEIGHT = 600; // stays inside the 16:9 and 1200x630 crops
const OUT = 'src/data/images/events/default.jpg';
// The logo is the light source: each icon's shadow falls away from the
// centre, longer the farther the icon is from it.
const SHADOW_MIN = 2;
const SHADOW_MAX = 12;

const iconDir = new URL('../node_modules/primeicons/raw-svg/', import.meta.url);

function symbol(name) {
  const svg = readFileSync(new URL(`${name}.svg`, iconDir), 'utf8');
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replaceAll('"black"', '"currentColor"')
    .replaceAll('id="', `id="${name}-`)
    .replaceAll('url(#', `url(#${name}-`);
  return `<symbol id="i-${name}" viewBox="0 0 20 20">${inner}</symbol>`;
}

// Deterministic "randomness" so every run produces the same image.
let seed = 7;
function rand() {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
}

const shadows = [];
const icons = [];
const maxDistance = Math.hypot(W / 2, H / 2);
let n = 0;
for (
  let row = -1, y = -SPACING_Y / 2;
  y < H + SPACING_Y;
  row++, y += SPACING_Y
) {
  const offset = row % 2 === 0 ? 0 : SPACING_X / 2; // brick layout
  for (let x = -SPACING_X / 2 + offset; x < W + SPACING_X; x += SPACING_X) {
    const name = ICONS[n % ICONS.length];
    const color = COLORS[(n + row) % COLORS.length];
    const tilt = (rand() * 28 - 14).toFixed(1); // -14°..+14°
    const cx = x + (rand() * 24 - 12);
    const cy = y + (rand() * 24 - 12);
    const use = `<use href="#i-${name}" x="${-ICON_SIZE / 2}" y="${-ICON_SIZE / 2}" width="${ICON_SIZE}" height="${ICON_SIZE}"/>`;
    const at = (px, py) =>
      `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${tilt})`;

    // Shadow: a dark copy pushed outward along the centre→icon direction.
    const dx = cx - W / 2;
    const dy = cy - H / 2;
    const distance = Math.hypot(dx, dy) || 1;
    const length =
      SHADOW_MIN +
      (SHADOW_MAX - SHADOW_MIN) * Math.min(1, distance / maxDistance);
    const sx = cx + (dx / distance) * length;
    const sy = cy + (dy / distance) * length;
    shadows.push(`<g color="#000" transform="${at(sx, sy)}">${use}</g>`);
    icons.push(`<g color="${color}" transform="${at(cx, cy)}">${use}</g>`);
    n += 3; // step through the icons so neighbours differ
  }
}

const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    ${ICONS.map(symbol).join('\n    ')}
    <filter id="blur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${BG}" stop-opacity="1"/>
      <stop offset="0.55" stop-color="${BG}" stop-opacity="0.92"/>
      <stop offset="1" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <g opacity="0.42">
    <g opacity="0.75" filter="url(#blur)">
      ${shadows.join('\n      ')}
    </g>
    ${icons.join('\n    ')}
  </g>
  <ellipse cx="${W / 2}" cy="${H / 2}" rx="430" ry="440" fill="url(#halo)"/>
</svg>`;

const logo = await sharp(
  new URL('../src/data/images/site/logo-full.png', import.meta.url).pathname,
)
  .resize({ height: LOGO_HEIGHT })
  .toBuffer();
const { width: logoWidth } = await sharp(logo).metadata();

await sharp(Buffer.from(background))
  .composite([
    {
      input: logo,
      left: Math.round((W - logoWidth) / 2),
      top: Math.round((H - LOGO_HEIGHT) / 2),
    },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUT);

console.log(`wrote ${OUT}`);
