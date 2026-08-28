const G = require('./geo.js');
const { SunCalc, rad, horizBasis, compassAz, dirFromAltAz, sunDir, dot, perp, screenBasis } = G;

function diag(label, date, lat, lng) {
  const m = SunCalc.getMoonPosition(date, lat, lng);
  const s = sunDir(date, lat, lng);
  const oR = dirFromAltAz(m.altitude, compassAz(m.azimuth));               // refracted
  const o = dirFromAltAz(G.unRefract(m.altitude), compassAz(m.azimuth));   // geometric
  const t = perp(s, o), tR = perp(s, oR);
  const sb = screenBasis(o);
  const beta = Math.atan2(dot(t, sb.r), dot(t, sb.U)) / rad;
  const betaR = Math.atan2(dot(tR, sb.r), dot(tR, sb.U)) / rad;
  const refrArcmin = (m.altitude - G.unRefract(m.altitude)) / rad * 60;
  console.log(label.padEnd(10),
    'alt=' + (m.altitude / rad).toFixed(2).padStart(7),
    'az=' + (((m.azimuth / rad) + 180) % 360).toFixed(1).padStart(6),
    'sep=' + (Math.acos(dot(o, s)) / rad).toFixed(3).padStart(8),
    'refr=' + refrArcmin.toFixed(2).padStart(6) + 'arcmin',
    'beta=' + beta.toFixed(2).padStart(8),
    'betaRefr=' + betaR.toFixed(2).padStart(8),
    'delta=' + (beta - betaR).toFixed(2).padStart(6));
}

diag('eclipse', new Date('2026-08-28T04:13:00Z'), 52.37, 4.90);
diag('crescent', new Date('2026-09-12T20:00:00Z'), 52.37, 4.90);
diag('gibbous', new Date('2026-09-05T20:00:00Z'), 52.37, 4.90);
diag('jan', new Date('2026-01-10T20:00:00Z'), 52.37, 4.90);
diag('santiago', new Date('2026-08-28T04:13:00Z'), -33.45, -70.67);
diag('equator', new Date('2026-08-28T04:13:00Z'), 0.1, 4.90);
diag('sydney', new Date('2026-08-28T10:00:00Z'), -33.87, 151.21);
diag('low moon', new Date('2026-09-12T04:00:00Z'), 52.37, 4.90);
