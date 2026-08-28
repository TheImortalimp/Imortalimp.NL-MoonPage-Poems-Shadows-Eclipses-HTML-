// Does the countdown point at an eclipse you can actually see from where you are?
const fs = require('fs');
const html = fs.readFileSync('/home/user/moon-new-poems-true-dark-side.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

const store = {}, attrs = {};
function makeEl(id) {
  if (store[id]) return store[id];
  const a = {}; attrs[id] = a;
  store[id] = {
    id, style: { setProperty(k, v) { a['style:' + k] = v; } },
    setAttribute(k, v) { a[k] = v; }, getAttribute(k) { return a[k]; },
    addEventListener() {}, appendChild() {}, remove() {},
    classList: { add() {}, remove() {} },
    textContent: '', innerHTML: '', hidden: false, lang: ''
  };
  return store[id];
}
global.document = {
  getElementById: makeEl,
  createElement: () => makeEl('tmp' + Math.random()),
  documentElement: { style: { setProperty() {} } },
  body: { appendChild() {} }, addEventListener() {}, readyState: 'complete'
};
global.window = { addEventListener() {} };
global.navigator = { geolocation: null };
global.requestAnimationFrame = () => {};
global.fetch = () => Promise.resolve({ ok: false, json: () => ({}) });
global.performance = { now: () => 0 };

const Module = require('module');
const m = new Module('suncalc');
m._compile(blocks[0], 'suncalc.js');
global.SunCalc = m.exports;

const T = new Function(blocks[1] + '\n;return { nextEclipseAfter, eclipseVisibility, ' +
  'magnitudeAtGreatest, penumbralMagnitudeAtGreatest, eclipseFirstContact, ' +
  'updateEclipseStatus, setObserver: (lat, lng) => { observerPos = { lat: lat, lng: lng }; ' +
  'nextEclipseCache = null; visibilityCache.clear(); } };')();

const places = [
  ['Amsterdam ', 52.37, 4.90],
  ['Cape Town ', -33.92, 18.42],
  ['Sydney    ', -33.87, 151.21],
  ['Anchorage ', 61.22, -149.90],
  ['Singapore ', 1.35, 103.82]
];

for (const [name, lat, lng] of places) {
  T.setObserver(lat, lng);
  T.updateEclipseStatus();
  const line = global.document.getElementById('eclipseStatus').textContent;
  console.log(name, line.replace('🌍 ', ''));
}

console.log('\n--- the next three eclipses Amsterdam will be offered, in order ---');
T.setObserver(52.37, 4.90);
let after = Date.now(), seen = 0;
while (seen < 3) {
  const ev = T.nextEclipseAfter(after, undefined, true);
  if (!ev) break;
  const any = T.nextEclipseAfter(after);
  const skipped = any && any.t0 !== ev.t0
    ? '   (skipped ' + new Date(any.t0).toISOString().slice(0, 10) +
      ': penMag ' + T.penumbralMagnitudeAtGreatest(any).toFixed(3) +
      ', Moon max ' + T.eclipseVisibility(any).maxAlt.toFixed(1) + '°)'
    : '';
  const v = T.eclipseVisibility(ev);
  console.log(new Date(ev.t0).toISOString().slice(0, 10),
    'mag', T.magnitudeAtGreatest(ev).toFixed(3).padStart(6),
    'penMag', T.penumbralMagnitudeAtGreatest(ev).toFixed(3).padStart(6),
    'Moon up to', v.maxAlt.toFixed(1).padStart(5) + '°', skipped);
  after = ev.t0 + 1;
  seen++;
}
