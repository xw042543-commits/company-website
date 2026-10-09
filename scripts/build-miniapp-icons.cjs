// Native tab bars require raster icons. Keep the vector source reproducible here.
const path = require('node:path');
const fs = require('node:fs/promises');
const sharp = require('../frontend/node_modules/sharp');
const output = path.join(__dirname, '../miniapp/miniprogram/assets/icons');
const shapes = {
  home: '<path d="M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10"/>',
  university: '<path d="M3 21h18M5 21V8l7-4v17M12 9h7v12M8 9v2m0 3v2m7-4v2m0 3v2"/>',
  circle: '<circle cx="12" cy="12" r="10"/><circle cx="9" cy="9" r="2.3"/><path d="M4.5 17a4.5 4.5 0 0 1 9 0M15 6.8a2.3 2.3 0 0 1 0 4.4m.8 2a4 4 0 0 1 3.7 3.8"/>',
  messages: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H5l-3 2v-9A9 9 0 0 1 21 11.5Z"/><path d="M7 12h.01M12 12h.01M17 12h.01"/>',
  account: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  planning: '<rect x="4" y="5" width="16" height="17" rx="2"/><path d="M8 2v6m8-6v6M8 12h8m-8 5h5"/>',
  ai: '<circle cx="12" cy="12" r="10"/><path d="m5.5 16 3-8 3 8m-5-3h4m4-5v8"/>',
  visa: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M10 3v18m4-13h2m-2 4h2"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  pin: '<path d="M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
  heart: '<path d="M20.5 5.5C17 2 12 6 12 6S7 2 3.5 5.5C-1 10 6 16 12 21c6-5 13-11 8.5-15.5Z"/>',
};
async function main() {
  await fs.mkdir(output, { recursive: true });
  for (const [name, shape] of Object.entries(shapes)) {
    const tab = ['home', 'university', 'circle', 'messages', 'account'].includes(name);
    const variants = tab ? [['', '#87909f'], ['-green', '#00854c']] : [['', name === 'visa' ? '#ed7b22' : '#00854c']];
    if (name === 'heart') variants.push(['-active', '#00854c']);
    for (const [suffix, color] of variants) {
      const fill = name === 'heart' && suffix ? color : 'none';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24"><g fill="${fill}" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
      await sharp(Buffer.from(svg)).png().toFile(path.join(output, `${name}${suffix}.png`));
    }
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
