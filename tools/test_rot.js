const fs = require('fs');
const html = fs.readFileSync('/home/user/moon-new-poems-true-dark-side.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const store = {}; const attrs = {};
function makeEl(id) {
  if (store[id]) return store[id];
  attrs[id] = {};
  store[id] = { id, style: {}, setAttribute(k,v){attrs[id][k]=v;}, getAttribute(k){return attrs[id][k];},
    addEventListener(){}, appendChild(){}, remove(){}, textContent:'', hidden:false, lang:'' };
  return store[id];
}
const rootStyle = {};
global.document = { getElementById: makeEl, createElement: () => makeEl('t'+Math.random()),
  documentElement: { style: { setProperty(k,v){ rootStyle[k]=v; } } },
  body:{appendChild(){}}, addEventListener(){}, readyState:'complete' };
global.window = { addEventListener(){} }; global.navigator = { geolocation:null };
global.requestAnimationFrame = ()=>{}; global.fetch = ()=>Promise.resolve({ok:false,json:()=>({})});
const Module = require('module'); const m = new Module('sc'); m._compile(blocks[0],'sc.js'); global.SunCalc = m.exports;
const T = new Function(blocks[1] + '\n;return {refreshMoon, eclipseAt, previewState, togglePreview, eclipseEvents, magnitudeAtGreatest};')();
const DEG = 180/Math.PI;

console.log('--- rotation now matches the true (unmirrored) bright limb ---');
for (const t of ['2026-08-28T04:13:00Z','2026-09-15T21:00:00Z','2026-09-20T21:00:00Z','2026-12-01T18:00:00Z']) {
  const date = new Date(t);
  T.refreshMoon(date);
  const illum = SunCalc.getMoonIllumination(date);
  const mp = SunCalc.getMoonPosition(date, 52.37, 4.90);
  const drawn = store['moonSVG'].style.transform;
  const expected = 'rotate(' + (-(illum.angle*DEG - mp.parallacticAngle*DEG) - 90).toFixed(3) + 'deg)';
  console.log('  ', t, drawn, '| expected', expected, '|', drawn === expected ? 'MATCH' : 'DIFF');
}

console.log('\n--- sweep 3 years hourly: no crashes, shadow only during eclipses ---');
let active = 0, checked = 0, bad = [];
for (let h = 0; h < 24*365*3; h++) {
  const t = Date.parse('2025-01-01T00:00:00Z') + h*3600e3;
  try {
    const st = T.eclipseAt(new Date(t), 52.37, 4.90);
    if (st) { active++; if (st.obscuration < 0 || st.obscuration > 1 || !isFinite(st.sigma)) bad.push(t); }
    checked++;
  } catch (e) { bad.push(t + ' ERR ' + e.message); }
}
console.log('   hours checked', checked, '| hours with an eclipse in progress', active, '| problems', bad.length);
if (bad.length) console.log(bad.slice(0,5));

console.log('\n--- every eclipse in the table: does it run and reach the expected peak? ---');
let rows = [];
for (const ev of T.eclipseEvents) {
  const st = T.eclipseAt(new Date(ev.t0), 0, 0);
  const mag = T.magnitudeAtGreatest(ev);
  rows.push([new Date(ev.t0).toISOString().slice(0,10), mag.toFixed(3), st ? st.umbMag.toFixed(3) : 'none', st ? (st.obscuration*100).toFixed(0)+'%' : '-']);
}
console.log('   ' + rows.slice(0,6).map(r=>r.join(' | ')).join('\n   '));
console.log('   ...');
console.log('   ' + rows.slice(-3).map(r=>r.join(' | ')).join('\n   '));
const missing = rows.filter(r => r[2] === 'none');
console.log('   events with no computed state at greatest:', missing.length, missing.slice(0,3));

console.log('\n--- preview button ---');
T.togglePreview();
console.log('   active:', T.previewState.active, 'start:', new Date(T.previewState.t).toISOString(),
            '| event:', new Date(T.previewState.lastT0).toISOString());
T.togglePreview(); T.togglePreview();
console.log('   after cycling, second event:', new Date(T.previewState.lastT0).toISOString());
