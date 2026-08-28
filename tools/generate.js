// Build the compact lunar-eclipse table + calibrate shadow radii against NASA.
const fs = require('fs');
const G = require('./geo.js');
const { SunCalc, rad, toDays } = G;

const R_EARTH = 6378.137, R_MOON = 1737.4, R_SUN = 696000, AU = 149597870.7;

function sunDistanceKm(date) {
  const d = toDays(date);
  const M = rad * (357.5291 + 0.98560028 * d);
  const e = 0.016708634 - 0.000042037 * (d / 36525);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const v = M + C;
  return (1.000001018 * (1 - e * e) / (1 + e * Math.cos(v))) * AU;
}

// Parse the NASA catalog page fetched earlier.
const src = fs.readFileSync('lecat.html', 'utf8')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&');
const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const re = /^\s*(\d{5})\s+(\d{4})\s+([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+(-?\d+)\s+(\d+)\s+(\d+)\s+([NTP][-+xbe]?)\s+(\S+)\s+(-?\d+\.\d+)\s+(\d+\.\d+)\s+(-?\d+\.\d+)\s+([\d.]+)\s+(\S+)\s+(\S+)/gm;

const events = [];
let m;
while ((m = re.exec(src))) {
  const [, , year, mon, day, hh, mm, ss, dt, , , type, , gamma, penMag, umbMag, penDur, parDur] = m;
  const td = Date.UTC(+year, MON[mon], +day, +hh, +mm, +ss);
  const ut = td - (+dt) * 1000;
  events.push({
    cat: +m[1], ut, type: type[0], gamma: +gamma, penMag: +penMag, umbMag: +umbMag,
    penDur: +penDur, parDur: parDur === '-' ? 0 : +parDur
  });
}
console.log('parsed events:', events.length);

// ---- geometry at greatest eclipse ----
function geometry(ev, kU, kP) {
  const date = new Date(ev.ut);
  const dMoon = SunCalc.getMoonPosition(date, 0, 0).distance;      // km
  const dSun = sunDistanceKm(date);
  const pM = Math.asin(R_EARTH / dMoon) / rad;                     // moon parallax (deg)
  const pS = Math.asin(R_EARTH / dSun) / rad;                      // sun parallax (deg)
  const S = Math.asin(R_SUN / dSun) / rad;                         // sun semidiameter (deg)
  const rm = Math.asin(R_MOON / dMoon) / rad;                      // moon semidiameter (deg)
  const rhoU = kU * (pM + pS - S);
  const rhoP = kP * (pM + pS + S);
  const sigma = Math.abs(ev.gamma) * pM;                           // distance to shadow axis (deg)
  return { pM, pS, S, rm, rhoU, rhoP, sigma,
    umbMag: (rhoU + rm - sigma) / (2 * rm),
    penMag: (rhoP + rm - sigma) / (2 * rm) };
}

// ---- least squares fit of the enlargement factors ----
function fit(kind) {
  let best = null;
  for (let k = 0.94; k <= 1.10; k += 0.0005) {
    let sse = 0, n = 0;
    for (const ev of events) {
      const g = geometry(ev, kind === 'u' ? k : 1, kind === 'p' ? k : 1);
      const ref = kind === 'u' ? ev.umbMag : ev.penMag;
      const val = kind === 'u' ? g.umbMag : g.penMag;
      // only fit where the Moon actually meets that shadow
      if (kind === 'u' && ref < 0.02) continue;
      sse += (val - ref) ** 2; n++;
    }
    if (!best || sse / n < best.sse) best = { k, sse: sse / n, n };
  }
  return best;
}
const fu = fit('u'), fp = fit('p');
console.log('best umbra enlargement  kU =', fu.k.toFixed(4), ' rms =', Math.sqrt(fu.sse).toFixed(4), 'n =', fu.n);
console.log('best penumbra enlargement kP =', fp.k.toFixed(4), ' rms =', Math.sqrt(fp.sse).toFixed(4), 'n =', fp.n);

console.log('\nsample check (kU=' + fu.k.toFixed(4) + '):');
for (const ev of events.filter(e => [2025, 2026, 2028, 2029].includes(new Date(e.ut).getUTCFullYear()))) {
  const g = geometry(ev, fu.k, fp.k);
  console.log(new Date(ev.ut).toISOString().slice(0, 16), ev.type,
    'gamma=' + ev.gamma.toFixed(4).padStart(8),
    'umbMag nasa=' + ev.umbMag.toFixed(4).padStart(7), 'mine=' + g.umbMag.toFixed(4).padStart(7),
    'penMag nasa=' + ev.penMag.toFixed(3).padStart(6), 'mine=' + g.penMag.toFixed(3).padStart(6),
    'sigma=' + g.sigma.toFixed(4), 'rhoU=' + g.rhoU.toFixed(4), 'rm=' + g.rm.toFixed(4));
}
fs.writeFileSync('events.json', JSON.stringify(events));
