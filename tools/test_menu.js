// The eclipse menu: contents, marks, and that every entry can be previewed.
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

  const menu = await page.evaluate(() => {
    const sel = document.getElementById('eclipseSelect');
    const groups = [...sel.querySelectorAll('optgroup')].map(g => ({
      label: g.label, count: g.querySelectorAll('option').length
    }));
    const opts = [...sel.options].filter(o => o.value);
    return {
      placeholder: sel.options[0].textContent,
      total: opts.length,
      groups,
      first: opts.slice(0, 4).map(o => o.textContent),
      last: opts.slice(-2).map(o => o.textContent),
      marked: opts.filter(o => /below your horizon/.test(o.textContent)).length
    };
  });
  console.log('--- 1. what the menu offers (Amsterdam) ---');
  console.log('   placeholder :', menu.placeholder);
  console.log('   eclipses    :', menu.total);
  console.log('   groups      :', menu.groups.map(g => g.label + ' (' + g.count + ')').join(', '));
  console.log('   first entries:');
  menu.first.forEach(f => console.log('      ', f));
  console.log('   last entries :');
  menu.last.forEach(f => console.log('      ', f));
  console.log('   marked "below your horizon":', menu.marked, 'of', menu.total);

  console.log('\n--- 2. picking one starts the preview at first contact ---');
  const pick = await page.evaluate(() => {
    const sel = document.getElementById('eclipseSelect');
    const ev = eclipseEvents.find(e => new Date(e.t0).toISOString().slice(0, 10) === '2026-08-28');
    sel.value = String(ev.t0);
    sel.dispatchEvent(new Event('change'));
    return {
      status: document.getElementById('eclipseStatus').textContent,
      stopVisible: !document.getElementById('eclipseStopBtn').hidden,
      t: new Date(previewState.t).toISOString().slice(11, 16),
      start: new Date(previewState.start).toISOString().slice(11, 16),
      p1: new Date(eclipseFirstContact(ev)).toISOString().slice(11, 16)
    };
  });
  console.log('   status      :', pick.status);
  console.log('   opens at    :', pick.t, 'UT   (first contact', pick.p1, 'UT, menu start', pick.start + ')');
  console.log('   stop button :', pick.stopVisible ? 'shown' : 'HIDDEN');

  console.log('\n--- 3. stopping returns to the present ---');
  await page.click('#eclipseStopBtn');
  await new Promise(r => setTimeout(r, 500));
  const after = await page.evaluate(() => ({
    status: document.getElementById('eclipseStatus').textContent,
    sel: document.getElementById('eclipseSelect').value || '(reset)',
    stopVisible: !document.getElementById('eclipseStopBtn').hidden
  }));
  console.log('   status      :', after.status);
  console.log('   menu reset  :', after.sel, '| stop button', after.stopVisible ? 'shown' : 'hidden');

  console.log('\n--- 4. every entry in the menu, previewed at greatest ---');
  const sweep = await page.evaluate(() => {
    const sel = document.getElementById('eclipseSelect');
    const out = { ok: 0, bad: [], kinds: {} };
    for (const opt of [...sel.options].filter(o => o.value)) {
      sel.value = opt.value;
      sel.dispatchEvent(new Event('change'));
      const ev = eclipseEvents.find(e => e.t0 === Number(opt.value));
      previewState.t = ev.t0;                       // jump to greatest
      refreshMoon();
      const st = eclipseState;
      const line = document.getElementById('eclipseStatus').textContent;
      const kind = (line.match(/· (total|partial|penumbral) lunar/) || [])[1] || '?';
      out.kinds[kind] = (out.kinds[kind] || 0) + 1;
      if (!st || !/Preview/.test(line) || !isFinite(st.penMag)) {
        out.bad.push(opt.textContent + ' -> ' + line);
      } else out.ok++;
      stopPreview();
    }
    return out;
  });
  console.log('   previewed cleanly:', sweep.ok, 'of', menu.total);
  console.log('   kinds: ', JSON.stringify(sweep.kinds));
  console.log('   failures:', sweep.bad.length ? sweep.bad : 'none');

  console.log('\n--- 5. the marks follow the observer (Sydney) ---');
  const syd = await page.evaluate(async () => {
    observerPos = { lat: -33.87, lng: 151.21 };
    visibilityCache.clear();
    buildEclipseMenu();
    const sel = document.getElementById('eclipseSelect');
    const opts = [...sel.options].filter(o => o.value);
    return {
      marked: opts.filter(o => /below your horizon/.test(o.textContent)).length,
      total: opts.length,
      first3: opts.slice(0, 3).map(o => o.textContent)
    };
  });
  console.log('   marked "below your horizon":', syd.marked, 'of', syd.total, '(Amsterdam had', menu.marked + ')');
  syd.first3.forEach(f => console.log('      ', f));

  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
})();
