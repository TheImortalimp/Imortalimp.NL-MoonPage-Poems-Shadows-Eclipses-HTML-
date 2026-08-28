const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const PAGE = 'file:///home/user/moon-new-poems-true-dark-side.html';

const frames = [
  ['01:24', '2026-08-28T01:24:00Z'], ['02:33', '2026-08-28T02:33:00Z'],
  ['03:00', '2026-08-28T03:00:00Z'], ['03:30', '2026-08-28T03:30:00Z'],
  ['04:13', '2026-08-28T04:13:00Z'], ['04:50', '2026-08-28T04:50:00Z'],
  ['05:25', '2026-08-28T05:25:00Z'], ['05:52', '2026-08-28T05:52:00Z']
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'shell',
    args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars']
  });
  for (const [label, when] of frames) {
    const page = await browser.newPage();
    await page.setViewport({ width: 620, height: 1100, deviceScaleFactor: 2 });
    await page.evaluateOnNewDocument((fixedIso) => {
      const RealDate = Date;
      const fixed = new RealDate(fixedIso).valueOf();
      const start = RealDate.now();
      function FakeDate(...a) {
        if (!(this instanceof FakeDate)) return new RealDate(RealDate.now()).toString();
        return a.length === 0 ? new RealDate(fixed + (RealDate.now() - start)) : new RealDate(...a);
      }
      FakeDate.prototype = RealDate.prototype;
      FakeDate.now = () => fixed + (RealDate.now() - start);
      FakeDate.parse = RealDate.parse; FakeDate.UTC = RealDate.UTC;
      window.Date = FakeDate;
      Object.defineProperty(window.navigator, 'geolocation', { value: undefined, configurable: true });
    }, when);
    await page.goto(PAGE, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1500));
    const el = await page.$('#moonContainer');
    await el.screenshot({ path: `/home/user/work/shots/prog-${label.replace(':', '')}.png` });
    const st = await page.evaluate(() => document.getElementById('eclipseStatus').textContent);
    console.log(label, 'UTC |', st);
    await page.close();
  }
  await browser.close();
})();
