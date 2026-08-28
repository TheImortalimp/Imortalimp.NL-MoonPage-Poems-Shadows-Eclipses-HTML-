// Does the page follow the observer? Scripted geolocation fixes, before and
// after a move, with a stubbed weather service so the line is deterministic.
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
  page.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.googleapis|ERR_FILE/.test(m.text())) errors.push('console: ' + m.text()); });

  await page.evaluateOnNewDocument(() => {
    window.__lat = 52.37; window.__lon = 4.90;
    const watchers = [];
    window.__moveTo = (lat, lon) => {
      window.__lat = lat; window.__lon = lon;
      watchers.forEach(cb => cb({ coords: { latitude: lat, longitude: lon, accuracy: 8 } }));
    };
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: ok => ok({ coords: { latitude: window.__lat, longitude: window.__lon, accuracy: 8 } }),
        watchPosition: ok => {
          watchers.push(ok);
          ok({ coords: { latitude: window.__lat, longitude: window.__lon, accuracy: 8 } });
          return 1;
        },
        clearWatch: () => {}
      }
    });
    window.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        name: 'City@' + window.__lat.toFixed(1), sys: { country: 'XX' },
        clouds: { all: 12 }
      })
    });
  });

  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));

  const read = () => page.evaluate(() => ({
    loc: document.getElementById('location').textContent,
    status: document.getElementById('eclipseStatus').textContent
  }));

  const a = await read();
  console.log('--- 1. first fix: Amsterdam ---');
  console.log('   loc   :', a.loc);
  console.log('   status:', a.status);

  console.log('\n--- 2. observer moves to Sydney (-33.87, 151.21) ---');
  await page.evaluate(() => window.__moveTo(-33.87, 151.21));
  await new Promise(r => setTimeout(r, 1200));
  const b = await read();
  console.log('   loc   :', b.loc);
  console.log('   status:', b.status);

  console.log('\n--- 3. observer moves to Anchorage (61.22, -149.90) ---');
  await page.evaluate(() => window.__moveTo(61.22, -149.90));
  await new Promise(r => setTimeout(r, 1200));
  const c = await read();
  console.log('   loc   :', c.loc);
  console.log('   status:', c.status);

  console.log('\n--- 4. the line keeps up with the clock ---');
  const t1 = await read();
  await page.evaluate(() => { refreshMoon(); renderLocationLine(); });
  await new Promise(r => setTimeout(r, 300));
  const t2 = await read();
  console.log('   redraw changed anything:', t1.loc !== t2.loc ? 'YES' : 'no (values still equal - fine, 1 s apart)');
  console.log('   still no NaN/undefined :', /NaN|undefined/.test(t2.loc + t2.status) ? 'FAIL' : 'ok');

  console.log('\n--- 5. does the moon position track time? (alt now vs +3 h) ---');
  const alt = await page.evaluate(() => {
    const DEG = 180 / Math.PI;
    const nowAlt = SunCalc.getMoonPosition(new Date(), observerPos.lat, observerPos.lng).altitude * DEG;
    const later = SunCalc.getMoonPosition(new Date(Date.now() + 3 * 3600e3), observerPos.lat, observerPos.lng).altitude * DEG;
    return { now: nowAlt.toFixed(1), later: later.toFixed(1) };
  });
  console.log('   Moon altitude now', alt.now + '°, in 3 h', alt.later + '°');

  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
})();
