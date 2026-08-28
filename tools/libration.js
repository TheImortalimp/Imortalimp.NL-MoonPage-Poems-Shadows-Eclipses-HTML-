// The Moon's orientation as seen by one observer at one instant:
//   l, b  selenographic coordinates of the sub-observer point (the libration),
//         east-positive, including the diurnal term from where you stand.
//   P     position angle of the Moon's north pole, CCW from celestial north.
// Validated against JPL Horizons (ObsSub-LON/LAT and NP.ang).
const fs = require('fs');
const Module = require('module');
const m = new Module('suncalc');
m._compile(fs.readFileSync('/home/user/work/suncalc.js', 'utf8'), 'suncalc.js');
const SunCalc = m.exports;

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const scale = (a, k) => [a[0]*k, a[1]*k, a[2]*k];
const norm = a => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/n, a[1]/n, a[2]/n]; };
const eclVec = (lon, lat) => {
  const l = lon * D2R, b = lat * D2R;
  return [Math.cos(b) * Math.cos(l), Math.cos(b) * Math.sin(l), Math.sin(b)];
};
const toEcliptic = v => {                       // equatorial -> ecliptic
  const e = 23.4392911 * D2R, c = Math.cos(e), s = Math.sin(e);
  return [v[0], v[1] * c + v[2] * s, -v[1] * s + v[2] * c];
};
const julianDay = date => date.getTime() / 86400000 - 0.5 + 2440588;

// --- the Moon's geocentric ecliptic position ------------------------------
// Series A is SunCalc's own (one term each). Series B adds the main
// perturbations; whichever agrees with JPL Horizons is the one to keep.
function moonEcl(d, series) {
  const L = 218.3164477 + 13.17639648 * d;      // mean longitude
  const D = 297.8501921 + 12.19074912 * d;      // mean elongation
  const M = 134.9633964 + 13.06499295 * d;      // Moon mean anomaly
  const Mp = 357.5291092 + 0.98560028 * d;      // Sun mean anomaly
  const F = 93.2720950 + 13.22935024 * d;       // argument of latitude
  const r = x => x * D2R;
  let lon = L, lat = 0, dist = 385000.6;
  lon += 6.289 * Math.sin(r(M));
  lat += 5.128 * Math.sin(r(F));
  dist -= 20905 * Math.cos(r(M));
  if (series === 'B') {
    lon += 1.274 * Math.sin(r(2*D - M))
        +  0.658 * Math.sin(r(2*D))
        +  0.214 * Math.sin(r(2*M))
        -  0.186 * Math.sin(r(Mp))
        -  0.114 * Math.sin(r(2*F))
        +  0.059 * Math.sin(r(2*D - 2*M))
        +  0.057 * Math.sin(r(2*D - Mp - M))
        +  0.053 * Math.sin(r(2*D + M));
    lat += 0.281 * Math.sin(r(M + F))
        -  0.278 * Math.sin(r(F - M))
        -  0.173 * Math.sin(r(F - 2*D));
    dist += -3699 * Math.cos(r(2*D - M))
          -  2956 * Math.cos(r(2*D))
          -   570 * Math.cos(r(2*M));
  }
  return { lon: ((lon % 360) + 360) % 360, lat, dist };
}

// geocentric position of the observer, equatorial, km (WGS84)
function observerVector(date, latDeg, lngDeg) {
  const jd = julianDay(date);
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) * D2R;
  const lst = gmst + lngDeg * D2R;
  const phi = latDeg * D2R;
  const a = 6378.137, f = 1 / 298.257223563, e2 = f * (2 - f);
  const sp = Math.sin(phi), cp = Math.cos(phi);
  const N = a / Math.sqrt(1 - e2 * sp * sp);
  return [N * cp * Math.cos(lst), N * cp * Math.sin(lst), N * (1 - e2) * sp];
}

