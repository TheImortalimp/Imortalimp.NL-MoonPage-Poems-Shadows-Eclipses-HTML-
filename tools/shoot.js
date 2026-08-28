// Render the patched page as it would look at chosen moments, in headless Chrome.
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const PAGE = 'file:///home/user/moon-new-poems-true-dark-side.html';

const shots = [
  { name: 'eclipse-max', when: '2026-08-28T04:13:00Z', note: 'deep partial, greatest eclipse' },
  { name: 'eclipse-partial', when: '2026-08-28T03:10:00Z', note: 'mid partial' },
  { name: 'eclipse-first-contact', when: '2026-08-28T02:45:00Z', note: 'just after U1' },
  { name: 'quiet', when: '2026-09-15T21:00:00Z', note: 'ordinary waxing gibbous' },
  { name: 'total-2028', when: '2028-12-31T16:53:00Z', note: 'total lunar eclipse' },
  { name: 'now', when: null, note: 'real current time' }
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb',
           '--allow-file-access-from-files', '--hide-scrollbars']
  });
  for (const s of shots) {
    const page = await browser.newPage();
    await page.setViewport({ width: 620, height: 1100, deviceScaleFactor: 2 });
    const iso = s.when || new Date().toISOString();
    await page.evaluateOnNewDocument((fixedIso) => {
      // Freeze the clock so the page renders the requested moment...
      const RealDate = Date;
      const fixed = fixedIso === null ? null : new RealDate(fixedIso).valueOf();
      const start = RealDate.now();
      function FakeDate(...args) {
        if (!(this instanceof FakeDate)) return new RealDate(RealDate.now()).toString();
        return args.length === 0
          ? new RealDate(fixed === null ? RealDate.now() : fixed + (RealDate.now() - start))
          : new RealDate(...args);
      }
      FakeDate.prototype = RealDate.prototype;
      FakeDate.now = () => fixed === null ? RealDate.now() : fixed + (RealDate.now() - start);
      FakeDate.parse = RealDate.parse;
      FakeDate.UTC = RealDate.UTC;
      window.Date = FakeDate;
      // ...and skip the geolocation wait so it lands on the Amsterdam fallback.
      Object.defineProperty(window.navigator, 'geolocation', { value: undefined, configurable: true });
    }, s.when);
    await page.goto(PAGE, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1800));
    const info = await page.evaluate(() => ({
      status: document.getElementById('eclipseStatus').textContent,
      phase: document.getElementById('phaseName').textContent,
      clock: document.getElementById('localClock').textContent,
      rotation: document.getElementById('moonSVG').style.transform,
      umbra: { cx: document.getElementById('umbraShadow').getAttribute('cx'),
               cy: document.getElementById('umbraShadow').getAttribute('cy'),
               r: document.getElementById('umbraShadow').getAttribute('r') },
      opacity: document.getElementById('eclipseShadows').getAttribute('opacity'),
      hue: getComputedStyle(document.documentElement).getPropertyValue('--hue')
    }));
    console.log('\n===', s.name, '|', s.note, '|', iso);
    console.log('    ', JSON.stringify(info));
    await page.screenshot({ path: `/home/user/work/shots/${s.name}-page.png`, fullPage: true });
    const el = await page.$('#moonContainer');
    await el.screenshot({ path: `/home/user/work/shots/${s.name}-moon.png` });
    await page.close();
  }
  await browser.close();
})();
