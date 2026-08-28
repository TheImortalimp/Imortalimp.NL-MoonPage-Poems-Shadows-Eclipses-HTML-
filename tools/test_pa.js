const G = require('./geo.js');
const { SunCalc, rad, horizBasis, compassAz, dirFromAltAz, sunDir, screenBasis,
        dot, cross, norm, sub, scale, perp, lst, obliquity, toDays, eclipticToHoriz } = G;

// Direction on the sky of increasing RA ("east") and increasing dec ("north") at an object.
function skyFrame(o, date, lat, lng) {
  const b = horizBasis(lat, lng, date);
  // The object's equatorial RA/Dec come from its horizontal direction (inverse rotation).
  const eq = [o[0] * b.E[0] + o[1] * b.N[0] + o[2] * b.U[0],
              o[0] * b.E[1] + o[1] * b.N[1] + o[2] * b.U[1],
              o[0] * b.E[2] + o[1] * b.N[2] + o[2] * b.U[2]];
  const dec = Math.asin(eq[2]);
  const ra = Math.atan2(eq[1], eq[0]);
  // east (increasing RA) and north (increasing dec) tangents, in equatorial xyz
  const tanE = [-Math.sin(ra), Math.cos(ra), 0];
  const tanN = [-Math.sin(dec) * Math.cos(ra), -Math.sin(dec) * Math.sin(ra), Math.cos(dec)];
  const toHoriz = v => [dot(v, b.E), dot(v, b.N), dot(v, b.U)];
  return {
    north: perp(toHoriz(tanN), o),
    east: perp(toHoriz(tanE), o),
    zenith: perp([0, 0, 1], o)
  };
}

// Position angle (deg) of direction t measured from reference ref, positive toward 'eastSide'.
function paCCT(t, ref, eastSide, o) {
  // positive rotation is about -o  (counter-clockwise as seen on a non-mirrored sky view)
  const k = scale(o, -1);
  const perpRef = norm(cross(k, ref));
  return Math.atan2(dot(t, perpRef), dot(t, ref)) / rad;
}

function report(label, date, lat, lng) {
  const moon = SunCalc.getMoonPosition(date, lat, lng);
  const illum = SunCalc.getMoonIllumination(date);
  const b = horizBasis(lat, lng, date);
  const o = dirFromAltAz(G.unRefract(moon.altitude), compassAz(moon.azimuth));
  const s = sunDir(date, lat, lng);
  const t = perp(s, o);
  const sb = screenBasis(o);

  const F = skyFrame(o, date, lat, lng);
  const paNorth = paCCT(t, F.north, F.east, o);       // measured from celestial north toward east
  const paZen = paCCT(t, F.zenith, F.east, o);        // measured from the zenith direction toward east
  const q = moon.parallacticAngle / rad;

  const betaMine = Math.atan2(dot(t, sb.r), dot(t, sb.U)) / rad;   // clockwise from up on screen
  const betaPage = illum.angle / rad - moon.parallacticAngle / rad;
  const wrap = x => ((x + 540) % 360) - 180;

  console.log(label.padEnd(22),
    'PA_north=' + wrap(paNorth).toFixed(1).padStart(7),
    'PA_zen=' + wrap(paZen).toFixed(1).padStart(7),
    'Pn-q=' + wrap(paNorth - q).toFixed(1).padStart(7),
    '| zen-(Pn-q)=' + wrap(paZen - (paNorth - q)).toFixed(2).padStart(6),
    '|| betaMine=' + betaMine.toFixed(1).padStart(7),
    'betaPage=' + wrap(betaPage).toFixed(1).padStart(7),
    'betaMine+paZen=' + wrap(betaMine + paZen).toFixed(1).padStart(7));
}

const cases = [
  ['eclipse', new Date('2026-08-28T04:13:00Z'), 52.37, 4.90],
  ['crescent S?', new Date('2026-09-12T20:00:00Z'), 52.37, 4.90],
  ['gibbous', new Date('2026-09-05T20:00:00Z'), 52.37, 4.90],
  ['jan', new Date('2026-01-10T20:00:00Z'), 52.37, 4.90],
  ['sydney', new Date('2026-08-28T10:00:00Z'), -33.87, 151.21],
  ['santiago', new Date('2026-08-28T04:13:00Z'), -33.45, -70.67],
  ['equator', new Date('2026-08-28T04:13:00Z'), 0.1, 4.90]
];
for (const c of cases) report(c[0], c[1], c[2], c[3]);

console.log('\n-- find a waxing moon crossing due south (bright limb must point RIGHT / west) --');
for (let h = 0; h < 24 * 30; h++) {
  const d = new Date(Date.UTC(2026, 8, 1, 0, 0) + h * 3600e3);
  const m = SunCalc.getMoonPosition(d, 52.37, 4.90);
  const il = SunCalc.getMoonIllumination(d);
  const az = ((m.azimuth / rad + 180) % 360);
  if (m.altitude > 20 * rad && Math.abs(az - 180) < 1.2 && il.phase > 0.05 && il.phase < 0.4) {
    const b = horizBasis(52.37, 4.90, d);
    const o = dirFromAltAz(G.unRefract(m.altitude), compassAz(m.azimuth));
    const s = sunDir(d, 52.37, 4.90);
    const t = perp(s, o);
    const sb = screenBasis(o);
    const betaMine = Math.atan2(dot(t, sb.r), dot(t, sb.U)) / rad;
    const betaPage = il.angle / rad - m.parallacticAngle / rad;
    console.log(d.toISOString(), 'az=' + az.toFixed(1), 'alt=' + (m.altitude / rad).toFixed(1),
      'phase=' + il.phase.toFixed(3), 'frac=' + il.fraction.toFixed(2),
      '| betaMine=' + betaMine.toFixed(1), '( +90 = right/west )',
      ' betaPage=' + (((betaPage + 540) % 360) - 180).toFixed(1));
  }
}
