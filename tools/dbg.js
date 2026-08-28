const fs = require('fs');
const html = fs.readFileSync('/home/user/moon-new-poems-true-dark-side.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const store = {};
const mk = id => store[id] || (store[id] = { id, style:{}, setAttribute(){}, getAttribute(){return '0';},
  addEventListener(){}, appendChild(){}, textContent:'', hidden:false, lang:'' });
global.document = { getElementById: mk, createElement: () => mk('t'),
  documentElement:{style:{setProperty(){}}}, body:{appendChild(){}}, addEventListener(){}, readyState:'complete' };
global.window={addEventListener(){}}; global.navigator={geolocation:null};
global.requestAnimationFrame=()=>{}; global.fetch=()=>Promise.resolve({ok:false,json:()=>({})});
const Module=require('module'); const m=new Module('sc'); m._compile(blocks[0],'sc.js'); global.SunCalc=m.exports;
const T = new Function(blocks[1]+'\n;return {eclipseEvents,eclipseFirstContact,shadowDriftRate,solarElements,' +
  'R_EARTH_KM,R_MOON_KM,R_SUN_KM,UMBRA_ENLARGE,PENUMBRA_ENLARGE,DEG};')();
const {R_EARTH_KM,R_MOON_KM,R_SUN_KM,UMBRA_ENLARGE,PENUMBRA_ENLARGE,DEG}=T;
for (const ev of T.eclipseEvents) {
  const key = new Date(ev.t0).toISOString().slice(0,10);
  if (!['2028-01-12','2026-08-28','2025-03-14'].includes(key)) continue;
  const date = new Date(ev.t0);
  const dMoon = SunCalc.getMoonPosition(date,0,0).distance, dSun = T.solarElements(date).dist;
  const pMoon = Math.asin(R_EARTH_KM/dMoon)*DEG, pSun = Math.asin(R_EARTH_KM/dSun)*DEG;
  const sunSemi = Math.asin(R_SUN_KM/dSun)*DEG, rMoon = Math.asin(R_MOON_KM/dMoon)*DEG;
  const rhoU = UMBRA_ENLARGE*(pMoon+pSun-sunSemi), rhoP = PENUMBRA_ENLARGE*(pMoon+pSun+sunSemi);
  const sigmaMin = Math.abs(ev.gamma)*pMoon;
  const reachU = rhoU+rMoon, reachP = rhoP+rMoon;
  const reach = sigmaMin < reachU ? reachU : reachP;
  const derived = 2*Math.sqrt(Math.max(1e-9, reach*reach-sigmaMin*sigmaMin))/(ev.dur/60);
  const theory = T.shadowDriftRate(date);
  console.log(key, 'dur', ev.dur, '| pMoon', pMoon.toFixed(4), 'rMoon', rMoon.toFixed(4),
    '| sigmaMin', sigmaMin.toFixed(4), 'reachU', reachU.toFixed(4), 'reachP', reachP.toFixed(4),
    '\n            derived rate', derived.toFixed(4), '| theory', theory.toFixed(4),
    '| in band(0.40-0.62):', (derived>0.40&&derived<0.62),
    '| P1', new Date(T.eclipseFirstContact(ev)).toISOString().slice(11,16));
}
