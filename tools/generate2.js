// Derive the along-track rate from the catalogued durations and check contact times.
const fs = require('fs');
const G = require('./geo.js');
const { SunCalc, rad, toDays } = G;
const R_EARTH = 6378.137, R_MOON = 1737.4, R_SUN = 696000, AU = 149597870.7;
const KU = 1.0170, KP = 1.0060;

function sunDistanceKm(date) {
  const d = toDays(date);
  const M = rad * (357.5291 + 0.98560028 * d);
  const e = 0.016708634 - 0.000042037 * (d / 36525);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  return (1.000001018 * (1 - e * e) / (1 + e * Math.cos(M + C))) * AU;
}
function geom(ut) {
  const date = new Date(ut);
  const dMoon = SunCalc.getMoonPosition(date, 0, 0).distance, dSun = sunDistanceKm(date);
  const pM = Math.asin(R_EARTH / dMoon) / rad, pS = Math.asin(R_EARTH / dSun) / rad;
  const S = Math.asin(R_SUN / dSun) / rad, rm = Math.asin(R_MOON / dMoon) / rad;
  return { pM, rhoU: KU * (pM + pS - S), rhoP: KP * (pM + pS + S), rm };
}

const events = JSON.parse(fs.readFileSync('events.json', 'utf8'));
const iso = ms => new Date(ms).toISOString().slice(5, 16).replace('T', ' ');

let vs = [];
for (const ev of events) {
  const g = geom(ev.ut);
  const sigma = Math.abs(ev.gamma) * g.pM;
  const umbral = ev.umbMag > 0;
  const R = umbral ? g.rhoU + g.rm : g.rhoP + g.rm;
  const dur = (umbral ? ev.parDur : ev.penDur);           // minutes
  const v = 2 * Math.sqrt(Math.max(0, R * R - sigma * sigma)) / (dur / 60);   // deg / hour
  ev.v = v; ev.sigma = sigma; vs.push(v);
  ev.umbral = umbral;
}
vs.sort((a, b) => a - b);
console.log('derived rate v (deg/hr): min', vs[0].toFixed(4), 'p50', vs[(vs.length / 2) | 0].toFixed(4), 'max', vs[vs.length - 1].toFixed(4));

// contact times:  sigma(t)^2 = sigma_min^2 + (v*dt)^2
function contacts(ev) {
  const g = geom(ev.ut);
  const out = { great: ev.ut };
  const solve = R => {
    const inner = R * R - ev.sigma * ev.sigma;
    return inner <= 0 ? null : Math.sqrt(inner) / ev.v * 3600e3;
  };
  const dU = solve(g.rhoU + g.rm), dP = solve(g.rhoP + g.rm);
  out.u1 = dU == null ? null : ev.ut - dU; out.u4 = dU == null ? null : ev.ut + dU;
  out.p1 = dP == null ? null : ev.ut - dP; out.p4 = dP == null ? null : ev.ut + dP;
  return out;
}

console.log('\n2026 Aug 28 - NASA:  P1 01:24  U1 02:34  greatest 04:13  U4 05:52  P4 07:02 (UT)');
const e26 = events.find(e => iso(e.ut).startsWith('08-28') && new Date(e.ut).getUTCFullYear() === 2026);
const c = contacts(e26);
console.log('              model:', 'P1', iso(c.p1).slice(6), ' U1', iso(c.u1).slice(6),
  ' greatest', iso(c.great).slice(6), ' U4', iso(c.u4).slice(6), ' P4', iso(c.p4).slice(6),
  ' v=' + e26.v.toFixed(4), ' sigma=' + e26.sigma.toFixed(4));

console.log('\nsame check for a few more (penumbral + total):');
for (const ev of events.filter(e => {
  const y = new Date(e.ut).getUTCFullYear();
  return [2025, 2027, 2029].includes(y);
})) {
  const cc = contacts(ev);
  console.log(iso(ev.ut), ev.type, 'umbMag=' + ev.umbMag.toFixed(3).padStart(7),
    'P1', iso(cc.p1).slice(6), 'U1', (cc.u1 ? iso(cc.u1).slice(6) : '  --  '),
    'U4', (cc.u4 ? iso(cc.u4).slice(6) : '  --  '), 'P4', iso(cc.p4).slice(6),
    'v=' + ev.v.toFixed(4));
}
fs.writeFileSync('events2.json', JSON.stringify(events, null, 0));
