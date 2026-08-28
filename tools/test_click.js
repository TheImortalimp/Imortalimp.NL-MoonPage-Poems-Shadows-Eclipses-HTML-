const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox'] });
  const page = await b.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.setViewport({ width: 620, height: 1100, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(window.navigator, 'geolocation', { value: undefined, configurable: true });
  });
  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));
  const before = await page.evaluate(() => ({
    status: document.getElementById('eclipseStatus').textContent,
    opacity: document.getElementById('eclipseShadows').getAttribute('opacity')
  }));
  console.log('before click:', JSON.stringify(before));
  await page.evaluate(() => {
    const ev = eclipseEvents.find(e => new Date(e.t0).toISOString().slice(0,10) === '2026-08-28');
    document.getElementById('eclipseSelect').value = String(ev.t0);
    document.getElementById('eclipseSelect').dispatchEvent(new Event('change'));
  });
  await new Promise(r => setTimeout(r, 900));
  const after = await page.evaluate(() => ({
    status: document.getElementById('eclipseStatus').textContent,
    opacity: document.getElementById('eclipseShadows').getAttribute('opacity'),
    btn: document.getElementById('eclipseStopBtn').hidden ? 'hidden' : 'shown',
    pressed: document.getElementById('eclipseSelect').value ? 'chosen' : 'none',
    umbra: document.getElementById('umbraShadow').getAttribute('cx')
  }));
  console.log('after 1 click:', JSON.stringify(after));
  await new Promise(r => setTimeout(r, 2500));
  const later = await page.evaluate(() => ({
    status: document.getElementById('eclipseStatus').textContent,
    umbra: document.getElementById('umbraShadow').getAttribute('cx')
  }));
  console.log('2.5 s later  :', JSON.stringify(later), '(clock is running: cx should differ)');
  await page.click('#eclipseStopBtn');
  await new Promise(r => setTimeout(r, 600));
  console.log('after exit  :', JSON.stringify(await page.evaluate(() => ({
    btn: document.getElementById('eclipseStopBtn').hidden ? 'hidden' : 'shown',
    menu: document.getElementById('eclipseSelect').selectedOptions[0].textContent,
    status: document.getElementById('eclipseStatus').textContent
  }))));
  console.log('errors:', errors.length ? errors : 'none');
  await b.close();
})();
