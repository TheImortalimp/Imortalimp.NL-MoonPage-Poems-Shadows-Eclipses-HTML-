const G = require('./geo.js');
const { SunCalc, rad, horizBasis, compassAz, dirFromAltAz, sunDir, screenBasis,
        dot, cross, norm, sub, scale, perp } = G;

const date = new Date('2026-01-10T20:00:00Z'), lat = 52.37, lng = 4.90;
const m = SunCalc.getMoonPosition(date, lat, lng);
const b = horizBasis(lat, lng, date);
const o = dirFromAltAz(G.unRefract(m.altitude), compassAz(m.azimuth));
const s = sunDir(date, lat, lng);
const t = perp(s, o);

const zhat = perp([0, 0, 1], o);
const sb = screenBasis(o);
console.log('o      ', o.map(x => x.toFixed(4)).join(' '));
console.log('zhat   ', zhat.map(x => x.toFixed(4)).join(' '));
console.log('r      ', sb.r.map(x => x.toFixed(4)).join(' '));
console.log('o x zhat', cross(o, zhat).map(x => x.toFixed(4)).join(' '), ' (should equal r)');
console.log('t      ', t.map(x => x.toFixed(4)).join(' '));

const beta = Math.atan2(dot(t, sb.r), dot(t, [0, 0, 1])) / rad;
const paZenDirect = Math.atan2(dot(t, scale(sb.r, -1)), dot(t, zhat)) / rad;
const paZenFromZ = Math.atan2(dot(t, cross(scale(o, -1), zhat)), dot(t, zhat)) / rad;
console.log('beta          ', beta.toFixed(3));
console.log('paZen direct  ', paZenDirect.toFixed(3), ' (= -beta?', (beta + paZenDirect).toFixed(3) + ')');
console.log('paZen via cross', paZenFromZ.toFixed(3));

// now the skyFrame version
function skyFrame(o, date, lat, lng) {
  const b = horizBasis(lat, lng, date);
  const eq = [o[0] * b.E[0] + o[1] * b.N[0] + o[2] * b.U[0],
              o[0] * b.E[1] + o[1] * b.N[1] + o[2] * b.U[1],
              o[0] * b.E[2] + o[1] * b.N[2] + o[2] * b.U[2]];
  const dec = Math.asin(eq[2]);
  const ra = Math.atan2(eq[1], eq[0]);
  const tanE = [-Math.sin(ra), Math.cos(ra), 0];
  const tanN = [-Math.sin(dec) * Math.cos(ra), -Math.sin(dec) * Math.sin(ra), Math.cos(dec)];
  const toHoriz = v => [dot(v, b.E), dot(v, b.N), dot(v, b.U)];
  return { north: perp(toHoriz(tanN), o), east: perp(toHoriz(tanE), o), zenith: perp([0, 0, 1], o) };
}
function paCCT(t, ref, o) {
  const k = scale(o, -1);
  const perpRef = norm(cross(k, ref));
  return Math.atan2(dot(t, perpRef), dot(t, ref)) / rad;
}
const F = skyFrame(o, date, lat, lng);
console.log('F.zenith', F.zenith.map(x => x.toFixed(4)).join(' '), ' (should equal zhat)');
console.log('F.north ', F.north.map(x => x.toFixed(4)).join(' '));
console.log('F.east  ', F.east.map(x => x.toFixed(4)).join(' '));
console.log('paCCT(zenith)', paCCT(t, F.zenith, o).toFixed(3));
console.log('paCCT(north) ', paCCT(t, F.north, o).toFixed(3), ' suncalc angle', (SunCalc.getMoonIllumination(date).angle / rad).toFixed(3));
console.log('check: north x east . o =', dot(cross(F.north, F.east), o).toFixed(4), '(negative -> PA sense is about -o)');
console.log('check: -o x zenith =', cross(scale(o, -1), F.zenith).map(x => x.toFixed(4)).join(' '), ' vs -r =', sb.r.map(x => -x.toFixed(4)).join(' '));
