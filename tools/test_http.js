// Serve it the way the domain will: over HTTP, real weather API, real fonts.
const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';
const URL = 'http://localhost:8080/moon-new-poems-true-dark-side.html';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => failed.push(r.url().slice(0, 90) + ' — ' + r.failure().errorText));

  // Grant a fixed position; the weather call itself is left real.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: ok => ok({ coords: { latitude: 52.37, longitude: 4.90, accuracy: 10 } }),
        watchPosition: ok => { ok({ coords: { latitude: 52.37, longitude: 4.90, accuracy: 10 } }); return 1; },
        clearWatch: () => {}
      }
    });
  });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  const out = await page.evaluate(() => ({
    title: document.title,
    status: document.getElementById('eclipseStatus').textContent,
    location: document.getElementById('location').textContent,
    phase: document.getElementById('phaseName').textContent,
    poem: (document.querySelector('#poem') || {}).textContent?.slice(0, 70) || '',
    clock: document.getElementById('localClock').textContent,
    fonts: {
      berkshire: document.fonts.check('16px "Berkshire Swash"'),
      grotesk: document.fonts.check('16px "Space Grotesk"')
    },
    svgOk: !!document.getElementById('moonSVG'),
    craters: document.querySelectorAll('#moonCraters > *').length
  }));

  console.log('title    :', out.title);
  console.log('clock    :', out.clock);
  console.log('phase    :', out.phase);
  console.log('status   :', out.status);
  console.log('location :', out.location);
  console.log('poem     :', out.poem.replace(/\n/g, ' / '));
  console.log('fonts    : Berkshire Swash', out.fonts.berkshire ? 'loaded' : 'MISSING',
              '| Space Grotesk', out.fonts.grotesk ? 'loaded' : 'MISSING');
  console.log('svg      :', out.svgOk ? 'present' : 'MISSING', '| crater shapes:', out.craters);

  // preview round trip
  await page.evaluate(() => {
    const ev = eclipseEvents.find(e => new Date(e.t0).toISOString().slice(0,10) === '2026-08-28');
    document.getElementById('eclipseSelect').value = String(ev.t0);
    document.getElementById('eclipseSelect').dispatchEvent(new Event('change'));
  });
  await new Promise(r => setTimeout(r, 2500));
  const prev = await page.evaluate(() => ({
    status: document.getElementById('eclipseStatus').textContent,
    btn: document.getElementById('eclipseStopBtn').hidden ? 'hidden' : 'shown',
    cx: document.querySelector('#umbraShadow, #umbraCircle').getAttribute('cx'),
    rot: document.getElementById('moonSVG').style.transform
  }));
  await page.click('#eclipseStopBtn');
  await new Promise(r => setTimeout(r, 800));
  const back = await page.evaluate(() => document.getElementById('eclipseStatus').textContent);
  console.log('\npreview  :', prev.status);
  console.log('           umbra cx', prev.cx, '| rotation', prev.rot);
  console.log('back live:', back);

  console.log('\npage errors      :', errors.length ? errors : 'none');
  console.log('failed requests  :', failed.length ? failed : 'none');
  await browser.close();
})();
