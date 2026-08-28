const G = require('./geo.js');
const { SunCalc, rad, horizBasis, compassAz, dirFromAltAz, sunDir, screenBasis, dot, perp } = G;

// Physical check: the lit limb must point toward the Sun.
// Facing the Moon, azimuth increases to the RIGHT; higher altitude is UP.
function check(date, lat, lng) {
  const m = SunCalc.getMoonPosition(date, lat, lng);
  if (m.altitude < 4 * rad) return;
  const b = horizBasis(lat, lng, date);
  const o = dirFromAltAz(G.unRefract(m.altitude), compassAz(m.azimuth));
  const s = sunDir(date, lat, lng);
  const t = perp(s, o);
  const sb = screenBasis(o);
  const betaTrue = Math.atan2(dot(t, sb.r), dot(t, sb.U)) / rad;      // clockwise from screen-up
  const betaPage = SunCalc.getMoonIllumination(date).angle / rad - m.parallacticAngle / rad;
  const Am = ((m.azimuth / rad + 180) % 360), As = ((Math.atan2(s[0], s[1]) / rad) % 360 + 360) % 360;
  let dA = ((As - Am + 540) % 360) - 180;
  const sunAlt = Math.asin(s[2]) / rad;
  console.log(date.toISOString().slice(0, 16), 'lat', lat,
    'moonAlt=' + (m.altitude / rad).toFixed(1).padStart(5),
    'moonAz=' + Am.toFixed(0).padStart(4),
    'sunAz=' + As.toFixed(0).padStart(4),
    'dAz=' + dA.toFixed(1).padStart(7),
    'sunAlt=' + sunAlt.toFixed(1).padStart(6),
    '| betaTrue=' + betaTrue.toFixed(1).padStart(7),
    'betaPage=' + (((betaPage + 540) % 360) - 180).toFixed(1).padStart(7),
    '| side:', dA > 0 ? 'sun RIGHT' : 'sun LEFT ',
    betaTrue > 0 ? 'true->RIGHT' : 'true->LEFT ',
    (((betaPage + 540) % 360) - 180) > 0 ? 'page->RIGHT' : 'page->LEFT');
}
console.log('--- Amsterdam, one week, hourly ---');
for (let h = 0; h < 24 * 12; h += 3) check(new Date(Date.UTC(2026, 8, 15, 0, 0) + h * 3600e3), 52.37, 4.90);
console.log('--- Sydney ---');
for (let h = 0; h < 24 * 12; h += 4) check(new Date(Date.UTC(2026, 8, 15, 0, 0) + h * 3600e3), -33.87, 151.21);
