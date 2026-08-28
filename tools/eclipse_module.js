        /* ===================================================================
           EARTH'S SHADOW · LUNAR ECLIPSES
           -------------------------------------------------------------------
           Contact data for every lunar eclipse from 2025 to 2060, condensed
           from NASA's Five Millennium Catalog of Lunar Eclipses
           (Espenak & Meeus) https://eclipse.gsfc.nasa.gov/LEcat5/LE2001-2100.html
           Columns: instant of greatest eclipse (UTC) · gamma, the Moon's least
           distance from the axis of Earth's shadow in Earth radii (positive
           when the Moon passes north of the axis) · duration in minutes of the
           partial phase, or of the penumbral phase when the umbra is missed.

           Gamma and that duration place the Moon's centre relative to the
           shadow axis at any moment; the radii of the umbra and penumbra then
           follow from the true Earth-Moon and Earth-Sun distances. This
           reproduces the catalogue's magnitudes to about 0.003 and its
           published contact times to roughly a minute.
           =================================================================== */
        const ECLIPSE_TABLE = `
2025-03-14T06:58Z 0.3484 218.3
2025-09-07T18:11Z -0.2752 209.4
2026-03-03T11:33Z -0.3765 207.2
2026-08-28T04:12Z 0.4964 198.1
2027-02-20T23:12Z -1.0480 241.0
2027-07-18T16:02Z -1.5758 11.8
2027-08-17T07:13Z 1.2797 218.6
2028-01-12T04:12Z 0.9817 56.0
2028-07-06T18:19Z -0.7903 141.5
2028-12-31T16:51Z 0.3258 208.8
2029-06-26T03:22Z 0.0124 219.5
2029-12-20T22:41Z -0.3811 213.3
2030-06-15T18:33Z 0.7534 144.4
2030-12-09T22:27Z -1.0731 279.2
2031-05-07T03:50Z -1.0694 237.3
2031-06-05T11:43Z 1.4731 95.6
2031-10-30T07:45Z 1.1773 231.8
2032-04-25T15:13Z -0.3558 211.2
2032-10-18T19:02Z 0.4169 195.9
2033-04-14T19:12Z 0.3954 215.0
2033-10-08T10:55Z -0.2889 202.4
2034-04-03T19:05Z 1.1144 265.4
2034-09-28T02:46Z -1.0110 26.7
2035-02-22T09:04Z -1.0367 255.7
2035-08-19T01:10Z 0.9433 76.5
2036-02-11T22:11Z -0.3110 201.9
2036-08-07T02:51Z 0.2004 231.3
2037-01-31T14:00Z 0.3619 197.5
2037-07-27T04:08Z -0.5582 192.4
2038-01-21T03:48Z 1.0710 245.8
2038-06-17T02:43Z 1.3082 176.3
2038-07-16T11:34Z -1.2837 192.4
2038-12-11T17:43Z -1.1448 258.5
2039-06-06T18:53Z 0.5460 179.3
2039-11-30T16:55Z -0.4721 206.0
2040-05-26T11:44Z -0.1872 210.7
2040-11-18T19:03Z 0.2361 220.4
2041-05-16T00:41Z -0.9746 58.5
2041-11-08T04:33Z 0.9212 90.3
2042-04-05T14:28Z 1.1080 268.4
2042-09-29T10:44Z -1.0261 238.5
2043-03-25T14:30Z 0.3849 214.6
2043-09-19T01:50Z -0.3316 206.0
2044-03-13T19:37Z -0.3496 209.1
2044-09-07T11:19Z 0.4318 206.2
2045-03-03T07:41Z -1.0274 243.9
2045-08-27T13:53Z 1.2060 241.7
2046-01-22T13:01Z 0.9885 50.4
2046-07-18T01:04Z -0.8691 114.6
2047-01-12T01:24Z 0.3317 208.9
2047-07-07T10:34Z -0.0636 218.5
2048-01-01T06:52Z -0.3745 214.3
2048-06-26T02:00Z 0.6796 159.2
2048-12-20T06:26Z -1.0624 281.6
2049-05-17T11:25Z -1.1337 224.3
2049-06-15T19:12Z 1.4068 132.0
2049-11-09T15:50Z 1.1964 226.1
2050-05-06T22:30Z -0.4181 206.0
2050-10-30T03:20Z 0.4435 192.9
2051-04-26T02:14Z 0.3371 220.8
2051-10-19T19:10Z -0.2542 204.3
2052-04-14T02:16Z 1.0628 276.0
2052-10-08T10:44Z -0.9726 63.3
2053-03-04T17:20Z -1.0530 251.1
2053-08-29T08:04Z 1.0164 277.8
2054-02-22T06:49Z -0.3242 200.9
2054-08-18T09:24Z 0.2806 226.5
2055-02-11T22:44Z 0.3526 198.4
2055-08-07T10:51Z -0.4769 203.4
2056-02-01T12:24Z 1.0682 247.2
2056-06-27T10:01Z 1.3769 149.9
2056-07-26T18:41Z -1.2048 214.4
2056-12-22T01:47Z -1.1559 256.4
2057-06-17T02:24Z 0.6167 169.3
2057-12-11T00:51Z -0.4853 204.0
2058-06-06T19:13Z -0.1181 213.4
2058-11-30T03:14Z 0.2208 220.7
2059-05-27T07:53Z -0.9097 97.2
2059-11-19T12:59Z 0.9004 99.2
2060-04-15T21:35Z 1.1621 255.0
2060-10-09T18:51Z -1.0670 231.3
2060-11-08T04:02Z 1.5332 43.6
        `;

        const R_EARTH_KM = 6378.137, R_MOON_KM = 1737.4, R_SUN_KM = 696000, AU_KM = 149597870.7;
        // Classical enlargements of Earth's shadow (Chauvenet/Danjon), fitted so
        // the magnitudes computed here match the NASA catalogue.
        const UMBRA_ENLARGE = 1.017, PENUMBRA_ENLARGE = 1.006;
        const DEG = 180 / Math.PI;
        const J1970 = 2440588, J2000 = 2451545, DAY_MS = 86400000;

        const eclipseEvents = ECLIPSE_TABLE.trim().split('\n').map(function (line) {
            const p = line.trim().split(/\s+/);
            return { t0: Date.parse(p[0]), gamma: parseFloat(p[1]), dur: parseFloat(p[2]) };
        });

        function daysSinceJ2000(date) { return date.valueOf() / DAY_MS - 0.5 + J1970 - J2000; }

        // Geocentric ecliptic longitude of the Sun (deg) and the Earth-Sun distance.
        function solarElements(date) {
            const d = daysSinceJ2000(date);
            const M = (357.5291 + 0.98560028 * d) / DEG;
            const C = (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) / DEG;
            const e = 0.016708634 - 0.000042037 * (d / 36525);
            const dist = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(M + C)) * AU_KM;
            return { lon: ((M + C + 282.9372) % 360 + 360) % 360, dist: dist };
        }

        /* ---------- small vector helpers in the local horizontal frame ----------
           A direction is kept as [east, north, up]; east x north = up.          */
        function vDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
        function vCross(a, b) {
            return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        }
        function vAdd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
        function vSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
        function vScale(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
        function vNorm(a) {
            const n = Math.sqrt(vDot(a, a)) || 1;
            return [a[0] / n, a[1] / n, a[2] / n];
        }

        // Basis vectors of the local horizon, expressed in equatorial coordinates.
        function horizonBasis(latDeg, lngDeg, date) {
            const d = daysSinceJ2000(date);
            const phi = latDeg / DEG, th = (280.16 + 360.9856235 * d) / DEG + lngDeg / DEG;
            return {
                E: [-Math.sin(th), Math.cos(th), 0],
                N: [-Math.sin(phi) * Math.cos(th), -Math.sin(phi) * Math.sin(th), Math.cos(phi)],
                U: [Math.cos(phi) * Math.cos(th), Math.cos(phi) * Math.sin(th), Math.sin(phi)]
            };
        }

        // Ecliptic direction -> local horizontal [east, north, up].
        function eclipticToHorizon(v, date, latDeg, lngDeg) {
            const eps = (23.439291 - 0.0000004 * daysSinceJ2000(date)) / DEG;
            const eq = [v[0],
                        v[1] * Math.cos(eps) - v[2] * Math.sin(eps),
                        v[1] * Math.sin(eps) + v[2] * Math.cos(eps)];
            const b = horizonBasis(latDeg, lngDeg, date);
            return [vDot(eq, b.E), vDot(eq, b.N), vDot(eq, b.U)];
        }

        // Area shared by two circles of radii r1 and r2 whose centres are d apart.
        function circleOverlap(r1, r2, d) {
            if (d >= r1 + r2) return 0;
            if (d <= Math.abs(r1 - r2)) { const s = Math.min(r1, r2); return Math.PI * s * s; }
            const a1 = Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
            const a2 = Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
            const tri = 0.5 * Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
            return r1 * r1 * a1 + r2 * r2 * a2 - tri;
        }

        /* Work out the geometry of the eclipse that is in progress at `when`,
           or null when the Moon is clear of Earth's shadow. Angles in degrees,
           rates in degrees per hour. */
        function eclipseAt(when, latDeg, lngDeg) {
            const nowMs = when.valueOf();
            let ev = null, gap = Infinity;
            for (const e of eclipseEvents) {
                const g = Math.abs(e.t0 - nowMs);
                if (g < gap) { gap = g; ev = e; }
            }
            if (!ev || gap > 5 * 3600e3) return null;      // no eclipse anywhere near

            const date = when;
            const dMoon = SunCalc.getMoonPosition(date, latDeg, lngDeg).distance;
            const dSun = solarElements(date).dist;
            const pMoon = Math.asin(R_EARTH_KM / dMoon) * DEG;      // Moon's parallax
            const pSun = Math.asin(R_EARTH_KM / dSun) * DEG;        // Sun's parallax
            const sunSemi = Math.asin(R_SUN_KM / dSun) * DEG;       // Sun's semidiameter
            const rMoon = Math.asin(R_MOON_KM / dMoon) * DEG;        // Moon's semidiameter
            const rhoU = UMBRA_ENLARGE * (pMoon + pSun - sunSemi);   // umbral radius
            const rhoP = PENUMBRA_ENLARGE * (pMoon + pSun + sunSemi);// penumbral radius

            const sigmaMin = Math.abs(ev.gamma) * pMoon;   // closest approach to the axis
            const reachU = rhoU + rMoon, reachP = rhoP + rMoon;
            if (sigmaMin >= reachP) return null;           // the penumbra is missed entirely

            // Rate the Moon drifts across the shadow, recovered from the catalogued
            // duration of whichever phase actually takes place.
            const umbral = sigmaMin < reachU;
            const reach = umbral ? reachU : reachP;
            const rate = 2 * Math.sqrt(Math.max(1e-9, reach * reach - sigmaMin * sigmaMin)) / (ev.dur / 60);
            if (!(rate > 0)) return null;

            const dt = (nowMs - ev.t0) / 3600e3;                  // hours from greatest eclipse
            const sigma = Math.sqrt(sigmaMin * sigmaMin + (rate * dt) * (rate * dt));
            if (sigma >= reachP) return null;                     // outside the penumbra now

            return {
                event: ev, dt: dt, rate: rate, pMoon: pMoon, rMoon: rMoon,
                rhoU: rhoU, rhoP: rhoP, sigma: sigma, sigmaMin: sigmaMin,
                umbMag: (reachU - sigma) / (2 * rMoon),
                penMag: (reachP - sigma) / (2 * rMoon),
                obscuration: circleOverlap(rMoon, rhoU, sigma) / (Math.PI * rMoon * rMoon)
            };
        }

        /* Bearing of the shadow's axis as seen from the Moon's centre, expressed
           as an angle inside the SVG's own drawing frame: measured from the
           drawing's +x axis (which is the direction of the Sun, i.e. the bright
           limb) turning toward +y. */
        function eclipseShadowAngle(when, latDeg, lngDeg, st, moonPos, illum) {
            const date = when;
            // SunCalc's azimuth runs from south toward west; make it a compass bearing.
            const alt = moonPos.altitude, az = moonPos.azimuth + Math.PI;
            const m = [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];

            // Screen frame: facing the Moon, zenith up, a true (unmirrored) sky view.
            const flat = Math.sqrt(m[0] * m[0] + m[1] * m[1]) || 1;
            const facing = [m[0] / flat, m[1] / flat, 0];
            const right = vCross(facing, [0, 0, 1]);                 // screen right
            const up = vNorm(vSub([0, 0, 1], vScale(m, m[2])));      // zenith, on the sky

            // Ecliptic frame at the Moon: it sits opposite the Sun, at latitude ~0.
            const ls = solarElements(date).lon / DEG;
            const eastward = eclipticToHorizon([Math.sin(ls), -Math.cos(ls), 0], date, latDeg, lngDeg);
            const northward = eclipticToHorizon([0, 0, 1], date, latDeg, lngDeg);

            // Offset of the shadow's axis from the Moon's centre, in degrees.
            const along = -st.rate * st.dt;                  // + when the axis lies east
            const across = -st.event.gamma * st.pMoon;       // + when the axis lies north
            let u = vNorm(vAdd(vScale(eastward, along), vScale(northward, across)));
            u = vNorm(vSub(u, vScale(m, vDot(u, m))));       // flatten onto the plane of the sky

            const betaShadow = Math.atan2(vDot(u, right), vDot(u, up)) * DEG;
            // The drawing's +x is the bright limb, whose position angle from
            // celestial north is SunCalc's illumination angle; subtracting the
            // parallactic angle references it to the zenith, and position angles
            // run counter-clockwise on screen, so:
            const betaSun = -((illum.angle || 0) * DEG - (moonPos.parallacticAngle || 0) * DEG);
            return betaShadow - betaSun;
        }

        /* ---------------------------- drawing ---------------------------- */
        const UMBRA_PARTIAL = [[0, [8, 6, 12], 0.97], [0.5, [11, 8, 16], 0.96],
                               [0.82, [20, 12, 18], 0.95], [1, [30, 18, 22], 0.92]];
        const UMBRA_TOTAL = [[0, [62, 17, 8], 0.98], [0.45, [104, 30, 10], 0.97],
                             [0.78, [168, 62, 18], 0.96], [1, [214, 116, 44], 0.94]];
        const umbraStops = [
            document.getElementById('umbraStop0'), document.getElementById('umbraStop1'),
            document.getElementById('umbraStop2'), document.getElementById('umbraStop3')
        ];
        const penumbraStops = [
            document.getElementById('penumbraStop0'), document.getElementById('penumbraStop1'),
            document.getElementById('penumbraStop2')
        ];
        const umbraCircle = document.getElementById('umbraShadow');
        const penumbraCircle = document.getElementById('penumbraShadow');
        const eclipseLayer = document.getElementById('eclipseShadows');

        function mixRgb(a, b, t) {
            return [Math.round(a[0] + (b[0] - a[0]) * t),
                    Math.round(a[1] + (b[1] - a[1]) * t),
                    Math.round(a[2] + (b[2] - a[2]) * t)];
        }
        function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

        // How far the eye has adapted: 0 for a shallow partial, 1 in full totality.
        function eclipseDepth(st) { return clamp01((st.umbMag - 0.45) / 0.55); }

        let eclipseState = null;

        function updateEclipseShadows(when, latDeg, lngDeg, moonPos, illum) {
            const st = eclipseAt(when, latDeg, lngDeg);
            eclipseState = st;
            if (!st) {
                eclipseLayer.setAttribute('opacity', '0');
                return null;
            }

            const angle = eclipseShadowAngle(when, latDeg, lngDeg, st, moonPos, illum);
            const pxPerDeg = 240 / st.rMoon;               // the disc is 240 units across
            const off = st.sigma * pxPerDeg;
            const a = angle / DEG;
            const cx = 250 + off * Math.cos(a);
            const cy = 250 + off * Math.sin(a);

            umbraCircle.setAttribute('cx', cx.toFixed(2));
            umbraCircle.setAttribute('cy', cy.toFixed(2));
            umbraCircle.setAttribute('r', (st.rhoU * pxPerDeg).toFixed(2));
            penumbraCircle.setAttribute('cx', cx.toFixed(2));
            penumbraCircle.setAttribute('cy', cy.toFixed(2));
            penumbraCircle.setAttribute('r', (st.rhoP * pxPerDeg).toFixed(2));

            // Penumbra: light fades across the whole span between the two edges.
            const inner = st.rhoU / st.rhoP;
            const mid = (inner + 1) / 2;
            const pen = [[0, inner, 0.9], [1, mid, 0.5], [2, 1, 0]];
            for (const [i, off2, alpha] of pen) {
                penumbraStops[i].setAttribute('offset', off2.toFixed(4));
                penumbraStops[i].setAttribute('stop-opacity', alpha.toFixed(3));
            }

            // Umbra: near-black against a sunlit Moon, copper once totality sets in.
            const deep = eclipseDepth(st);
            const fade = deep * deep * (3 - 2 * deep);      // smoothstep
            for (let i = 0; i < 4; i++) {
                const c = mixRgb(UMBRA_PARTIAL[i][1], UMBRA_TOTAL[i][1], fade);
                umbraStops[i].setAttribute('stop-color', 'rgb(' + c.join(',') + ')');
                umbraStops[i].setAttribute('stop-opacity',
                    (UMBRA_PARTIAL[i][2] + (UMBRA_TOTAL[i][2] - UMBRA_PARTIAL[i][2]) * fade).toFixed(3));
            }

            // Fade in over the first sliver of penumbral contact so nothing pops.
            eclipseLayer.setAttribute('opacity', clamp01(st.penMag / 0.05).toFixed(3));
            return st;
        }
