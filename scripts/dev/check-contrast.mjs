/**
 * WCAG AA contrast audit for the ArkRide palette.
 *
 * Run it whenever a colour token changes. It exists because porting the mobile
 * palette straight across produced three real AA failures — `textSubtle` at
 * 3.25:1 and `textMuted` sitting exactly on 4.50 — which nobody would have
 * caught by eye, since both look perfectly readable.
 *
 * It also pins the rule that black, not white, goes on amber: white on
 * #f3ba3f is 1.76:1, and that row is expected to fail as a guard against
 * anyone "fixing" the button later.
 *
 *   node scripts/dev/check-contrast.mjs
 */
// WCAG 2.1 relative luminance + contrast ratio.
const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const hex = (h) => { h = h.replace('#',''); return [0,2,4].map(i => parseInt(h.slice(i,i+2),16)); };
// Composite an rgba over a solid backdrop, as the browser does.
const over = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const ratio = (a, b) => { const [l1,l2] = [lum(a), lum(b)].sort((x,y)=>y-x); return (l1 + 0.05) / (l2 + 0.05); };

const WHITE = hex('#ffffff'), PAGE = hex('#f5f7f8'), INK = hex('#152531'), AMBER = hex('#f3ba3f');
const TINT = over(AMBER, 0.14, WHITE);

const checks = [
  ['ink on page',                  INK,             PAGE,  'body text',        4.5],
  ['ink on white',                 INK,             WHITE, 'card text',        4.5],
  ['text-muted #69707e on white',  hex('#69707e'),  WHITE, 'secondary body',   4.5],
  ['text-muted on page',           hex('#69707e'),  PAGE,  'secondary body',   4.5],
  ['text-subtle #6a6f78 on white', hex('#6a6f78'),  WHITE, 'eyebrows/captions',4.5],
  ['text-subtle on page',          hex('#6a6f78'),  PAGE,  'footer meta',      4.5],
  ['BLACK on amber (button)',      hex('#000000'),  AMBER, 'primary CTA',      4.5],
  ['WHITE on amber (rejected)',    WHITE,           AMBER, 'never do this',    4.5],
  ['primary-ink #8a5c00 on tint',  hex('#8a5c00'),  TINT,  'badge text',       4.5],
  ['amber on ink surface',         AMBER,           INK,   'eyebrow + stats',  4.5],
  ['white on ink surface',         WHITE,           INK,   'dark card text',   4.5],
  ['on-inverse-muted 70% on ink',  over(WHITE,0.70,INK), INK, 'dark card body',4.5],
  ['black on butter #feee8f',      hex('#000000'),  hex('#feee8f'), 'secondary CTA', 4.5],
];

let fails = 0;
console.log('  ratio   AA?    combination');
for (const [name, fg, bg, use, min] of checks) {
  const r = ratio(fg, bg);
  const pass = r >= min;
  const expectedFail = name.includes('rejected');
  if (!pass && !expectedFail) fails++;
  console.log(`  ${r.toFixed(2).padStart(5)}   ${pass ? 'PASS' : 'FAIL'}   ${name.padEnd(32)} (${use})`);
}
console.log(`\n${fails} unexpected failure(s)`);
process.exit(fails ? 1 : 0);
