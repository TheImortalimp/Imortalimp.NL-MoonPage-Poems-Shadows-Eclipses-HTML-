// Load the patched page's script with a minimal DOM stub and check the eclipse maths.
const fs = require('fs');
const html = fs.readFileSync('/home/user/moon-new-poems-true-dark-side.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const suncalc = blocks[0];
const app = blocks[1];

const store = {};
const attrs = {};
function makeEl(id) {
  if (store[id]) return store[id];
  const a = {};
  attrs[id] = a;
  store[id] = {
    id, style: { setProperty(k, v) { a['style:' + k] = v; } },
    setAttribute(k, v) { a[k] = v; }, getAttribute(k) { return a[k]; },
    addEventListener() {}, appendChild() {}, remove() {},
    classList: { add() {}, remove() {} },
    textContent: '', innerHTML: '', hidden: false, lang: ''
  };
  return store[id];
}
const rootStyle = {};
global.document = {
  getElementById: makeEl,
  createElement: () => makeEl('tmp' + Math.random()),
  documentElement: { style: { setProperty(k, v) { rootStyle[k] = v; } } },
  body: { appendChild() {} }, addEventListener() {}, readyState: 'complete'
};
global.window = { addEventListener() {} };
global.navigator = { geolocation: null };               // -> falls back to Amsterdam
global.requestAnimationFrame = () => {};
global.fetch = () => Promise.resolve({ ok: false, json: () => ({}) });
global.performance = { now: () => 0 };

// SunCalc first (it exports itself to module.exports when present)
const Module = require('module');
const m = new Module('suncalc');
m._compile(suncalc, 'suncalc.js');
global.SunCalc = m.exports;

const runner = new Function(app + '\n;return { eclipseAt, eclipseShadowAngle, refreshMoon, ' +
  'updateEclipseShadows, eclipseEvents, magnitudeAtGreatest, nextEclipseAfter, ' +
  'previewState, togglePreview, solarElements, DEG, updateMoonVisual };');
const T = runner();

const DEG = 180 / Math.PI;
const iso = ms => new Date(ms).toISOString().slice(0, 16).replace('T', ' ');

console.log('--- 1. syntax + load: OK,', T.eclipseEvents.length, 'eclipses in table ---');
console.log('next eclipse after now:', iso(T.nextEclipseAfter(Date.now()).t0));

console.log('\n--- 2. 2026-08-28 deep partial, as seen from Amsterdam ---');
const show = t => {
  const st = T.eclipseAt(new Date(t), 52.37, 4.90);
  return st ? `umbMag=${st.umbMag.toFixed(4)} penMag=${st.penMag.toFixed(3)} ` +
      `obsc=${(st.obscuration * 100).toFixed(1)}% sigma=${st.sigma.toFixed(4)} ` +
      `rhoU=${st.rhoU.toFixed(4)} rMoon=${st.rMoon.toFixed(4)}` : 'no eclipse';
};
for (const t of ['2026-08-28T01:20:00Z', '2026-08-28T02:30:00Z', '2026-08-28T02:40:00Z',
                 '2026-08-28T04:13:00Z', '2026-08-28T05:45:00Z', '2026-08-28T05:55:00Z',
                 '2026-08-28T07:05:00Z']) {
  console.log('  ', t.replace('T', ' ').replace(':00Z', ''), show(t));
}

console.log('\n--- 3. contact times (NASA: P1 01:24, U1 02:34, max 04:13, U4 05:52, P4 07:02) ---');
let prev = null;
for (let min = 60; min < 440; min += 1) {
  const t = Date.parse('2026-08-28T00:00:00Z') + min * 60000;
  const st = T.eclipseAt(new Date(t), 52.37, 4.90);
  const state = st ? (st.umbMag > 0 ? 'umbra' : 'penumbra') : 'clear';
  if (state !== prev) {
    console.log('   ', iso(t).slice(11), '->', state);
    prev = state;
  }
}

console.log('\n--- 4. shadow placement at greatest eclipse (gamma +0.4964 = Moon north of axis,');
console.log('        so the shadow centre must lie ECLIPTIC SOUTH of the Moon) ---');
function placement(t, lat, lng, label) {
  const date = new Date(t);
  const illum = SunCalc.getMoonIllumination(date);
  const moonPos = SunCalc.getMoonPosition(date, lat, lng);
  const st = T.eclipseAt(date, lat, lng);
  if (!st) { console.log(label, 'no eclipse'); return; }
  const angle = T.eclipseShadowAngle(date, lat, lng, st, moonPos, illum);
  // independent check: where does ecliptic north sit on the screen?
  const alt = moonPos.altitude, az = moonPos.azimuth + Math.PI;
  const mv = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
  const flat = Math.hypot(mv[0], mv[1]);
  const facing = [mv[0] / flat, mv[1] / flat, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const right = cr(facing, [0, 0, 1]);
  const nn = Math.hypot(...[0, 0, 1].map((v, i) => [0, 0, 1][i] - mv[i] * mv[2]));
  const up = [0, 0, 1].map((v, i) => ([0, 0, 1][i] - mv[i] * mv[2]) / nn);
  const northDir = T.solarElements ? null : null;
  const north = T.eclipseShadowAngle ? (function () {
    const ls = T.solarElements(date).lon / DEG;
    const eps = (23.439291 - 0.0000004 * ((date.valueOf() / 86400000) - 0.5 + 2440588 - 2451545)) / DEG;
    const v = [0, 0, 1];
    const eq = [v[0], v[1] * Math.cos(eps) - v[2] * Math.sin(eps), v[1] * Math.sin(eps) + v[2] * Math.cos(eps)];
    const days = date.valueOf() / 86400000 - 0.5 + 2440588 - 2451545;
    const phi = lat / DEG, th = (280.16 + 360.9856235 * days) / DEG + lng / DEG;
    const E = [-Math.sin(th), Math.cos(th), 0];
    const N = [-Math.sin(phi) * Math.cos(th), -Math.sin(phi) * Math.sin(th), Math.cos(phi)];
    const U = [Math.cos(phi) * Math.cos(th), Math.cos(phi) * Math.sin(th), Math.sin(phi)];
    const h = [dt(eq, E), dt(eq, N), dt(eq, U)];
    let u = h.map((x, i) => x - mv[i] * dt(h, mv));
    const n2 = Math.hypot(...u); u = u.map(x => x / n2);
    return Math.atan2(dt(u, right), dt(u, up)) * DEG;
  })() : 0;
  const betaSun = -((illum.angle || 0) * DEG - (moonPos.parallacticAngle || 0) * DEG);
  console.log('  ', label, 'drawingAngle=' + angle.toFixed(1),
    '| screen angle of ecliptic north=' + north.toFixed(1),
    '| shadow bearing (screen)=' + ((angle + betaSun + 540) % 360 - 180).toFixed(1),
    '| difference from south=' + ((((angle + betaSun + 540) % 360 - 180) - (north + 180) + 540) % 360 - 180).toFixed(1));
}
placement('2026-08-28T04:13:00Z', 52.37, 4.90, 'Amsterdam 04:13Z ');
placement('2026-08-28T04:13:00Z', -33.45, -70.67, 'Santiago  04:13Z ');
placement('2026-08-28T04:13:00Z', -33.87, 151.21, 'Sydney    04:13Z ');
placement('2026-08-28T02:50:00Z', 52.37, 4.90, 'Amsterdam 02:50Z ');
placement('2026-08-28T05:40:00Z', 52.37, 4.90, 'Amsterdam 05:40Z ');

console.log('\n--- 5. full render for the eclipse moment (SVG attributes written) ---');
T.refreshMoon(new Date('2026-08-28T04:13:00Z'));
console.log('   umbra   ', JSON.stringify(attrs['umbraShadow']));
console.log('   penumbra', JSON.stringify(attrs['penumbraShadow']));
console.log('   layer opacity', attrs['eclipseShadows'].opacity);
console.log('   umbra stop3', attrs['umbraStop3']['stop-color'], attrs['umbraStop3']['stop-opacity']);
console.log('   status:', JSON.stringify(store['eclipseStatus'].textContent), 'class=', store['eclipseStatus'].className);
console.log('   moon rotation:', store['moonSVG'].style['style:transform']);

console.log('\n--- 6. a quiet moment (no eclipse) ---');
T.refreshMoon(new Date('2026-09-15T21:00:00Z'));
console.log('   layer opacity', attrs['eclipseShadows'].opacity);
console.log('   status:', JSON.stringify(store['eclipseStatus'].textContent));
