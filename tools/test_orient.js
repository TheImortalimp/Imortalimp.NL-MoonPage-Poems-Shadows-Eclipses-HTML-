const G = require('./geo.js');
const { SunCalc, rad, horizBasis, compassAz, dirFromAltAz, sunDir, screenBasis, dot, perp } = G;

// Compare the page's bright-limb screen angle  (illumination.angle - parallacticAngle)
// with the screen angle of the true "moon -> sun" direction on the sky.
function check(label, date, lat, lng) {
  const moon = SunCalc.getMoonPosition(date, lat, lng);
  const illum = SunCalc.getMoonIllumination(date);
  const b = horizBasis(lat, lng, date);

  const m = dirFromAltAz(G.unRefract(moon.altitude), compassAz(moon.azimuth));
  const s = sunDir(date, lat, lng);
  const t = perp(s, m);                       // sky direction from the moon toward the sun
  const sb = screenBasis(m, b);

  const ang = v => Math.atan2(dot(v, sb.r), dot(v, sb.U)) / rad;   // clockwise from up
  const betaMine = ang(t);
  const betaPage = illum.angle / rad - moon.parallacticAngle / rad;

  const wrap = x => ((x + 540) % 360) - 180;
  console.log(label.padEnd(24),
    'betaMine=' + betaMine.toFixed(2).padStart(8),
    'betaPage=' + betaPage.toFixed(2).padStart(8),
    'diff=' + wrap(betaMine - betaPage).toFixed(2).padStart(8),
    'mirrored=' + wrap(-betaMine - betaPage).toFixed(2).padStart(8),
    'sep=' + (Math.acos(Math.max(-1, Math.min(1, dot(m, s)))) / rad).toFixed(2).padStart(7));
}

const cases = [
  ['eclipse 2026-08-28', new Date('2026-08-28T04:13:00Z'), 52.37, 4.90],
  ['2026-08-28 22:00Z', new Date('2026-08-28T22:00:00Z'), 52.37, 4.90],
  ['2026-09-05 20:00Z', new Date('2026-09-05T20:00:00Z'), 52.37, 4.90],
  ['2026-09-12 20:00Z', new Date('2026-09-12T20:00:00Z'), 52.37, 4.90],
  ['2026-09-20 20:00Z', new Date('2026-09-20T20:00:00Z'), 52.37, 4.90],
  ['2026-09-20 04:00Z', new Date('2026-09-20T04:00:00Z'), 52.37, 4.90],
  ['2026-01-10 20:00Z', new Date('2026-01-10T20:00:00Z'), 52.37, 4.90],
  ['sydney', new Date('2026-08-28T10:00:00Z'), -33.87, 151.21],
  ['santiago', new Date('2026-08-28T04:13:00Z'), -33.45, -70.67],
  ['southern mid', new Date('2026-06-01T23:00:00Z'), -33.87, 151.21],
  ['equator', new Date('2026-08-28T04:13:00Z'), 0, 4.90],
  ['high lat', new Date('2026-03-14T06:00:00Z'), 68.0, 15.0]
];
for (const c of cases) check(c[0], c[1], c[2], c[3]);
