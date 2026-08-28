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
const nasa = JSON.parse(fs.readFileSync('/home/user/work/nasa_contacts.json','utf8'));

const mins = hm => { const [h,m] = hm.split(':').map(Number); return h*60+m; };
const hhmm = ms => new Date(ms).toISOString().slice(11,16);
let worst = 0;
console.log('eclipse      | NASA P1 | model P1 | diff | NASA U1 | model U1 (umbra first reached) | diff');
for (const ev of T.eclipseEvents) {
  const key = new Date(ev.t0).toISOString().slice(0,10);
  const ref = nasa[key]; if (!ref) continue;
  const p1 = T.eclipseFirstContact(ev);
  const d1 = Math.abs(mins(hhmm(p1)) - mins(ref.P1));
  // walk forward from P1 to find the model's U1
  let u1 = null;
  for (let t = p1; t < ev.t0; t += 30000) {
    const st = T.eclipseAt(new Date(t), 52.37, 4.90);
    if (st && st.umbMag > 0) { u1 = t; break; }
  }
  const d2 = (u1 && ref.U1) ? Math.abs(mins(hhmm(u1)) - mins(ref.U1)) : null;
  worst = Math.max(worst, d1, d2 || 0);
  console.log(key, '  |  ', ref.P1, ' |  ', hhmm(p1), ' | ', String(d1).padStart(3), 'm |  ',
    ref.U1, ' |  ', u1 ? hhmm(u1) : '--', '                       | ', d2 === null ? '-' : String(d2).padStart(3)+'m');
}
console.log('\nworst disagreement with NASA:', worst, 'minutes');
