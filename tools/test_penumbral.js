const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox'] });
  for (const when of ['2026-08-28T01:40:00Z','2026-08-28T02:00:00Z','2026-08-28T02:20:00Z','2026-08-28T02:40:00Z']) {
    const page = await b.newPage();
    await page.setViewport({ width: 620, height: 1100 });
    await page.evaluateOnNewDocument((iso) => {
      const R = Date; const fixed = new R(iso).valueOf(); const start = R.now();
      function F(...a) {
        if (!(this instanceof F)) return new R(R.now()).toString();
        return a.length === 0 ? new R(fixed + (R.now() - start)) : new R(...a);
      }
      F.prototype = R.prototype; F.now = () => fixed + (R.now() - start);
      F.parse = R.parse; F.UTC = R.UTC; window.Date = F;
      Object.defineProperty(window.navigator, 'geolocation', { value: undefined, configurable: true });
    }, when);
    await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1500));
    const o = await page.evaluate(() => ({
      status: document.getElementById('eclipseStatus').textContent,
      opacity: document.getElementById('eclipseShadows').getAttribute('opacity'),
      penumbraR: document.getElementById('penumbraShadow').getAttribute('r'),
      cx: document.getElementById('penumbraShadow').getAttribute('cx')
    }));
    console.log(when, JSON.stringify(o));
    await page.close();
  }
  await b.close();
})();
