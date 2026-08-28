// Emit the compact in-page eclipse table (2025-2060) from the NASA catalog rows.
const fs = require('fs');
const events = JSON.parse(fs.readFileSync('events2.json', 'utf8'))
  .filter(e => {
    const y = new Date(e.ut).getUTCFullYear();
    return y >= 2025 && y <= 2060;
  })
  .sort((a, b) => a.ut - b.ut);

const p2 = n => String(n).padStart(2, '0');
const iso = ms => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}` +
         `T${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}Z`;
};

const lines = events.map(e => {
  const dur = e.umbral ? e.parDur : e.penDur;
  return `${iso(e.ut)} ${e.gamma.toFixed(4)} ${dur.toFixed(1)}`;
});
console.log(lines.length + ' eclipses 2025-2060');
fs.writeFileSync('eclipse_table.txt', lines.join('\n') + '\n');
console.log(lines.slice(0, 8).join('\n'));
console.log('...');
console.log(lines.slice(-3).join('\n'));
console.log('bytes:', fs.statSync('eclipse_table.txt').size);