function moonOrientation(date, latDeg, lngDeg, series) {
  series = series || 'B';
  const d = julianDay(date) - 2451545.0;

  // Cassini's laws: the lunar pole sits 1.5424 deg from the ecliptic pole, on
  // the far side of it from the orbit pole (node + 90 deg of longitude).
  const node = 125.0445479 - 0.0529538083 * d;
  const I = 1.54242;
  const pole = eclVec(node + 90, 90 - I);
  const prime = eclVec(218.3164477 + 13.17639648 * d + 180, 0);   // mean long + 180
  const east90 = norm(cross(pole, prime));

  const mc = moonEcl(d, series);
  const moonVec = scale(eclVec(mc.lon, mc.lat), mc.dist);
  const obsEcl = toEcliptic(observerVector(date, latDeg, lngDeg));
  const toObs = norm(sub(obsEcl, moonVec));           // Moon -> observer

  const b = Math.asin(Math.max(-1, Math.min(1, dot(toObs, pole)))) * R2D;
  const l = Math.atan2(dot(toObs, east90), dot(toObs, prime)) * R2D;

  // Position angle of the pole: project the pole and celestial north onto the
  // sky and measure counter-clockwise from north towards east.
  const sight = scale(toObs, -1);
  const northEcl = toEcliptic([0, 0, 1]);
  const nHat = norm(sub(northEcl, scale(sight, dot(northEcl, sight))));
  const eHat = norm(cross(northEcl, sight));
  const pPerp = sub(pole, scale(sight, dot(pole, sight)));
  let P = Math.atan2(dot(pPerp, eHat), dot(pPerp, nHat)) * R2D;
  if (P < 0) P += 360;
  return { l: ((l + 180) % 360 + 360) % 360 - 180, b, P };
}

module.exports = { moonOrientation, julianDay };

// ------------------------------------------------------------------ checks
if (require.main === module) {
  const wrap = a => ((a + 180) % 360 + 360) % 360 - 180;

  // JPL Horizons, DE441, topocentric: ObsSub-LON, ObsSub-LAT, NP.ang
  const REF = [
    ['2026-08-28T18:00:00Z', 52.37, 4.90, 355.452806, -0.551886, 339.0592],
    ['2026-08-28T19:00:00Z', 52.37, 4.90, 355.420827, -0.603261, 339.0004],
    ['2026-08-28T20:00:00Z', 52.37, 4.90, 355.356141, -0.669562, 338.9474],
    ['2026-08-28T21:00:00Z', 52.37, 4.90, 355.261853, -0.750602, 338.8995],
    ['2026-08-28T22:00:00Z', 52.37, 4.90, 355.143076, -0.845123, 338.8557],
    ['2026-08-28T23:00:00Z', 52.37, 4.90, 355.006635, -0.950866, 338.8151]
  ];
  if (fs.existsSync('/home/user/work/horizons_ref.json')) {
    for (const r of JSON.parse(fs.readFileSync('/home/user/work/horizons_ref.json', 'utf8'))) REF.push(r);
  }

  for (const series of ['A', 'B']) {
    console.log('\n===== lunar series ' + series +
      (series === 'A' ? ' (SunCalc: 1 term)' : ' (+ main perturbations)') + ' =====');
    console.log('date (UT)         site          l: model / JPL      b: model / JPL      P: model / JPL');
    let worst = { l: 0, b: 0, P: 0 };
    for (const [iso, lat, lng, lRef, bRef, pRef] of REF) {
      const o = moonOrientation(new Date(iso), lat, lng, series);
      const dl = wrap(o.l - lRef), db = o.b - bRef, dP = wrap(o.P - pRef);
      worst.l = Math.max(worst.l, Math.abs(dl));
      worst.b = Math.max(worst.b, Math.abs(db));
      worst.P = Math.max(worst.P, Math.abs(dP));
      console.log('  ' + iso.replace('T', ' ').slice(0, 16),
        (lat + ',' + lng).padEnd(13),
        (wrap(o.l).toFixed(2) + ' / ' + wrap(lRef).toFixed(2)).padEnd(19),
        (o.b.toFixed(2) + ' / ' + bRef.toFixed(2)).padEnd(19),
        (o.P.toFixed(2) + ' / ' + pRef.toFixed(2)).padEnd(14),
        ' d=' + dl.toFixed(2) + ' ' + db.toFixed(2) + ' ' + dP.toFixed(2));
    }
    console.log('  worst: l ' + worst.l.toFixed(2) + '°  b ' + worst.b.toFixed(2) + '°  P ' + worst.P.toFixed(2) + '°');
  }
}
