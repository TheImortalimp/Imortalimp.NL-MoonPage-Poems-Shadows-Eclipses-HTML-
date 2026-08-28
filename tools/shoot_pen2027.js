// Render the Feb 2027 penumbral eclipse at greatest, plus an un-eclipsed control
// with everything else identical, so the shading can be measured by difference.
const puppeteer = require('puppeteer-core');
const CHROME = process.env.HOME + '/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 900, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  const info = await page.evaluate(() => {
    // step the preview forward to the Feb 2027 event
    togglePreview();
    let guard = 0;
    while (new Date(previewState.lastT0).toISOString().slice(0, 10) !== '2027-02-20' && guard++ < 30) {
      togglePreview(); togglePreview();
    }
    const ev = eclipseEvents.find(e => e.t0 === previewState.lastT0);
    // greatest eclipse
    previewState.t = ev.t0;
    refreshMoon();
    const shadow = document.getElementById('penumbraShadow');
    const umbra = document.getElementById('umbraShadow');
    const st = eclipseAt(new Date(ev.t0), observerPos.lat, observerPos.lng);
    const st_sigma = st ? st.sigma : null;
    const before = {
      cx: shadow.getAttribute('cx'), cy: shadow.getAttribute('cy'),
      r: shadow.getAttribute('r'),
      uR: umbra.getAttribute('r'),
      opacity: document.getElementById('eclipseShadows').getAttribute('opacity'),
      status: document.getElementById('eclipseStatus').textContent
    };
    const rot = parseFloat((document.getElementById('moonSVG').style.transform.match(/-?[\d.]+/) || [0])[0]);
    const th = Math.abs(rot * Math.PI / 180);
    const box = document.getElementById('moonSVG').getBoundingClientRect();
    const w = box.width / (Math.abs(Math.cos(th)) + Math.abs(Math.sin(th)));   // un-rotate the bbox
    const geomPage = { cx: box.left + box.width / 2, cy: box.top + box.height / 2, radius: 240 / 500 * w };
    return { date: new Date(ev.t0).toISOString(), before, rot: rot,
             sigma: st_sigma, geo: { rhoU: eclipseState.rhoU, rhoP: eclipseState.rhoP,
             rMoon: eclipseState.rMoon, sigma: eclipseState.sigma, penMag: eclipseState.penMag },
             page: geomPage };
  });

  await page.screenshot({ path: '/tmp/pen_eclipsed.png' });

  // control: same frozen face, clock parked well outside the eclipse
  await page.evaluate(() => {
    previewState.t = previewState.lastT0 - 20 * 3600e3;
    refreshMoon();
  });
  await page.screenshot({ path: '/tmp/pen_clear.png' });

  require('fs').writeFileSync('/tmp/peninfo.json', JSON.stringify(info, null, 1));
  console.log(JSON.stringify(info, null, 1));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
