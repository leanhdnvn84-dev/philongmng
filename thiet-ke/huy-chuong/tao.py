"""Dựng huy-chuong.html (SVG + phông nhúng). Chạy: python3 tao.py <thư mục fontsource đã giải nén>"""
import base64, math, sys, os, glob
F = sys.argv[1] if len(sys.argv) > 1 else '.'
def woff(pat):
    p = glob.glob(os.path.join(F, '**', pat), recursive=True)[0]
    return base64.b64encode(open(p, 'rb').read()).decode()
VN = 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB'
LA = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
css = ''
for fam, w, stem in [('BVP', 800, 'be-vietnam-pro-%s-800'), ('BVP', 900, 'be-vietnam-pro-%s-900'), ('PFD', 900, 'playfair-display-%s-900'), ('DS', 700, 'dancing-script-%s-700')]:
    for sub, rng in [('vietnamese', VN), ('latin', LA)]:
        css += "@font-face{font-family:'%s';font-weight:%d;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:%s}\n" % (fam, w, woff((stem % sub) + '-normal.woff2'), rng)

CX, CY = 500, 900
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def strap(tl, tr, bl, br):
    out = ''
    for a, b, col in [(0, 1, '#B3261E'), (.22, .78, '#FFFFFF'), (.36, .64, '#1D4F91')]:
        pts = [lerp(tl, tr, a), lerp(tl, tr, b), lerp(bl, br, b), lerp(bl, br, a)]
        out += '<polygon points="%s" fill="%s"/>' % (' '.join('%.1f,%.1f' % p for p in pts), col)
    return out
# răng cưa viền vàng
sao = ' '.join('%.1f,%.1f' % (CX + (412 if i % 2 == 0 else 388) * math.sin(math.pi * i / 36), CY - (412 if i % 2 == 0 else 388) * math.cos(math.pi * i / 36)) for i in range(72))
def ngoisao(x, y, r, col):
    p = ' '.join('%.1f,%.1f' % (x + (r if i % 2 == 0 else r * .42) * math.sin(math.pi * i / 5), y - (r if i % 2 == 0 else r * .42) * math.cos(math.pi * i / 5)) for i in range(10))
    return '<polygon points="%s" fill="%s"/>' % (p, col)

