import re, sys, io

SRC = '/home/user/uploads/moon-new-poems-true-dark-side.html'
DST = '/home/user/moon-new-poems-true-dark-side.html'

html = open(SRC, encoding='utf-8').read()
mod1 = open('/home/user/work/eclipse_module.js', encoding='utf-8').read()
mod2 = open('/home/user/work/eclipse_module2.js', encoding='utf-8').read()

def sub(old, new, label, count=1):
    global html
    n = html.count(old)
    if n != count:
        print('FAIL (%s): found %d matches, expected %d' % (label, n, count))
        sys.exit(1)
    html = html.replace(old, new, count)
    print('ok:', label)

# ---------------------------------------------------------------- 1. CSS vars
sub("""            --moon-yellow: rgb(245, 255, 151);
        }""",
    """            --moon-yellow: rgb(245, 255, 151);
            --halo-a: 0.28;              /* halo strength, dimmed during an eclipse */
        }""", 'css root var')

# ------------------------------------------------------- 2. halo uses --halo-a
sub("""            box-shadow: 0 0 18px 6px hsla(var(--hue), 80%, 60%, 0.28),
                        0 0 40px 14px hsla(var(--hue), 80%, 60%, 0.12);""",
    """            box-shadow: 0 0 18px 6px hsla(var(--hue), 80%, 60%, var(--halo-a)),
                        0 0 40px 14px hsla(var(--hue), 80%, 60%, calc(var(--halo-a) * 0.43));""",
    'moonContainer box-shadow')

sub("""            border-radius: 50%; filter: drop-shadow(0 0 10px var(--main-color));""",
    """            border-radius: 50%;
            filter: drop-shadow(0 0 10px hsla(var(--hue), 80%, 60%, var(--halo-a)));""",
    'moonSVG drop-shadow')

# ------------------------------------------------------------- 3. new CSS bits
sub("""        #earthshine { display: none; }""",
    """        #earthshine { display: none; }
        /* Earth's shadow: drawn over the sunlit surface, never under it. */
        #eclipseShadows { pointer-events: none; }
        #eclipseStatus {
            font-size: 0.85rem; margin-top: 0.45rem; min-height: 1.25em;
            color: #b9a98c; letter-spacing: 0.01em;
        }
        #eclipseStatus.active {
            color: #ffb27a; font-weight: 600;
            text-shadow: 0 0 14px rgba(255, 132, 60, 0.4);
        }
        #eclipseStatus.preview { color: #7dd3fc; font-variant-numeric: tabular-nums; }
        .preview-btn {
            background: #151828; color: var(--text); font-family: inherit;
            border: 1px solid rgba(125,211,252,0.3); border-radius: 9px;
            padding: 0.45rem 0.8rem; font-size: 0.85rem; cursor: pointer;
            transition: border-color .2s, color .2s;
        }
        .preview-btn:hover { border-color: var(--accent); }
        .preview-btn[aria-pressed="true"] { border-color: #ffb27a; color: #ffb27a; }""",
    'eclipse css')

# --------------------------------------------------------- 4. defs: gradients
sub("""                    <mask id="moonIlluminationMask" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="500">
                        <rect width="500" height="500" fill="#000"/>
                        <path id="moonIlluminationMaskPath" fill="#fff" filter="url(#terminatorGradient)"></path>
                    </mask>
                </defs>""",
    """                    <mask id="moonIlluminationMask" maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="500">
                        <rect width="500" height="500" fill="#000"/>
                        <path id="moonIlluminationMaskPath" fill="#fff" filter="url(#terminatorGradient)"></path>
                    </mask>
                    <!--
                      Earth's shadow, for lunar eclipses.
                      The penumbra is the wide outer shade where the Sun is only
                      partly hidden; the umbra is the dark core, which glows
                      copper-red once the Moon is wholly inside it. Both are
                      centred on the shadow axis; the script moves and resizes
                      them from the live eclipse geometry.
                    -->
                    <radialGradient id="penumbraGradient">
                        <stop id="penumbraStop0" offset="0.56" stop-color="#080a12" stop-opacity="0.9"/>
                        <stop id="penumbraStop1" offset="0.78" stop-color="#080a12" stop-opacity="0.5"/>
                        <stop id="penumbraStop2" offset="1" stop-color="#080a12" stop-opacity="0"/>
                    </radialGradient>
                    <radialGradient id="umbraGradient">
                        <stop id="umbraStop0" offset="0" stop-color="#08060c" stop-opacity="0.97"/>
                        <stop id="umbraStop1" offset="0.5" stop-color="#0b0810" stop-opacity="0.96"/>
                        <stop id="umbraStop2" offset="0.82" stop-color="#140c12" stop-opacity="0.95"/>
                        <stop id="umbraStop3" offset="1" stop-color="#1e1216" stop-opacity="0.92"/>
                    </radialGradient>
                    <!-- Earth's atmosphere keeps the umbral edge from being razor sharp. -->
                    <filter id="umbraEdge" x="-15%" y="-15%" width="130%" height="130%">
                        <feGaussianBlur stdDeviation="3.5"/>
                    </filter>
                </defs>""",
    'defs gradients')

