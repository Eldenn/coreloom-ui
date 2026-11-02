# Surface presets for src/styles/surfaces.css: the backgrounds, borders and text greys of a page, in
# both themes. Checks every pairing the theming guide requires — on every surface of the preset, and
# with every accent preset of accents.css — and refuses to write the file if one fails.
# Usage: python3 build/gen-surfaces.py src/styles/surfaces.css
import re
import sys

def hx(c): c=c.lstrip('#'); return tuple(int(c[i:i+2],16)/255 for i in (0,2,4))
def lum(c):
    def ch(v): return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=[ch(v) for v in hx(c)]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=lum(a),lum(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def mix(c,a,bg):
    fc,bc=hx(c),hx(bg); return '#'+''.join(f'{round((a*x+(1-a)*y)*255):02x}' for x,y in zip(fc,bc))

# Token order as tokens.css declares them. Status colours are optional: a preset overrides them only
# when the defaults don't reach 4.5:1 on its surfaces.
TOKENS=['bg-base','bg-1','surface-1','surface-2','surface-hover','surface-inset',
        'fg-1','fg-2','fg-muted','fg-faint','border-subtle','border','border-strong']
STATUS={'dark':dict(success='#3dd68c',warning='#f5c451',danger='#ff6b6b'),
        'light':dict(success='#007330',warning='#885b00',danger='#b82731')}

P={
 # Mineral blue: slate greys pulled towards a cold, desaturated blue.
 'mineral':dict(
   dark=dict(**{'bg-base':'#0a1219','bg-1':'#0f1922','surface-1':'#14202a','surface-2':'#1a2833',
     'surface-hover':'#22323f','surface-inset':'#070d13','fg-1':'#e3eaf0','fg-2':'#a5b5c2',
     'fg-muted':'#8b9cab','fg-faint':'#56687a','border-subtle':'#19252f','border':'#2a3b4a',
     'border-strong':'#6d8295'}),
   light=dict(**{'bg-base':'#ebf0f4','bg-1':'#f5f8fa','surface-1':'#ffffff','surface-2':'#eff3f6',
     'surface-hover':'#e7edf1','surface-inset':'#e8eef2','fg-1':'#122230','fg-2':'#3b4e5e',
     'fg-muted':'#596b7a','fg-faint':'#9babb8','border-subtle':'#e1e8ee','border':'#cfd9e1',
     'border-strong':'#7a8896'})),
 # Bone: warm off-whites in light, the same warmth in a brown-black in dark.
 'bone':dict(
   dark=dict(**{'bg-base':'#100e0b','bg-1':'#171410','surface-1':'#1d1915','surface-2':'#24201a',
     'surface-hover':'#2d2821','surface-inset':'#0c0a08','fg-1':'#ede7dd','fg-2':'#bbb2a4',
     'fg-muted':'#9f9688','fg-faint':'#655c50','border-subtle':'#231f19','border':'#3a342b',
     'border-strong':'#837969'}),
   light=dict(**{'bg-base':'#f4efe7','bg-1':'#faf7f1','surface-1':'#fdfbf7','surface-2':'#f5f0e7',
     'surface-hover':'#f0ebe2','surface-inset':'#f1ece4','fg-1':'#1f1b16','fg-2':'#4b4339',
     'fg-muted':'#685f53','fg-faint':'#aca291','border-subtle':'#ebe5da','border':'#dcd3c4',
     'border-strong':'#877d6f'},
     warning='#7f5400')),
}

def accent_presets(path):
    """The accent values of accents.css: {name: {theme: {accent, fg, ring}}}."""
    css=re.sub(r'/\*.*?\*/','',open(path).read(),flags=re.S)
    out={}
    for sel,body in re.findall(r'([^{}]+)\{([^}]*)\}',css):
        m=re.search(r"\[data-accent='([a-z-]+)'\]",sel)
        if not m: continue
        theme='light' if 'light' in sel else 'dark'
        v=dict(re.findall(r'--([a-z-]+):\s*([^;]+);',body))
        ring=re.match(r'rgba\((\d+), (\d+), (\d+), ([\d.]+)\)',v['accent-ring'])
        ring_c='#'+''.join(f'{int(ring.group(i)):02x}' for i in (1,2,3))
        out.setdefault(m.group(1),{})[theme]=dict(accent=v['accent'],fg=v['accent-fg'],
                                                 ring=ring_c,ring_a=float(ring.group(4)))
    return out

ACCENTS=accent_presets('src/styles/accents.css')
ok=True
for name,themes in P.items():
    for theme,c in themes.items():
        bgs=[c[k] for k in ('bg-base','bg-1','surface-1','surface-2','surface-hover','surface-inset')]
        status={**STATUS[theme],**{k:c[k] for k in ('success','warning','danger') if k in c}}
        checks={
          'fg-1 text (4.5)':(min(cr(c['fg-1'],b) for b in bgs),4.5),
          'fg-2 text (4.5)':(min(cr(c['fg-2'],b) for b in bgs),4.5),
          'fg-muted text (4.5)':(min(cr(c['fg-muted'],b) for b in bgs),4.5),
          'border-strong vs surfaces (3)':(min(cr(c['border-strong'],b) for b in bgs),3),
          **{f'{k} text (4.5)':(min(cr(v,b) for b in bgs),4.5) for k,v in status.items()},
        }
        for an,a in ACCENTS.items():
            x=a[theme]
            checks[f'{an} fill (3)']=(min(cr(x['accent'],b) for b in bgs),3)
            checks[f'{an} text (4.5)']=(min(cr(x['fg'],b) for b in bgs),4.5)
            checks[f'{an} ring (3)']=(min(cr(mix(x['ring'],x['ring_a'],b),b) for b in bgs),3)
            checks[f'{an} text on subtle (4.5)']=(min(cr(x['fg'],mix(x['accent'],0.10,b)) for b in bgs),4.5)
        for k,(v,need) in checks.items():
            flag='' if v>=need else '  <-- FAIL'
            if flag: ok=False
            print(f'{name:8} {theme:5} {k:34} {v:5.2f}{flag}')
print('ALL OK' if ok else 'SOME FAIL')
if not ok: sys.exit(1)
if len(sys.argv)<2: sys.exit(0)

lines=['/* Coreloom UI — surface presets: the backgrounds, borders and text greys of the page. Import after',
       ' * theme.css (and accents.css), then set one on <html>, next to data-theme:',
       ' *   <html data-surface="bone" data-theme="light">',
       ' * or on any element, for a band of its own. Put data-surface on the same element as data-theme',
       ' * when a section changes theme:',
       ' *   <section data-theme="dark" data-surface="mineral">',
       ' * Each preset replaces every surface, border and text grey in both themes; every pairing meets',
       ' * WCAG AA on all of its surfaces, with every accent preset. Generated and checked by',
       ' * build/gen-surfaces.py: edit the colours there, then run',
       ' * python3 build/gen-surfaces.py src/styles/surfaces.css */',
       '']
for name,themes in P.items():
    for theme,c in themes.items():
        # Same-element selectors win over the descendant one, so a dark band inside a light page stays dark.
        sel=(f"[data-surface='{name}'],\n[data-theme='dark'][data-surface='{name}']" if theme=='dark'
             else f"[data-theme='light'][data-surface='{name}'],\n:where([data-theme='light']) [data-surface='{name}']")
        lines.append(f'{sel} {{')
        lines += [f'  --{k}: {c[k]};' for k in TOKENS]
        lines += [f'  --{k}: {c[k]};' for k in ('success','warning','danger') if k in c]
        lines += ['}','']
open(sys.argv[1],'w').write('\n'.join(lines))
print('written')