svg = f'''<svg id="hc" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">
<defs>
 <linearGradient id="vang" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".35" stop-color="#E9C25A"/><stop offset=".7" stop-color="#C9962E"/><stop offset="1" stop-color="#8A6118"/></linearGradient>
 <radialGradient id="long" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#FFF6D2"/><stop offset=".55" stop-color="#F1CF6E"/><stop offset="1" stop-color="#C9962E"/></radialGradient>
 <linearGradient id="bia" x1="0" x2="1"><stop offset="0" stop-color="#E89A1C"/><stop offset=".5" stop-color="#FFC94A"/><stop offset="1" stop-color="#D98512"/></linearGradient>
 <linearGradient id="chai" x1="0" x2="1"><stop offset="0" stop-color="#1F4D2B"/><stop offset=".45" stop-color="#3E8A52"/><stop offset="1" stop-color="#1A3F24"/></linearGradient>
 <linearGradient id="kinh" x1="0" x2="1"><stop offset="0" stop-color="#DCEFFB" stop-opacity=".75"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#BFDFF3" stop-opacity=".75"/></linearGradient>
 <filter id="bong" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".35"/></filter>
 <path id="cungTren" d="M {CX-322} {CY} A 322 322 0 0 1 {CX+322} {CY}"/>
 <path id="cungDuoi" d="M {CX-344} {CY} A 344 344 0 0 0 {CX+344} {CY}"/>
</defs>
<!-- dây đeo -->
{strap((560,0),(770,0),(470,600),(610,620))}
{strap((230,0),(440,0),(390,620),(530,600))}
<rect x="400" y="560" width="200" height="74" rx="14" fill="url(#vang)" stroke="#8A6118" stroke-width="4"/>
<rect x="420" y="578" width="160" height="38" rx="8" fill="none" stroke="#FFF1B8" stroke-width="3" opacity=".8"/>
<!-- huy chương -->
<g filter="url(#bong)">
 <polygon points="{sao}" fill="url(#vang)" stroke="#8A6118" stroke-width="3"/>
 <circle cx="{CX}" cy="{CY}" r="362" fill="#14315C" stroke="#E9C25A" stroke-width="8"/>
 <circle cx="{CX}" cy="{CY}" r="296" fill="url(#long)" stroke="#8A6118" stroke-width="5"/>
 <circle cx="{CX}" cy="{CY}" r="280" fill="none" stroke="#FFF6D2" stroke-width="2" stroke-dasharray="6 9" opacity=".9"/>
</g>
<text font-family="BVP" font-weight="900" font-size="33" letter-spacing="2" fill="#F6D86B"><textPath href="#cungTren" startOffset="50%" text-anchor="middle">ĐỘI NĂNG NỔ TRONG CÔNG TÁC</textPath></text>
<text font-family="BVP" font-weight="800" font-size="30" letter-spacing="4" fill="#F6D86B"><textPath href="#cungDuoi" startOffset="50%" text-anchor="middle">NGUYỄN HIỀN · 2000 – 2003</textPath></text>
{ngoisao(CX-338, CY+6, 15, '#F6D86B')}{ngoisao(CX+338, CY+6, 15, '#F6D86B')}
<text x="{CX}" y="662" text-anchor="middle" font-family="DS" font-weight="700" font-size="46" fill="#7A4E12">Huy chương vàng</text>
<!-- cốc bia -->
<g transform="translate(250 735)">
 <path d="M96 40 q48 -6 50 44 q2 52 -50 46" fill="none" stroke="#B9851E" stroke-width="16" stroke-linecap="round"/>
 <rect x="0" y="30" width="104" height="150" rx="14" fill="url(#bia)" stroke="#9A6510" stroke-width="5"/>
 <rect x="16" y="46" width="12" height="118" rx="6" fill="#FFF3C4" opacity=".7"/>
 <circle cx="60" cy="120" r="5" fill="#FFF3C4"/><circle cx="74" cy="92" r="4" fill="#FFF3C4"/><circle cx="50" cy="150" r="3.5" fill="#FFF3C4"/>
 <path d="M-8 40 q0 -26 22 -26 q8 -22 32 -14 q14 -18 36 -4 q24 -6 30 18 q14 8 6 26 z" fill="#FFFFFF" stroke="#E7D9B5" stroke-width="3"/>
</g>
<!-- chai rượu -->
<g transform="translate(460 692) scale(.9)">
 <rect x="30" y="0" width="28" height="22" rx="4" fill="#B3261E"/>
 <rect x="32" y="20" width="24" height="64" fill="url(#chai)"/>
 <path d="M32 84 q-30 22 -30 64 v118 q0 14 14 14 h56 q14 0 14 -14 v-118 q0 -42 -30 -64 z" fill="url(#chai)" stroke="#15341D" stroke-width="4"/>
 <rect x="8" y="160" width="72" height="66" rx="6" fill="#FBF5E6" stroke="#C9A24A" stroke-width="3"/>
 <text x="44" y="190" text-anchor="middle" font-family="BVP" font-weight="900" font-size="17" fill="#B3261E">RƯỢU</text>
 <text x="44" y="214" text-anchor="middle" font-family="DS" font-weight="700" font-size="17" fill="#14315C">Quê nhà</text>
 <rect x="14" y="100" width="9" height="150" rx="4" fill="#FFFFFF" opacity=".28"/>
</g>
<!-- ly đá -->
<g transform="translate(616 772)">
 <path d="M0 0 h120 l-12 150 q-1 10 -11 10 h-74 q-10 0 -11 -10 z" fill="url(#kinh)" stroke="#8FBEDC" stroke-width="4"/>
 <g fill="#E8F6FF" stroke="#7DB3D6" stroke-width="3">
  <rect x="18" y="62" width="40" height="38" rx="8" transform="rotate(-12 38 81)"/>
  <rect x="58" y="70" width="40" height="38" rx="8" transform="rotate(14 78 89)"/>
  <rect x="36" y="104" width="40" height="38" rx="8" transform="rotate(-5 56 123)"/>
  <rect x="40" y="26" width="38" height="36" rx="8" transform="rotate(20 59 44)"/>
 </g>
 <path d="M14 18 l4 120" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".8"/>
</g>
<!-- đĩa mồi -->
<g transform="translate(500 958)">
 <ellipse cx="0" cy="0" rx="190" ry="34" fill="#FFFFFF" stroke="#C9A24A" stroke-width="5"/>
 <ellipse cx="0" cy="-4" rx="150" ry="22" fill="#F4EBD6"/>
 <g fill="#C98A3E" stroke="#8A5520" stroke-width="2">
  <path d="M-120 -10 q30 -26 70 -8 q-30 4 -70 8z"/><path d="M-60 -18 q36 -22 72 2 q-38 -2 -72 -2z"/><path d="M20 -14 q40 -24 84 -2 q-44 2 -84 2z"/>
 </g>
 <g fill="#D9A766" stroke="#9A6A30" stroke-width="2">
  <ellipse cx="-20" cy="-8" rx="13" ry="8"/><ellipse cx="2" cy="-2" rx="13" ry="8"/><ellipse cx="60" cy="-6" rx="12" ry="7"/><ellipse cx="90" cy="2" rx="12" ry="7"/><ellipse cx="-90" cy="0" rx="12" ry="7"/>
 </g>
 <path d="M120 -16 q14 -30 34 -20 q-4 18 -34 20z" fill="#3E8A52"/><circle cx="130" cy="-8" r="9" fill="#B3261E"/>
</g>
<!-- băng rôn -->
<g filter="url(#bong)">
 <path d="M90 996 l70 -18 v92 l-70 18 l26 -46 z" fill="#8C1D17"/>
 <path d="M910 996 l-70 -18 v92 l70 18 l-26 -46 z" fill="#8C1D17"/>
 <path d="M160 978 l40 22 v92 l-40 -22 z" fill="#5E120E"/><path d="M840 978 l-40 22 v92 l40 -22 z" fill="#5E120E"/>
 <rect x="200" y="1000" width="600" height="92" fill="#B3261E"/>
 <rect x="200" y="1008" width="600" height="3" fill="#F6D86B"/><rect x="200" y="1081" width="600" height="3" fill="#F6D86B"/>
</g>
<text x="{CX}" y="1061" text-anchor="middle" font-family="BVP" font-weight="900" font-size="44" letter-spacing="3" fill="#FFFFFF">BIA · RƯỢU · ĐÁ · MỒI</text>
<text x="{CX}" y="1138" text-anchor="middle" font-family="DS" font-weight="700" font-size="36" fill="#7A4E12">Uống có tâm – Về có tầm</text>
<text x="{CX}" y="1172" text-anchor="middle" font-family="BVP" font-weight="800" font-size="19" letter-spacing="4" fill="#8A6118">GALA · 14.11.2026</text>
</svg>'''
html = '<!doctype html><html><head><meta charset="utf-8"><style>' + css + 'body{margin:0;background:transparent}#nen{width:1600px;height:1400px;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#3B2B20,#120c08)}</style></head><body>' + svg + '<div id="nen">' + svg.replace('id="hc"', 'id="hc2" style="height:1300px;width:auto"') + '</div></body></html>'
open('huy-chuong.html', 'w', encoding='utf-8').write(html)
print('ok', len(html))
