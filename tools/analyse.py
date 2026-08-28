import numpy as np
from PIL import Image
import math

def analyse(name, umbra=None, rotation_deg=None):
    img = Image.open(f'/home/user/work/shots/{name}-moon.png').convert('RGB')
    a = np.asarray(img).astype(float)
    h, w, _ = a.shape
    cy, cx = h / 2, w / 2
    R = min(h, w) / 2
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot(xx - cx, yy - cy)
    disc = r < R * 0.93
    lum = 0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]
    vals = lum[disc]
    print(f'\n=== {name}  ({w}x{h}px) ===')
    print(f'    disc pixels {disc.sum():,}  mean lum {vals.mean():6.1f}  max {vals.max():6.1f}')
    lit = disc & (lum > 110)
    frac = lit.sum() / disc.sum()
    print(f'    bright (lum>110): {100*frac:5.1f}% of the disc')
    if umbra is not None:
        # Where the shadow's centre lies on screen: SVG vector rotated with the disc.
        ux, uy = umbra[0] - 250, umbra[1] - 250
        th = math.radians(rotation_deg)
        sx = ux * math.cos(th) - uy * math.sin(th)
        sy = ux * math.sin(th) + uy * math.cos(th)
        ang_shadow = math.degrees(math.atan2(sy, sx))
        # centroid of the bright part, as an angle from the disc centre
        litmask = lit
        if litmask.sum() > 50:
            mx = (xx[litmask] - cx).mean(); my = (yy[litmask] - cy).mean()
            ang_lit = math.degrees(math.atan2(my, mx))
            diff = (ang_lit - ang_shadow + 540) % 360 - 180
            print(f'    shadow centre bearing {ang_shadow:7.1f} deg | bright-sliver bearing {ang_lit:7.1f} deg'
                  f' | separation {diff:6.1f} deg (180 = sliver opposite the shadow)')
        # mean colour inside the shadowed part vs the lit part
        for label, mask in (('shadowed', disc & (lum <= 110)), ('lit', litmask)):
            if mask.sum():
                c = a[mask].mean(axis=0)
                print(f'    mean colour {label:9s}: rgb({c[0]:5.1f},{c[1]:5.1f},{c[2]:5.1f})  lum {lum[mask].mean():6.1f}')
    return lum, disc

analyse('eclipse-max', umbra=(-41.54, 576.13), rotation_deg=13.6836)
analyse('eclipse-partial', umbra=(-315.28, 571.86), rotation_deg=22.0523)
analyse('eclipse-first-contact', umbra=(-484.76, 578.41), rotation_deg=23.2385)
analyse('total-2028', umbra=(273.04, 536.59), rotation_deg=-33.7881)
analyse('quiet')
analyse('now')