# ------------------------------------------------------- 5. the shadow layer
sub("""                    </g>
                </g>
            </svg>""",
    """                    </g>
                </g>
                <!--
                  Earth's shadow, drawn last: an eclipsed Moon is darkened by
                  something passing in front of it, so the shadow belongs over
                  the sunlit surface and the maria, not under them.
                -->
                <g id="eclipseShadows" clip-path="url(#moon-clip)" opacity="0" aria-hidden="true">
                    <circle id="penumbraShadow" cx="250" cy="250" r="1150" fill="url(#penumbraGradient)"></circle>
                    <circle id="umbraShadow" cx="250" cy="250" r="645" fill="url(#umbraGradient)" filter="url(#umbraEdge)"></circle>
                </g>
            </svg>""",
    'eclipse shadow layer')

# ----------------------------------------------------------- 6. preview button
sub("""                    </optgroup>
                </select>
            </div>
        </div>""",
    """                    </optgroup>
                </select>
            </div>
            <div>
                <button id="eclipsePreviewBtn" class="preview-btn" type="button"
                        aria-pressed="false" title="Walk the clock through the next eclipse that shows a real bite">
                    ▶ Preview next eclipse
                </button>
            </div>
        </div>""",
    'preview button')

# ------------------------------------------------------------ 7. status line
sub("""        <p id="fullMoonCountdown"></p>""",
    """        <p id="fullMoonCountdown"></p>
        <p id="eclipseStatus" aria-live="polite"></p>""",
    'status line')

# ------------------------------------------------------------- 8. the JS module
sub("""        /* ===== ORIGINAL MOON LOGIC (preserved) ===== */""",
    mod1 + mod2 + """
        /* ===== ORIGINAL MOON LOGIC (preserved) ===== */""",
    'eclipse module')

# ------------------------------------------------- 9. fix the mirrored rotation
sub("""            const brightLimbDegrees = (illuminationAngle || 0) * 180 / Math.PI;
            const visualRotation = brightLimbDegrees - parallacticAngle - 90;
            moonSVG.style.transform = `rotate(${visualRotation}deg)`;""",
    """            const brightLimbDegrees = (illuminationAngle || 0) * 180 / Math.PI;
            /*
               Position angles are measured from celestial north towards the east,
               which runs counter-clockwise in a true (unmirrored) view of the sky.
               Subtracting the parallactic angle re-references the bright limb to
               the zenith; the CSS rotation below is clockwise, so it takes the
               negative of that. Without the sign flip the whole disc - phase and
               maria alike - came out mirrored, and an eclipse shadow would bite
               the limb opposite the one the Sun actually lights.
            */
            const visualRotation = -(brightLimbDegrees - parallacticAngle) - 90;
            moonSVG.style.transform = `rotate(${visualRotation}deg)`;""",
    'rotation fix')

# ------------------------------------------------------ 10. show() drives both
sub("""            updateMoonVisual(illuminationFraction, phase, parallacticAngle, moonIllumination.angle);""",
    """            observerPos = { lat: lat, lng: lon };
            refreshMoon(now);   // phase + any eclipse shadow, for this exact moment""",
    'show() refresh')

# --------------------------------------------------------------- 11. draw loop
sub("""        function draw() {
            // Easter egg: at exact New Moon and Full Moon, only the outer halo
            // slowly cycles through colour. The geographically based lunar surface
            // and the real phase shadows remain untouched.
            const specialHue = isSpecialPhase ? (Date.now() / 50) % 360 : 45;
            document.documentElement.style.setProperty('--hue', specialHue);
            moonIlluminatedPath.style.fill = 'url(#moonSurface)';
            requestAnimationFrame(draw);
        }""",
    """        let lastFrameAt = Date.now();
        let lastEclipseCheck = 0;

        function draw() {
            const now = Date.now();
            // Easter egg: at exact New Moon and Full Moon, only the outer halo
            // slowly cycles through colour. The geographically based lunar surface
            // and the real phase shadows remain untouched. A deep eclipse takes
            // over the halo instead - a rainbow ring around a blood moon is wrong.
            const deep = eclipseState ? eclipseDepth(eclipseState) : 0;
            const specialHue = isSpecialPhase ? (now / 50) % 360 : 45;
            document.documentElement.style.setProperty('--hue',
                deep > 0.05 ? (26 - 6 * deep).toFixed(1) : specialHue);
            document.documentElement.style.setProperty('--halo-a',
                (0.28 * (1 - 0.78 * deep)).toFixed(3));

            if (previewState.active) {
                // Walk the clock through the eclipse, then loop back to first contact.
                previewState.t += Math.min(now - lastFrameAt, 100) * previewState.speed;
                if (previewState.t - previewState.lastT0 > PREVIEW_SPAN) {
                    previewState.t = previewState.lastT0 - PREVIEW_SPAN;
                }
                if (now - lastEclipseCheck > 40) { lastEclipseCheck = now; refreshMoon(); }
            } else if (now - lastEclipseCheck > 20000) {
                // Between eclipses nothing moves fast; 20 s keeps the status honest.
                lastEclipseCheck = now;
                refreshMoon();
            }
            lastFrameAt = now;

            moonIlluminatedPath.style.fill = 'url(#moonSurface)';
            requestAnimationFrame(draw);
        }""",
    'draw loop')

open(DST, 'w', encoding='utf-8').write(html)
print('\\nwritten:', DST, len(html), 'bytes')
