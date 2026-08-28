const fs = require('fs');
const html = fs.readFileSync('/home/user/moon-new-poems-true-dark-side.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const store = {};
const mk = id => store[id] || (store[id] = { id, style: {}, setAttribute(){}, getAttribute(){return '0';},
  addEventListener(){}, appendChild(){}, textContent:'', hidden:false, lang:'' });
global.document = { getElementById: mk, createElement: () => mk('t'), 
  documentElement: { style: { setProperty(){} } }, body:{appendChild(){}}, addEventListener(){}, readyState:'complete' };
global.window = { addEventListener(){} }; global.navigator = { geolocation:null };
global.requestAnimationFrame = ()=>{}; global.fetch = ()=>Promise.resolve({ok:false,json:()=>({})});
const Module = require('module'); const m = new Module('sc'); m._compile(blocks[0],'sc.js'); global.SunCalc = m.exports;
const T = new Function(blocks[1] + '\n;return {eclipseEvents, eclipseFirstContact, magnitudeAtGreatest, eclipseAt};')();

console.log('first contact (model) vs NASA P1:');
const nasa = { '2026-08-28': '01:24', '2025-03-14': '03:57', '2025-09-07': '15:28', '2027-02-20': '21:12', '2028-12-31': '13:40' };
for (const ev of T.eclipseEvents) {
  const iso = new Date(ev.t0).toISOString().slice(0, 10);
  if (!nasa[iso]) continue;
  const p1 = new Date(T.eclipseFirstContact(ev)).toISOString().slice(11, 16).replace('T', '');
  console.log('  ', iso, '| model P1', p1, '| NASA', nasa[iso],
    '| mag', T.magnitudeAtGreatest(ev).toFixed(3));
}
