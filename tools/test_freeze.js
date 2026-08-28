// In preview the face must hold still while the shadow crosses; live, the face
// must still roll with the sky (slowly, as it does in life).
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
  await page.goto('file:///home/user/moon-new-poems-true-dark-side.html', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1500));

  const read = () => page.evaluate(() => {
    const svg = document.getElementById('moonSVG');
    const um = document.querySelector('#umbraShadow, #umbraCircle, circle[id*=umbra]') ||
               document.getElementById('umbraCircle');
    const pen = document.getElementById('penumbraCircle');
    return {
      transform: svg.style.transform,
      umbra: um ? { cx: um.getAttribute('cx'), cy: um.getAttribute('cy'), r: um.getAttribute('r') } : null,
      penumbra: pen ? pen.getAttribute('cx') : null,
      status: document.getElementById('eclipseStatus').textContent
    };
  });

  console.log('--- 1. live mode: does the face follow the sky? ---');
  const liveNow = (await read()).transform;
  const liveLater = await page.evaluate(() => {
    refreshMoon(new Date(Date.now() + 6 * 3600e3));
    return document.getElementById('moonSVG').style.transform;
  });
  console.log('   now        :', liveNow);
  console.log('   +6 hours   :', liveLater);
  console.log('   live sky roll preserved:', liveNow !== liveLater ? 'YES' : 'NO (frozen - wrong)');
  await page.evaluate(() => refreshMoon());

  console.log('\n--- 2. preview: face still, shadow moving ---');
  await page.evaluate(() => {
    const ev = eclipseEvents.find(e => new Date(e.t0).toISOString().slice(0,10) === '2026-08-28');
    document.getElementById('eclipseSelect').value = String(ev.t0);
    document.getElementById('eclipseSelect').dispatchEvent(new Event('change'));
  });
  await new Promise(r => setTimeout(r, 600));
  const frames = [];
  for (let i = 0; i < 10; i++) {
    frames.push(await read());
    await new Promise(r => setTimeout(r, 350));
  }
  const transforms = [...new Set(frames.map(f => f.transform))];
  const cxs = frames.map(f => f.umbra && parseFloat(f.umbra.cx));
  const cys = frames.map(f => f.umbra && parseFloat(f.umbra.cy));
  const penCxs = frames.map(f => parseFloat(f.penumbra));
  console.log('   distinct rotations seen :', transforms.length, transforms.length === 1 ? '(face held still)' : '(FACE IS SPINNING)');
  transforms.forEach(t => console.log('     ', t));
  console.log('   umbra cx  :', cxs.map(v => v === null ? 'n/a' : v.toFixed(1)).join(' '));
  console.log('   umbra cy  :', cys.map(v => v === null ? 'n/a' : v.toFixed(1)).join(' '));
  console.log('   penumbra cx:', penCxs.map(v => v.toFixed(1)).join(' '));
  const moved = Math.max(...cxs.filter(v => v !== null)) - Math.min(...cxs.filter(v => v !== null));
  console.log('   shadow travelled', moved.toFixed(1), 'units across the disc:',
    moved > 20 ? 'YES' : 'NO (shadow stuck)');
  console.log('   status    :', frames[frames.length - 1].status);
  const mid = frames[Math.floor(frames.length / 2)];
  console.log('   mid status:', mid.status);

  await page.click('#eclipseStopBtn');
  await new Promise(r => setTimeout(r, 400));
  console.log('\n   after exit:', (await read()).status);

  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
})();
