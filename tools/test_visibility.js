// Which upcoming eclipses can Amsterdam actually SEE?
// An eclipse is only an event for you if the Moon is above your horizon while it runs.
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
const rootStyle = {};
global.document = {
  getElementById: makeEl,
  createElement: () => makeEl('tmp' + Math.random()),
  documentElement: { style: { setProperty(k, v) { rootStyle[k] = v; } } },
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

const T = new Function(blocks[1] + '\n;return { eclipseAt, eclipseEvents, magnitudeAtGreatest, ' +
  'eclipseFirstContact, eclipseKind, nextEclipseAfter, solarElements };')();

const DEG = 180 / Math.PI;
const LAT = 52.37, LNG = 4.90;                       // Amsterdam
const alt = ms => SunCalc.getMoonPosition(new Date(ms), LAT, LNG).altitude * DEG;
const sunAlt = ms => SunCalc.getPosition(new Date(ms), LAT, LNG).altitude * DEG;

// The model's track is symmetric about greatest, so last contact = 2*t0 - first.
function span(ev) {
  const first = T.eclipseFirstContact(ev);
  return { first, last: 2 * ev.t0 - first };
}

console.log('From Amsterdam 52.37N 4.90E — is the Moon up while the eclipse runs?\n');
console.log('greatest (UTC)      kind        mag     P1-P4 (UTC)        Moon alt  verdict');
console.log('-'.repeat(88));

const now = Date.now();
let ev = T.nextEclipseAfter(now - 3 * 3600e3);
let rows = 0, invisible = 0;
while (ev && rows < 14) {
  const { first, last } = span(ev);
  const mag = T.magnitudeAtGreatest(ev);
  const kind = T.eclipseKind(mag);
  let aMax = -90;
  for (let t = first; t <= last; t += 5 * 60e3) aMax = Math.max(aMax, alt(t));
  aMax = Math.max(aMax, alt(last));
  const vis = aMax > 4;
  if (!vis) invisible++;
  const fmt = ms => new Date(ms).toISOString().slice(5, 16).replace('T', ' ');
  console.log(
    fmt(ev.t0).padEnd(20),
    kind.padEnd(11),
    mag.toFixed(3).padStart(6),
    (fmt(first) + ' → ' + fmt(last).slice(6)).padEnd(20),
    (aMax.toFixed(1) + '°').padStart(8),
    ' ' + (vis ? 'visible' : 'BELOW HORIZON (invisible)'));
  ev = T.nextEclipseAfter(ev.t0 + 1);
  rows++;
}
console.log('-'.repeat(88));
console.log(invisible, 'of', rows, 'upcoming eclipses are unobservable from Amsterdam at any point.');
console.log('sun altitude during the sample eclipse:',
  sunAlt(T.eclipseEvents.find(e => e.t0 > now).t0).toFixed(1) + '° (must be below 0)');
