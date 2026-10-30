# Accent presets for src/styles/accents.css. Checks every pairing the theming guide requires and
# refuses to write the file if one fails.
# Usage: python3 build/gen-accents.py src/styles/accents.css
def hx(c): c=c.lstrip('#'); return tuple(int(c[i:i+2],16)/255 for i in (0,2,4))
def lum(c):
    def ch(v): return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=[ch(v) for v in hx(c)]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=lum(a),lum(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def mix(c,a,bg):
    fc,bc=hx(c),hx(bg); return '#'+''.join(f'{round((a*x+(1-a)*y)*255):02x}' for x,y in zip(fc,bc))

DARK_BG=['#15171c','#1a1d23','#21242b','#0d0f13','#0a0b0e']   # bg-1, surface-1/2, base, inset
LIGHT_BG=['#ffffff','#f7f8fa','#f4f5f7','#edeff2']

P={
 'blue':  dict(dark=dict(accent='#60a5fa',hover='#93c5fd',press='#3b82f6',fg='#7cb5fb',on='#04122a'),
               light=dict(accent='#2563eb',hover='#1d4fd8',press='#1e40af',fg='#1d4ed8',on='#ffffff')),
 'violet':dict(dark=dict(accent='#a78bfa',hover='#c4b5fd',press='#9d84fa',fg='#b4a0fb',on='#160c33'),
               light=dict(accent='#7c3aed',hover='#6d28d9',press='#5b21b6',fg='#6d28d9',on='#ffffff')),
 'amber': dict(dark=dict(accent='#fbbf24',hover='#fcd34d',press='#f59e0b',fg='#fbbf24',on='#231500'),
               light=dict(accent='#b45309',hover='#92400e',press='#78350f',fg='#92400e',on='#ffffff')),
 'rose':  dict(dark=dict(accent='#fb7185',hover='#fda4af',press='#f43f5e',fg='#fb8799',on='#2b0610'),
               light=dict(accent='#e11d48',hover='#be123c',press='#9f1239',fg='#be123c',on='#ffffff')),
}
ok=True; out={}
for name,themes in P.items():
    for theme,c in themes.items():
        bgs=DARK_BG if theme=='dark' else LIGHT_BG
        ring_a=0.7 if theme=='dark' else 0.85
        checks={
          'on-accent text (4.5)': (min(cr(c['on'],c[k]) for k in ('accent','hover','press')),4.5),
          'accent fill vs surfaces (3)': (min(cr(c['accent'],b) for b in bgs),3),
          'accent-fg text vs surfaces (4.5)': (min(cr(c['fg'],b) for b in bgs),4.5),
          'ring vs surfaces (3)': (min(cr(mix(c['accent' if theme=='dark' else 'fg'],ring_a,b),b) for b in bgs),3),
          'accent-fg on accent-subtle (4.5)': (min(cr(c['fg'],mix(c['accent'],0.10,b)) for b in bgs),4.5),
        }
        for k,(v,need) in checks.items():
            flag='' if v>=need else '  <-- FAIL'
            if flag: ok=False
            print(f'{name:6} {theme:5} {k:36} {v:5.2f}{flag}')
print('ALL OK' if ok else 'SOME FAIL')
import sys as _sys
if not ok: _sys.exit(1)

def rgba(c,a):
    r,g,b=[round(v*255) for v in hx(c)]; return f'rgba({r}, {g}, {b}, {a})'
lines=['/* Coreloom UI — accent presets. Import after theme.css, then set one on <html> (or on any element,',
       ' * for a section with its own accent):',
       ' *   <html data-accent="violet">            (dark)',
       ' *   <html data-accent="violet" data-theme="light">',
       ' * Each preset replaces the whole accent family in both themes; every pairing meets WCAG AA',
       ' * (text 4.5:1, fills and focus rings 3:1 on all surfaces). Generated and checked by',
       ' * build/gen-accents.py: edit the colours there, then run',
       ' * python3 build/gen-accents.py src/styles/accents.css */',
       '']
for name,themes in P.items():
    for theme,c in themes.items():
        # On <html> or on any element (a section with its own accent); light wins inside light themes.
        sel=f'[data-accent="{name}"]' if theme=='dark' else f'[data-theme="light"][data-accent="{name}"],\n[data-theme="light"] [data-accent="{name}"]'
        ring=rgba(c['accent'] if theme=='dark' else c['fg'], 0.7 if theme=='dark' else 0.85)
        glow=f"0 0 0 1px {rgba(c['accent'],0.40 if theme=='dark' else 0.35)}, 0 6px {'24' if theme=='dark' else '20'}px {rgba(c['accent'],0.22 if theme=='dark' else 0.20)}"
        lines += [f'{sel} {{',
                  f"  --accent: {c['accent']};", f"  --accent-hover: {c['hover']};", f"  --accent-press: {c['press']};",
                  f"  --accent-fg: {c['fg']};", f"  --accent-subtle: {rgba(c['accent'],0.10)};", f"  --accent-ring: {ring};",
                  f"  --border-accent: {c['accent']};", f"  --fg-on-accent: {c['on']};", f"  --glow-accent: {glow};",
                  '}', '']
import sys
open(sys.argv[1],'w').write('\n'.join(lines))
print('written')
