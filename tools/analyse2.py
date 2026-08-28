import numpy as np
from PIL import Image
import math

# #moonContainer is 300 CSS px wide at DSF 2 -> 600 px; the disc is 240/500 of the viewBox.
DISC_R = 600 * 240 / 500   # image is 600 device px wide; SVG viewBox 500 -> 1.2 px per unit

def load(name):
    img = Image.open(f'/home/user/work/shots/{name}-moon.png').convert('RGB')
    a = np.asarray(img).astype(float)
    h, w, _ = a.shape
    cy, cx = h / 2, w / 2
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot(xx - cx, yy - cy)
    lum = 0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]
    return a, lum, r, (cx, cy)

def report(name, umbra=None, rot=0.0, expect_umbra_pct=None):
    a, lum, r, (cx, cy) = load(name)
    disc = r < DISC_R * 0.985
    print(f'\n=== {name} ===')
    print(f'    disc: {disc.sum():,} px, mean lum {lum[disc].mean():6.1f}, max {lum[disc].max():6.1f}')
    if umbra is None:
        return
    # where the shadow centre sits on screen after the SVG's CSS rotation
    ux, uy = umbra[0] - 250, umbra[1] - 250
    th = math.radians(rot)
    sx, sy = ux * math.cos(th) - uy * math.sin(th), ux * math.sin(th) + uy * math.cos(th)
    sxb, syb = sx * 1.2, sy * 1.2         # viewBox units -> image px
    d = np.hypot(xx := None if False else 0, 0) if False else None
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]
    dist = np.hypot(xx - (cx + sxb), yy - (cy + syb))
    umbra_r_px = float(umbra[2]) * 1.2
    inside = disc & (dist < umbra_r_px)
    outside = disc & (dist >= umbra_r_px)
    cin, cout = a[inside].mean(axis=0), a[outside].mean(axis=0) if outside.sum() else np.array([0, 0, 0])
    print(f'    inside umbra : {100*inside.sum()/disc.sum():5.1f}% of disc  rgb({cin[0]:5.1f},{cin[1]:5.1f},{cin[2]:5.1f})  lum {lum[inside].mean():6.1f}')
    if outside.sum():
        print(f'    outside umbra: {100*outside.sum()/disc.sum():5.1f}% of disc  rgb({cout[0]:5.1f},{cout[1]:5.1f},{cout[2]:5.1f})  lum {lum[outside].mean():6.1f}  max {lum[outside].max():6.1f}')
        print(f'    contrast: sunlit/umbral = {lum[outside].mean()/max(lum[inside].mean(),1):.2f}x   (peak {lum[outside].max()/max(lum[inside].mean(),1):.2f}x)')
    if expect_umbra_pct is not None:
        print(f'    expected umbral cover {expect_umbra_pct:.1f}%  -> measured {100*inside.sum()/disc.sum():.1f}%')

report('eclipse-max', (-41.54, 576.13, 645.01), 13.6838, 96.4)
report('eclipse-partial', (-315.28, 571.86, 644.89), 22.0523, 45.0)
report('eclipse-first-contact', (-484.76, 578.41, 644.84), 23.2385, 10.0)
report('total-2028', (273.04, 536.59, 645.38), -33.7881, 100.0)
report('quiet')
report('now')
