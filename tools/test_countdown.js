const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

async function open(browser, fixedIso) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.setViewport({ width: 620, height: 1100 });
  await page.evaluateOnNewDocument((iso) => {
    const R = Date; const fixed = iso ? new R(iso).valueOf() : null; const start = R.now();
    function F(...a) {
      if (!(this instanceof F)) return new R(R.now()).toString();
      return a.length === 0 ? new R(fixed === null ? R.now() : fixed + (R.now() - start)) : new R(...a);
    }
    F.prototype = R.prototype; F.now = () => fixed === null ? R.now() : fixed + (R.now() - start);
    F.parse = R.parse; F.UTC = R.UTC; window.Date = F;
    Object.defineProperty(window.navigator, 'geolocation', { value: undefined, configurable: true });
  }, fixedIso);
  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));
  return { page, errors };
}

(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox'] });

  console.log('--- 1. countdown ticks once per second (real clock) ---');
  let { page, errors } = await open(b, null);
  const t1 = await page.$eval('#eclipseStatus', e => e.textContent);
  await new Promise(r => setTimeout(r, 2100));
  const t2 = await page.$eval('#eclipseStatus', e => e.textContent);
  console.log('   t0:', t1);
  console.log('   t2:', t2);
  console.log('   ticking:', t1 !== t2 ? 'YES' : 'NO');
  await page.close();

  console.log('\n--- 2. during an eclipse the line reports the eclipse, not a countdown ---');
  ({ page, errors } = await open(b, '2026-08-28T04:13:00Z'));
  console.log('  ', await page.$eval('#eclipseStatus', e => e.textContent));
  await page.close();

  console.log('\n--- 3. rollover: 90 s before first contact, then after ---');
  ({ page, errors } = await open(b, '2026-08-28T01:22:30Z'));
  console.log('   at 01:22:30Z:', await page.$eval('#eclipseStatus', e => e.textContent));
  console.log('   moon shadow opacity:', await page.$eval('#eclipseShadows', e => e.getAttribute('opacity')));
  await new Promise(r => setTimeout(r, 120000 / 6));  // ~20 s of wall clock is too slow; use 6x below
  await page.close();

  console.log('\n--- 3b. same, with the clock sped up 30x so P1 arrives quickly ---');
  ({ page, errors } = await open(b, null));
  await page.evaluate(() => {
    const R = Date; let base = new R('2026-08-28T01:22:00Z').valueOf(); const start = R.now();
    function F(...a) {
      if (!(this instanceof F)) return new R(R.now()).toString();
      return a.length === 0 ? new R(base + (R.now() - start) * 30) : new R(...a);
    }
    F.prototype = R.prototype; F.now = () => base + (R.now() - start) * 30;
    F.parse = R.parse; F.UTC = R.UTC; window.Date = F;
  });
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 2000));
    console.log('   +' + ((i + 1) * 2) + 's wall (' + ((i + 1) * 60) + 's eclipse time):',
      await page.$eval('#eclipseStatus', e => e.textContent),
      '| opacity', await page.$eval('#eclipseShadows', e => e.getAttribute('opacity')));
  }
  console.log('   errors:', errors.length ? errors : 'none');
  await page.close();
  await b.close();
})();
