// Shared geometry helpers.  Everything is expressed in the local horizontal
// frame as [east, north, up] components (right handed: east x north = up).
const SunCalc = require('./suncalc.js');

const rad = Math.PI / 180;
const J1970 = 2440588, J2000 = 2451545, dayMs = 86400000;
const toDays = date => date.valueOf() / dayMs - 0.5 + J1970 - J2000;

// SunCalc's refraction correction, undone so directions stay geometric.
function unRefract(h) {
  if (h <= 0) return h;
  return h - 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// Local mean sidereal time (rad) - same series SunCalc uses.
const lst = (days, lngDeg) => rad * (280.16 + 360.9856235 * days) + rad * lngDeg;
const obliquity = days => 23.439291 - 0.0000004 * days;

// Horizontal basis (east, north, up) expressed in equatorial xyz.
function horizBasis(latDeg, lngDeg, date) {
  const phi = latDeg * rad, th = lst(toDays(date), lngDeg);
  return {
    E: [-Math.sin(th), Math.cos(th), 0],
    N: [-Math.sin(phi) * Math.cos(th), -Math.sin(phi) * Math.sin(th), Math.cos(phi)],
    U: [Math.cos(phi) * Math.cos(th), Math.cos(phi) * Math.sin(th), Math.sin(phi)]
  };
}

// SunCalc azimuth is measured from south toward west; return compass azimuth (rad).
const compassAz = az => az + Math.PI;

// Build a horizontal-frame unit vector from altitude + compass azimuth.
function dirFromAltAz(alt, az) {
  const ca = Math.cos(alt);
  return [ca * Math.sin(az), ca * Math.cos(az), Math.sin(alt)];
}

// Geocentric ecliptic longitude of the Sun (deg) - same low precision series SunCalc uses.
function sunEclipticLongitude(date) {
  const d = toDays(date);
  const M = rad * (357.5291 + 0.98560028 * d);
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  return (((M + C + rad * 102.9372 + Math.PI) / rad) % 360 + 360) % 360;
}

// Ecliptic xyz -> horizontal frame components.
function eclipticToHoriz(v, date, latDeg, lngDeg) {
  const e = obliquity(toDays(date)) * rad;
  const eq = [v[0], v[1] * Math.cos(e) - v[2] * Math.sin(e), v[1] * Math.sin(e) + v[2] * Math.cos(e)];
  const b = horizBasis(latDeg, lngDeg, date);
  return [dot(eq, b.E), dot(eq, b.N), dot(eq, b.U)];
}

// Geocentric sun direction in the horizontal frame.
function sunDir(date, latDeg, lngDeg) {
  const l = sunEclipticLongitude(date) * rad;
  return eclipticToHoriz([Math.cos(l), Math.sin(l), 0], date, latDeg, lngDeg);
}

// Screen frame for an observer facing the object, zenith up (non-mirrored sky view).
// objDir is in horizontal [east, north, up] components, so "up" is simply [0,0,1].
// right = facing x up   (facing south -> right = west)
function screenBasis(objDir) {
  const f = norm([objDir[0], objDir[1], 0]);
  return { r: cross(f, [0, 0, 1]), U: perp([0, 0, 1], objDir) };  // U = zenith projected on the sky
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const n = Math.hypot(a[0], a[1], a[2]); return [a[0] / n, a[1] / n, a[2] / n]; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const perp = (v, n) => norm(sub(v, scale(n, dot(v, n))));

module.exports = { SunCalc, rad, toDays, unRefract, lst, obliquity, horizBasis, compassAz,
  dirFromAltAz, sunEclipticLongitude, eclipticToHoriz, sunDir, screenBasis,
  dot, cross, norm, sub, add, scale, perp };
