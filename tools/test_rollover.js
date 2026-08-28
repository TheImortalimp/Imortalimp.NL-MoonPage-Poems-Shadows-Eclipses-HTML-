const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox'] });
  const page = await b.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  await page.setViewport({ width: 620, height: 1100 });
  // Clock starts 4 minutes before first contact and runs 30x forward, never backwards.
  await page.evaluateOnNewDocument(() => {
    const R = Date;
    const base = new R('2026-08-28T01:20:00Z').valueOf();
    const start = R.now();
    function F(...a) {
      if (!(this instanceof F)) return new R(R.now()).toString();
      return a.length === 0 ? new R(base + (R.now() - start) * 30) : new R(...a);
    }
    F.prototype = R.prototype;
    F.now = () => base + (R.now() - start) * 30;
    F.parse = R.parse; F.UTC = R.UTC;
    window.Date = F;
    Object.defineProperty(window.navigator, 'geolocation', { value: undefined, configurable: true });
  });
  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  for (let i = 0; i < 9; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const o = await page.evaluate(() => ({
      clock: new Date().toISOString().slice(11, 19),
      status: document.getElementById('eclipseStatus').textContent.slice(0, 62),
      op: document.getElementById('eclipseShadows').getAttribute('opacity'),
      cx: (+document.getElementById('penumbraShadow').getAttribute('cx')).toFixed(0)
    }));
    console.log(o.clock, '| op', o.op.padEnd(5), '| cx', o.cx.padStart(6), '|', o.status);
  }
  console.log('errors:', errors.length ? errors : 'none');
  await b.close();
})();
