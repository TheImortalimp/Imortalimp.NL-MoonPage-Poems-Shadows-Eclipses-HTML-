// The maria must follow the Moon's pole, not the Sun: over the full-moon day
// the old (bright-limb) rotation swung wildly. Compare old and new.
const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  const rows = await page.evaluate(() => {
    const out = [];
    for (let h = 0; h < 24; h++) {
      const t = Date.UTC(2026, 7, 28, h, 0, 0);
      refreshMoon(new Date(t));
      const R = parseFloat(document.getElementById('moonSVG').style.transform.match(/-?[\d.]+/)[0]);
      const tr = document.getElementById('moonMaria').getAttribute('transform') || '';
      const A = parseFloat((tr.match(/rotate\((-?[\d.]+)/) || [0, 0])[1]);
      const dx = parseFloat((tr.match(/translate\((-?[\d.]+)/) || [0, 0])[1]);
      const dy = parseFloat((tr.match(/translate\(-?[\d.]+ (-?[\d.]+)\)/) || [0, 0])[1]);
      const illum = SunCalc.getMoonIllumination(new Date(t));
      const pa = SunCalc.getMoonPosition(new Date(t), observerPos.lat, observerPos.lng).parallacticAngle * 180 / Math.PI;
      const o = moonOrientation(new Date(t), observerPos.lat, observerPos.lng);
      out.push({ h, R, A, dx, dy, l: o.l, b: o.b, P: o.P, pa, lit: illum.fraction * 100 });
    }
    return out;
  });

  console.log('Full moon day, 2026-08-28, Amsterdam (52.37N 4.90E)');
  console.log(' UT    lit%   old face (R)   new face (R+A)   libration dx,dy     l      b      P     parallactic');
  let prevOld = null, prevNew = null, maxOld = 0, maxNew = 0;
  for (const r of rows) {
    const net = r.R + r.A;
    if (prevOld !== null) {
      maxOld = Math.max(maxOld, Math.abs(((r.R - prevOld + 540) % 360) - 180));
      maxNew = Math.max(maxNew, Math.abs(((net - prevNew + 540) % 360) - 180));
    }
    prevOld = r.R; prevNew = net;
    console.log('  ' + String(r.h).padStart(2, '0') + ':00',
      r.lit.toFixed(1).padStart(6),
      r.R.toFixed(1).padStart(12),
      net.toFixed(1).padStart(15),
      (r.dx.toFixed(1) + ',' + r.dy.toFixed(1)).padStart(14),
      r.l.toFixed(2).padStart(7), r.b.toFixed(2).padStart(7), r.P.toFixed(2).padStart(8),
      r.pa.toFixed(2).padStart(10));
  }
  const span = a => {
    let lo = Math.min(...a), hi = Math.max(...a);
    return hi - lo;
  };
  console.log('\n  total swing over the day   old: ' + span(rows.map(r => r.R)).toFixed(0) +
              '°   new: ' + span(rows.map(r => r.R + r.A)).toFixed(0) + '°');
  console.log('  biggest hour-to-hour jump old: ' + maxOld.toFixed(1) + '°   new: ' + maxNew.toFixed(1) + '°');

  console.log('\n--- libration against JPL Horizons (18:00-23:00 UT, Amsterdam) ---');
  const REF = [[18, -4.5472, -0.5519, 339.0592], [19, -4.5792, -0.6033, 339.0004],
               [20, -4.6439, -0.6696, 338.9474], [21, -4.7381, -0.7506, 338.8995],
               [22, -4.8569, -0.8451, 338.8557], [23, -4.9934, -0.9509, 338.8151]];
  for (const [h, lr, br, pr] of REF) {
    const r = rows.find(x => x.h === h);
    console.log('  ' + h + ':00  l ' + r.l.toFixed(3).padStart(8) + ' vs JPL ' + lr.toFixed(3).padStart(8) +
      '   b ' + r.b.toFixed(3).padStart(7) + ' vs ' + br.toFixed(3).padStart(7) +
      '   P ' + r.P.toFixed(3).padStart(8) + ' vs ' + pr.toFixed(3).padStart(8));
  }

  console.log('\n--- same instant, five places: does the locale change the drawing? ---');
  const places = await page.evaluate(() => {
    const t = Date.UTC(2026, 7, 28, 20, 0, 0);
    const out = [];
    for (const [name, lat, lng] of [['Amsterdam', 52.37, 4.90], ['Sydney', -33.87, 151.21],
                                    ['Cape Town', -33.92, 18.42], ['Singapore', 1.35, 103.82],
                                    ['Anchorage', 61.22, -149.90]]) {
      const o = moonOrientation(new Date(t), lat, lng);
      const pa = SunCalc.getMoonPosition(new Date(t), lat, lng).parallacticAngle * 180 / Math.PI;
      out.push({ name, l: o.l, b: o.b, P: o.P, pa, face: (pa - o.P - 90 + 720) % 360 });
    }
    return out;
  });
  for (const p of places) {
    console.log('  ' + p.name.padEnd(10), 'l', p.l.toFixed(2).padStart(7), ' b', p.b.toFixed(2).padStart(6),
      '  face drawn at', p.face.toFixed(1).padStart(7) + '°');
  }
  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
})();
