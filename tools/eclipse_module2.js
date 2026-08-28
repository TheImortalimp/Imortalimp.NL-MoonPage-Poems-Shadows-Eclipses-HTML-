
        /* --------------------------- status line --------------------------- */
        const eclipseStatusEl = document.getElementById('eclipseStatus');

        // Umbral magnitude the eclipse reaches at its greatest, from gamma alone.
        function magnitudeAtGreatest(ev) {
            const date = new Date(ev.t0);
            const dMoon = SunCalc.getMoonPosition(date, 0, 0).distance;
            const dSun = solarElements(date).dist;
            const pMoon = Math.asin(R_EARTH_KM / dMoon) * DEG;
            const pSun = Math.asin(R_EARTH_KM / dSun) * DEG;
            const sunSemi = Math.asin(R_SUN_KM / dSun) * DEG;
            const rMoon = Math.asin(R_MOON_KM / dMoon) * DEG;
            const rhoU = UMBRA_ENLARGE * (pMoon + pSun - sunSemi);
            return (rhoU + rMoon - Math.abs(ev.gamma) * pMoon) / (2 * rMoon);
        }

        function eclipseKind(mag) {
            return mag >= 1 ? 'total' : mag > 0 ? 'partial' : 'penumbral';
        }

        function formatEclipseDate(ms) {
            return new Date(ms).toLocaleDateString(undefined, {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        }

        function formatEclipseClock(ms) {
            return new Date(ms).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }

        function nextEclipseAfter(afterMs, minMagnitude) {
            const floor = minMagnitude === undefined ? -2 : minMagnitude;
            for (const e of eclipseEvents) {
                if (e.t0 > afterMs && magnitudeAtGreatest(e) >= floor) return e;
            }
            return null;
        }

        function updateEclipseStatus(st, when) {
            if (previewState.active) {
                const ev = eclipseEvents.find(e => e.t0 === previewState.lastT0);
                if (ev) {
                    eclipseStatusEl.className = 'preview';
                    eclipseStatusEl.textContent = '⏯ Preview · ' + eclipseKind(magnitudeAtGreatest(ev)) +
                        ' lunar eclipse of ' + formatEclipseDate(ev.t0) + ' · ' +
                        formatEclipseClock(when.valueOf()) + ' · ' +
                        (st ? Math.round(st.obscuration * 100) + '% of the disc in shadow' : 'Moon clear of the shadow');
                    return;
                }
            }
            if (st) {
                eclipseStatusEl.className = 'active';
                if (st.umbMag >= 1) {
                    eclipseStatusEl.textContent = "🌍 Total lunar eclipse · the whole Moon is inside Earth's umbra";
                } else if (st.umbMag > 0) {
                    eclipseStatusEl.textContent = '🌍 Partial lunar eclipse · ' +
                        Math.round(st.obscuration * 100) + "% of the disc is inside Earth's umbra";
                } else {
                    eclipseStatusEl.textContent = '🌍 Penumbral lunar eclipse · soft shading, no dark bite';
                }
                return;
            }
            const next = nextEclipseAfter(Date.now());
            eclipseStatusEl.className = '';
            eclipseStatusEl.textContent = next
                ? '🌍 Next lunar eclipse: ' + formatEclipseDate(next.t0) + ' · ' + eclipseKind(magnitudeAtGreatest(next))
                : '';
        }

        /* --------------------------- preview mode --------------------------
           Eclipses are rare, so the page can also walk through the next one
           that actually shows a bite at a few hundred times real speed.       */
        const previewState = { active: false, t: 0, lastT0: 0, speed: 420 };
        const PREVIEW_SPAN = 2.4 * 3600e3;         // either side of greatest eclipse
        let observerPos = { lat: 52.37, lng: 4.90 };

        function togglePreview() {
            const btn = document.getElementById('eclipsePreviewBtn');
            if (previewState.active) {
                previewState.active = false;
                btn.setAttribute('aria-pressed', 'false');
                btn.textContent = '▶ Preview next eclipse';
            } else {
                const ev = nextEclipseAfter(Math.max(Date.now(), previewState.lastT0 + 3600e3), 0.25);
                if (!ev) return;
                previewState.active = true;
                previewState.lastT0 = ev.t0;
                previewState.t = ev.t0 - PREVIEW_SPAN;
                btn.setAttribute('aria-pressed', 'true');
                btn.textContent = '⏹ Exit preview';
            }
            refreshMoon();
        }

        // Redraw the phase and the eclipse shadows for the current (or previewed) moment.
        function refreshMoon(when) {
            const date = when || (previewState.active ? new Date(previewState.t) : new Date());
            const illum = SunCalc.getMoonIllumination(date);
            const moonPos = SunCalc.getMoonPosition(date, observerPos.lat, observerPos.lng);
            updateMoonVisual(illum.fraction, illum.phase,
                             (moonPos.parallacticAngle || 0) * DEG, illum.angle);
            const st = updateEclipseShadows(date, observerPos.lat, observerPos.lng, moonPos, illum);
            updateEclipseStatus(st, date);
        }

        document.getElementById('eclipsePreviewBtn').addEventListener('click', togglePreview);
