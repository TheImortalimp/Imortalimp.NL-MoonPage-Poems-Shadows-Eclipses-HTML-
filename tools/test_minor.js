// The preview must reach the minor partials and the penumbral events too, and
// report the Moon's phase on the date it is showing.
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

  // walk the menu itself: every entry must be previewable
  const menu = await page.evaluate(() => {
    const sel = document.getElementById('eclipseSelect');
    return [...sel.options].map(o => ({ v: o.value, t: o.textContent }));
  });
  console.log('menu entries:', menu.length - 1, 'eclipses (plus the placeholder)');
  console.log('first five:');
  menu.slice(1, 6).forEach(o => console.log('   ', o.t));

  const rows = await page.evaluate(() => {
    const sel = document.getElementById('eclipseSelect');
    const out = [];
    const opts = [...sel.options].filter(o => o.value);
    for (const opt of opts.slice(0, 8)) {
      sel.value = opt.value;
      sel.dispatchEvent(new Event('change'));
      const ev = eclipseEvents.find(e => e.t0 === Number(opt.value));
      const at = t => {
        previewState.t = t;
        refreshMoon();
        return document.getElementById('eclipseStatus').textContent;
      };
      out.push({
        date: new Date(ev.t0).toISOString().slice(0, 10),
        mag: +magnitudeAtGreatest(ev).toFixed(3),
        span: new Date(previewState.start).toISOString().slice(11, 16) + '\u2192' +
              new Date(previewState.end).toISOString().slice(11, 16) + ' UT',
        first: at(previewState.start),
        peak: at(ev.t0),
        last: at(previewState.end)
      });
      stopPreview();
    }
    return out;
  });

  for (const r of rows) {
    console.log(`\n${r.date}  mag ${String(r.mag).padStart(6)}   ${r.span}`);
    console.log('   first contact :', r.first);
    console.log('   greatest      :', r.peak);
    console.log('   last contact  :', r.last);
  }

  console.log('\n--- the Moon holds still while a minor eclipse runs ---');
  await page.evaluate(() => {
    const sel = document.getElementById('eclipseSelect');
    const want = eclipseEvents.find(e => new Date(e.t0).toISOString().slice(0,10) === '2028-01-12');
    sel.value = String(want.t0);
    sel.dispatchEvent(new Event('change'));
  });
  await new Promise(r => setTimeout(r, 400));
  const frames = [];
  for (let i = 0; i < 8; i++) {
    frames.push(await page.evaluate(() => ({
      rot: document.getElementById('moonSVG').style.transform,
      cx: document.getElementById('umbraShadow').getAttribute('cx'),
      st: document.getElementById('eclipseStatus').textContent.slice(-46)
    })));
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('   distinct rotations:', new Set(frames.map(f => f.rot)).size, '(want 1)');
  console.log('   umbra cx          :', frames.map(f => (+f.cx).toFixed(0)).join(' '));
  console.log('   tail of status    :', frames[0].st);

  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
})();
