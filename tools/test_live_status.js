// The live line at greatest eclipse, and with location permission refused.
const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

const AT = new Date('2026-08-28T04:13:00Z').getTime();   // greatest, 2026

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  for (const [label, deny] of [['location allowed', false], ['location refused', true]]) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.evaluateOnNewDocument((t, deny) => {
      const base = t, real = Date, offset = base - Date.now();
      class FakeDate extends real {
        constructor(...a) { if (a.length) super(...a); else super(real.now() + offset); }
        static now() { return real.now() + offset; }
      }
      window.Date = FakeDate;
      if (deny) {
        Object.defineProperty(window.navigator, 'geolocation', {
          value: { getCurrentPosition: (_ok, err) => err({ code: 1, message: 'denied' }) },
          configurable: true
        });
      }
    }, AT, deny);

    await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 2500));
    const out = await page.evaluate(() => ({
      status: document.getElementById('eclipseStatus').textContent,
      location: document.getElementById('location').textContent,
      cls: document.getElementById('eclipseStatus').className
    }));
    console.log('--- ' + label + ' ---');
    console.log('   status  :', out.status, '[' + out.cls + ']');
    console.log('   location:', out.location);
    console.log('   errors  :', errors.length ? errors : 'none');
    await page.close();
  }
  await browser.close();
})();
