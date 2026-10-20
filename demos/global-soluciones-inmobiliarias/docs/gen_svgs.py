"""Genera ilustraciones SVG propias para los inmuebles ficticios de la demo
de Global Soluciones Inmobiliarias. Nada se copia de portales: todo es dibujo
vectorial generado aquí."""
import os, sys

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
W, H = 1200, 800

SKIES = {
    "dia": ("#9CC9E6", "#E4F1F7"),
    "tarde": ("#F2B98A", "#FBE6CC"),
    "claro": ("#B9D7E8", "#F4F1EA"),
    "ocaso": ("#8E9FC9", "#F6C9A4"),
}

BASE_DEFS = ('<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4F0F5"/>'
             '<stop offset=".55" stop-color="#A9C8D8"/><stop offset="1" stop-color="#7FA2B6"/></linearGradient>'
             '<linearGradient id="wa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3E0"/>'
             '<stop offset="1" stop-color="#2E9DB6"/></linearGradient>')

def svg(body, defs=""):
    if 'id="gl"' not in defs:
        defs += BASE_DEFS
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'preserveAspectRatio="xMidYMid slice"><defs>{defs}</defs>{body}</svg>')

def sky(kind, sun=True, sx=930, sy=170):
    a, b = SKIES[kind]
    d = (f'<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/>'
         f'<stop offset="1" stop-color="{b}"/></linearGradient>'
         '<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DDEBF2"/>'
         '<stop offset=".55" stop-color="#8FB3C7"/><stop offset="1" stop-color="#5E8299"/></linearGradient>'
         '<linearGradient id="wa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3E0"/>'
         '<stop offset="1" stop-color="#2E9DB6"/></linearGradient>')
    b_ = f'<rect width="{W}" height="{H}" fill="url(#sk)"/>'
    if sun:
        b_ += f'<circle cx="{sx}" cy="{sy}" r="58" fill="#FFF4D6" opacity=".9"/>'
    b_ += ('<path d="M0 230 Q120 200 240 222 T480 214 T760 226 T1200 210 V260 H0Z" fill="#fff" opacity=".35"/>')
    return d, b_

def hills(y=520, c1="#B7C49A", c2="#9DB07F"):
    return (f'<path d="M0 {y} Q200 {y-60} 420 {y-20} T820 {y-40} T1200 {y-10} V{H} H0Z" fill="{c1}"/>'
            f'<path d="M0 {y+30} Q260 {y-10} 520 {y+20} T1200 {y+5} V{H} H0Z" fill="{c2}"/>')

def ground(y=600, c="#C9C2AE"):
    return f'<rect y="{y}" width="{W}" height="{H-y}" fill="{c}"/>'

def olive(x, y, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-6 0 L-4 -70 Q0 -80 4 -70 L6 0Z" fill="#6B5A44"/>'
            '<ellipse cx="-30" cy="-95" rx="46" ry="34" fill="#7F9468"/><ellipse cx="26" cy="-110" rx="50" ry="38" fill="#93A77B"/>'
            '<ellipse cx="0" cy="-140" rx="40" ry="30" fill="#A6B98C"/></g>')

def palm(x, y, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})" fill="none" stroke-linecap="round">'
            '<path d="M0 0 Q-8 -110 10 -220" stroke="#7A6248" stroke-width="12"/>'
            '<g stroke="#5E8A5A" stroke-width="10"><path d="M10 -220 Q-60 -240 -110 -190"/><path d="M10 -220 Q80 -250 130 -200"/>'
            '<path d="M10 -220 Q-30 -280 -80 -270"/><path d="M10 -220 Q60 -290 100 -280"/><path d="M10 -220 Q10 -280 20 -300"/></g></g>')

def cypress(x, y, h=180):
    return f'<path d="M{x} {y} Q{x-26} {y-h*0.5} {x} {y-h} Q{x+26} {y-h*0.5} {x} {y}Z" fill="#4F6B4A"/>'

def shadow(x, y, w):
    return f'<ellipse cx="{x}" cy="{y}" rx="{w}" ry="14" fill="#000" opacity=".12"/>'

def window(x, y, w, h, frame="#2B3138", glass="url(#gl)", mull=True):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{frame}"/>'
    s += f'<rect x="{x+6}" y="{y+6}" width="{w-12}" height="{h-12}" fill="{glass}"/>'
    if mull:
        s += f'<rect x="{x+w/2-3}" y="{y}" width="6" height="{h}" fill="{frame}"/>'
    s += f'<path d="M{x+14} {y+h-20} L{x+w*0.45} {y+14}" stroke="#fff" stroke-width="6" opacity=".35"/>'
    return s

# ---------- Exteriores ----------

def chalet(accent, kind="dia"):
    d, b = sky(kind)
    b += hills()
    b += ground(610, "#D9D2BF")
    b += cypress(140, 610, 230) + cypress(185, 612, 190)
    b += shadow(620, 612, 420)
    # cuerpo bajo
    b += '<rect x="250" y="400" width="740" height="210" fill="#F7F5F0"/>'
    b += '<rect x="250" y="400" width="740" height="16" fill="#E5E1D6"/>'
    # cuerpo alto
    b += '<rect x="520" y="250" width="420" height="160" fill="#FBFAF6"/>'
    b += '<rect x="500" y="236" width="460" height="18" fill="#2B3138"/>'
    b += f'<rect x="250" y="396" width="270" height="10" fill="#2B3138"/>'
    b += f'<rect x="300" y="300" width="220" height="100" fill="{accent}" opacity=".9"/>'
    b += window(560, 285, 180, 100) + window(760, 285, 150, 100)
    b += window(290, 450, 260, 150, mull=True) + window(600, 450, 120, 150, mull=False)
    b += '<rect x="760" y="450" width="80" height="160" fill="#6B4E36"/><circle cx="828" cy="530" r="4" fill="#E4C27A"/>'
    b += window(870, 450, 100, 110)
    # piscina
    b += '<path d="M180 690 L1020 690 L1080 780 L120 780Z" fill="#EDE8DC"/>'
    b += '<path d="M240 700 L960 700 L1000 765 L200 765Z" fill="url(#wa)"/>'
    b += '<path d="M300 725 Q340 718 380 725 T460 725 M620 740 Q660 733 700 740 T780 740" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>'
    b += palm(1080, 640, 1.0) + olive(110, 690, .8)
    return svg(b, d)

def adosado(accent, kind="claro"):
    d, b = sky(kind, sx=200, sy=150)
    b += hills(540)
    b += ground(620, "#CFC7B3")
    for i, x in enumerate([90, 430, 770]):
        hi = i == 1
        wall = "#FBF8F1" if hi else "#EFEBE1"
        b += shadow(x + 170, 622, 180)
        b += f'<rect x="{x}" y="330" width="340" height="290" fill="{wall}"/>'
        b += f'<path d="M{x-14} 340 L{x+170} 230 L{x+354} 340Z" fill="#B65F3F"/>'
        b += f'<path d="M{x-14} 340 L{x+170} 230 L{x+354} 340" stroke="#8E4429" stroke-width="8" fill="none"/>'
        b += window(x + 40, 370, 110, 90) + window(x + 190, 370, 110, 90)
        b += f'<rect x="{x+30}" y="458" width="130" height="10" fill="#3A3F45"/>'
        b += f'<rect x="{x+190}" y="500" width="80" height="120" fill="{accent if hi else "#7A5A40"}"/>'
        b += window(x + 40, 500, 120, 100)
        b += f'<rect x="{x}" y="600" width="340" height="20" fill="#DCD5C4"/>'
    b += olive(70, 690, .9) + olive(1140, 700, .8)
    b += '<rect y="660" width="1200" height="140" fill="#BDB49E"/>'
    b += '<path d="M0 700 H1200" stroke="#fff" stroke-width="6" stroke-dasharray="50 40" opacity=".6"/>'
    return svg(b, d)

def piso(accent, kind="dia"):
    d, b = sky(kind, sx=1020, sy=140)
    b += '<rect x="0" y="420" width="200" height="380" fill="#C7CDD2"/><rect x="1000" y="380" width="200" height="420" fill="#BFC6CC"/>'
    b += shadow(600, 700, 360)
    b += '<rect x="290" y="160" width="620" height="540" fill="#F1EEE8"/>'
    b += '<rect x="290" y="160" width="620" height="22" fill="#2E343B"/>'
    for r in range(5):
        y = 210 + r * 96
        for c in range(4):
            x = 320 + c * 148
            b += window(x, y, 110, 66, mull=False)
            b += f'<rect x="{x-8}" y="{y+66}" width="126" height="10" fill="#2E343B"/>'
            if c in (1, 2):
                b += f'<path d="M{x-6} {y+40} H{x+116}" stroke="#2E343B" stroke-width="3"/>'
                b += ''.join(f'<path d="M{x-6+k*12} {y+40} V{y+66}" stroke="#2E343B" stroke-width="2"/>' for k in range(11))
    b += f'<rect x="530" y="600" width="140" height="100" fill="{accent}"/>'
    b += '<rect x="548" y="616" width="104" height="84" fill="url(#gl)"/>'
    b += '<rect y="700" width="1200" height="100" fill="#B7B0A0"/>'
    b += olive(200, 720, .8) + olive(1010, 730, .9)
    return svg(b, d)

def atico(accent, kind="ocaso"):
    d, b = sky(kind, sx=240, sy=210)
    # skyline
    for x, w_, h_ in [(0, 140, 260), (130, 120, 330), (240, 160, 230), (880, 150, 300), (1020, 180, 250)]:
        b += f'<rect x="{x}" y="{800-h_}" width="{w_}" height="{h_}" fill="#9AA3B5" opacity=".7"/>'
    b += '<path d="M560 340 L590 250 L620 340Z" fill="#8F98AB" opacity=".7"/>'
    # terraza en primer plano
    b += '<rect x="0" y="560" width="1200" height="240" fill="#D8CCB8"/>'
    b += ''.join(f'<path d="M{x} 560 L{x-120} 800" stroke="#C6B9A2" stroke-width="3"/>' for x in range(80, 1400, 120))
    b += '<rect x="0" y="520" width="1200" height="14" fill="#F4F1EC"/>'
    b += ''.join(f'<rect x="{x}" y="534" width="4" height="30" fill="#F4F1EC"/>' for x in range(10, 1200, 40))
    # pérgola
    b += '<rect x="640" y="250" width="16" height="320" fill="#6E5A45"/><rect x="1120" y="250" width="16" height="320" fill="#6E5A45"/>'
    b += '<rect x="620" y="240" width="540" height="18" fill="#6E5A45"/>'
    b += ''.join(f'<rect x="{x}" y="226" width="10" height="44" fill="#86705A"/>' for x in range(650, 1150, 40))
    # mobiliario
    b += f'<rect x="720" y="480" width="300" height="60" rx="14" fill="{accent}"/><rect x="720" y="440" width="300" height="50" rx="14" fill="#E9E2D6"/>'
    b += '<rect x="740" y="540" width="14" height="40" fill="#4A4038"/><rect x="986" y="540" width="14" height="40" fill="#4A4038"/>'
    b += '<rect x="360" y="580" width="180" height="16" rx="8" fill="#4A4038"/><rect x="440" y="596" width="20" height="70" fill="#4A4038"/>'
    b += '<path d="M150 560 q20 -90 60 -110 q-10 60 -30 110z M190 560 q30 -70 70 -80 q-20 50 -50 80z" fill="#6E9161"/>'
    b += '<rect x="130" y="560" width="120" height="70" fill="#B9764F"/>'
    return svg(b, d)

def pueblo(accent, kind="tarde"):
    d, b = sky(kind, sx=1040, sy=180)
    b += '<rect y="620" width="1200" height="180" fill="#C9B79B"/>'
    b += ''.join(f'<path d="M{x} 640 h60 M{x+30} 680 h60 M{x} 720 h60" stroke="#B9A584" stroke-width="4"/>' for x in range(0, 1200, 120))
    b += '<rect x="0" y="300" width="160" height="320" fill="#F3EEE4"/><rect x="1040" y="280" width="160" height="340" fill="#EFE9DD"/>'
    b += shadow(600, 622, 420)
    b += '<rect x="170" y="250" width="860" height="370" fill="#FDFBF6"/>'
    b += '<rect x="170" y="250" width="860" height="26" fill="#D9A441"/>'
    b += '<rect x="170" y="580" width="860" height="40" fill="#D9A441"/>'
    b += '<path d="M150 252 H1050 L1030 230 H170Z" fill="#B65F3F"/>'
    for x in (240, 820):
        b += f'<rect x="{x}" y="330" width="140" height="190" fill="#3B2F25"/>'
        b += ''.join(f'<rect x="{x+12+k*24}" y="320" width="5" height="210" fill="#1E1A17"/>' for k in range(6))
        b += f'<rect x="{x-10}" y="318" width="160" height="8" fill="#1E1A17"/><rect x="{x-10}" y="522" width="160" height="8" fill="#1E1A17"/>'
        b += f'<g fill="#C24A5A"><circle cx="{x+20}" cy="530" r="12"/><circle cx="{x+60}" cy="534" r="14"/><circle cx="{x+110}" cy="530" r="12"/></g>'
        b += f'<g fill="#5D8A4F"><circle cx="{x+40}" cy="538" r="10"/><circle cx="{x+90}" cy="540" r="10"/></g>'
    b += f'<path d="M520 580 V380 Q600 300 680 380 V580Z" fill="{accent}"/>'
    b += '<path d="M600 580 V340" stroke="#000" stroke-opacity=".25" stroke-width="4"/>'
    b += '<circle cx="585" cy="480" r="6" fill="#E4C27A"/><circle cx="615" cy="480" r="6" fill="#E4C27A"/>'
    b += '<rect x="470" y="300" width="260" height="10" fill="#1E1A17" opacity=".7"/>'
    return svg(b, d)

def solar(accent, kind="dia"):
    d, b = sky(kind, sx=300, sy=150)
    b += hills(500, "#C4CDA6", "#ADBB8B")
    b += '<rect x="0" y="420" width="220" height="140" fill="#F2EEE5"/><path d="M-10 425 L110 360 L230 425Z" fill="#B65F3F"/>'
    b += '<rect x="980" y="400" width="220" height="160" fill="#EFEBE1"/><path d="M970 405 L1090 340 L1210 405Z" fill="#B65F3F"/>'
    b += '<path d="M0 560 H1200 V800 H0Z" fill="#D7C79B"/>'
    b += '<path d="M120 580 L1080 580 L1180 790 L20 790Z" fill="#CDBB86"/>'
    b += ''.join(f'<path d="M{x} {y} l6 -18 l6 18" stroke="#9CA86C" stroke-width="3" fill="none"/>' for x, y in [(200,640),(330,700),(470,620),(610,720),(760,650),(900,700),(1010,620),(280,760),(820,760),(560,670)])
    # vallado
    b += ''.join(f'<rect x="{x}" y="560" width="6" height="40" fill="#6B6F73"/>' for x in range(120, 1090, 48))
    b += '<path d="M120 572 H1086 M120 590 H1086" stroke="#6B6F73" stroke-width="3"/>'
    # cartel
    b += '<rect x="796" y="470" width="10" height="140" fill="#3A3F45"/><rect x="900" y="470" width="10" height="140" fill="#3A3F45"/>'
    b += f'<rect x="760" y="380" width="190" height="110" fill="{accent}"/>'
    b += '<rect x="776" y="400" width="120" height="14" fill="#fff"/><rect x="776" y="426" width="80" height="10" fill="#fff" opacity=".7"/><rect x="776" y="446" width="150" height="24" fill="#fff" opacity=".9"/>'
    b += '<path d="M300 690 l180 -60 l220 40 l-160 70z" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="14 10" opacity=".8"/>'
    b += olive(1120, 640, .9)
    return svg(b, d)

def nave(accent, kind="claro"):
    d, b = sky(kind, sx=1000, sy=160)
    b += '<rect y="600" width="1200" height="200" fill="#B9B6AE"/>'
    b += '<path d="M0 690 H1200" stroke="#F2D04A" stroke-width="8" stroke-dasharray="70 40"/>'
    b += shadow(600, 602, 460)
    b += '<path d="M150 600 V330 L600 250 L1050 330 V600Z" fill="#D9DDE0"/>'
    b += ''.join(f'<path d="M{x} 600 V{330 - (x-150)*80/450 if x<=600 else 250 + (x-600)*80/450}" stroke="#C3C8CC" stroke-width="4"/>' for x in range(180, 1050, 30))
    b += '<path d="M140 332 L600 246 L1060 332" stroke="#2E343B" stroke-width="14" fill="none"/>'
    b += '<rect x="250" y="400" width="330" height="200" fill="#8C939A"/>'
    b += ''.join(f'<path d="M250 {y} H580" stroke="#7A8188" stroke-width="3"/>' for y in range(412, 600, 14))
    b += f'<rect x="650" y="470" width="110" height="130" fill="{accent}"/>'
    b += '<rect x="820" y="400" width="180" height="60" fill="url(#gl)"/>'
    b += f'<rect x="250" y="360" width="330" height="26" fill="{accent}" opacity=".85"/>'
    return svg(b, d)

def local(accent, kind="dia"):
    d, b = sky(kind, sun=False)
    b += '<rect y="0" width="1200" height="800" fill="#EDE7DB"/>'
    b += '<rect x="0" y="0" width="1200" height="180" fill="#E4DCCC"/>'
    b += ''.join(window(x, 40, 160, 110, mull=True) for x in (120, 520, 920))
    b += '<rect x="0" y="180" width="1200" height="20" fill="#2E343B"/>'
    b += f'<path d="M80 210 H1120 L1080 300 H120Z" fill="{accent}"/>'
    b += ''.join(f'<path d="M{x} 210 L{x-6} 300" stroke="#fff" stroke-width="22" opacity=".25"/>' for x in range(160, 1120, 90))
    b += '<rect x="100" y="320" width="1000" height="380" fill="#2E343B"/>'
    b += '<rect x="120" y="340" width="600" height="360" fill="url(#gl)"/>'
    b += '<rect x="760" y="340" width="320" height="360" fill="url(#gl)"/>'
    b += '<rect x="900" y="340" width="10" height="360" fill="#2E343B"/>'
    b += '<rect x="160" y="560" width="220" height="12" fill="#2E343B" opacity=".5"/><rect x="420" y="520" width="240" height="12" fill="#2E343B" opacity=".5"/>'
    b += '<rect y="700" width="1200" height="100" fill="#BDB49E"/>'
    return svg(b, d)

def pareado(accent, kind="tarde"):
    d, b = sky(kind, sx=180, sy=170)
    b += hills(520)
    b += '<rect y="600" width="1200" height="200" fill="#9FB57A"/>'
    b += shadow(600, 602, 440)
    for x, flip in ((170, False), (600, True)):
        b += f'<rect x="{x}" y="340" width="430" height="260" fill="{"#FAF7F0" if not flip else "#F1ECE2"}"/>'
        b += window(x + 40, 380, 130, 90) + window(x + 250, 380, 130, 90)
        b += window(x + 40, 490, 160, 110)
        b += f'<rect x="{x+260}" y="480" width="90" height="120" fill="{accent if not flip else "#6B4E36"}"/>'
    b += '<path d="M150 350 L385 240 L600 340 L815 240 L1050 350Z" fill="#59606A"/>'
    b += '<rect x="594" y="300" width="12" height="300" fill="#D9D3C5"/>'
    b += '<path d="M380 600 L330 800 H470 L440 600Z M820 600 L780 800 H920 L880 600Z" fill="#E1D8C3"/>'
    b += ''.join(f'<circle cx="{x}" cy="{y}" r="22" fill="#6E9161"/>' for x, y in [(120,600),(160,610),(1080,600),(1120,612),(560,620),(640,620)])
    b += olive(70, 760, 1.0)
    return svg(b, d)

# ---------- Interiores ----------

def salon(accent, wall="#F3EFE7"):
    b = f'<rect width="{W}" height="{H}" fill="{wall}"/>'
    b += '<rect y="600" width="1200" height="200" fill="#C9AE8A"/>'
    b += ''.join(f'<path d="M{x} 600 L{x-180} 800" stroke="#B89C77" stroke-width="3"/>' for x in range(100, 1500, 140))
    b += window(640, 140, 440, 380, frame="#2E343B")
    b += '<rect x="1110" y="120" width="40" height="480" fill="#E3DACB"/>'
    b += '<ellipse cx="520" cy="700" rx="380" ry="60" fill="#E7DFD0"/>'
    b += f'<rect x="170" y="470" width="560" height="140" rx="26" fill="{accent}"/>'
    b += f'<rect x="150" y="420" width="60" height="190" rx="22" fill="{accent}"/><rect x="690" y="420" width="60" height="190" rx="22" fill="{accent}"/>'
    b += '<rect x="210" y="430" width="240" height="70" rx="20" fill="#000" opacity=".08"/><rect x="460" y="430" width="230" height="70" rx="20" fill="#000" opacity=".08"/>'
    b += '<rect x="260" y="440" width="70" height="60" rx="12" fill="#EED9A8"/>'
    b += '<rect x="390" y="650" width="260" height="20" rx="8" fill="#4A4038"/><rect x="410" y="670" width="12" height="40" fill="#4A4038"/><rect x="618" y="670" width="12" height="40" fill="#4A4038"/>'
    b += '<path d="M90 610 V250" stroke="#2E343B" stroke-width="6"/><path d="M50 250 h80 l-20 -70 h-40z" fill="#EFE3C4"/>'
    b += '<rect x="230" y="180" width="260" height="170" fill="#fff"/><rect x="246" y="196" width="228" height="138" fill="#D8C7A8"/><path d="M246 334 L330 260 L390 300 L474 230 V334Z" fill="#B88E61"/>'
    b += '<path d="M960 600 q-20 -120 30 -180 q10 90 -10 180z M1000 600 q20 -100 70 -130 q-20 70 -50 130z" fill="#6E9161"/><rect x="950" y="580" width="90" height="60" fill="#B9764F"/>'
    return svg(b)

def cocina(accent, wall="#F4F2EE"):
    b = f'<rect width="{W}" height="{H}" fill="{wall}"/>'
    b += '<rect y="640" width="1200" height="160" fill="#D9D3C8"/>'
    b += ''.join(f'<path d="M{x} 640 V800" stroke="#CBC4B7" stroke-width="3"/>' for x in range(0, 1200, 120))
    b += '<rect x="80" y="380" width="1040" height="250" fill="#FBFAF7"/><rect x="80" y="370" width="1040" height="18" fill="#3A3F45"/>'
    b += ''.join(f'<rect x="{x}" y="400" width="190" height="210" fill="{accent}" opacity=".92"/><rect x="{x+80}" y="420" width="30" height="6" fill="#E4C27A"/>' for x in (100, 310, 730, 940))
    b += '<rect x="520" y="400" width="190" height="210" fill="#2E343B"/><rect x="540" y="430" width="150" height="110" fill="#4C545D"/>'
    b += '<rect x="80" y="110" width="1040" height="160" fill="#FBFAF7"/>'
    b += ''.join(f'<rect x="{x}" y="120" width="190" height="140" fill="{accent}" opacity=".75"/>' for x in (100, 310, 730, 940))
    b += window(520, 120, 190, 140, frame="#3A3F45", mull=False)
    b += '<rect x="80" y="270" width="1040" height="100" fill="#E8E2D8"/>'
    b += ''.join(f'<rect x="{x}" y="270" width="40" height="20" fill="#DCD4C7"/>' for x in range(80, 1120, 80))
    b += '<path d="M700 370 v-50 h-30" stroke="#8A9096" stroke-width="8" fill="none"/>'
    b += '<rect x="260" y="560" width="680" height="90" fill="#3A3F45"/><rect x="240" y="540" width="720" height="26" fill="#ECE8E1"/>'
    b += ''.join(f'<path d="M{x} 0 V170" stroke="#2E343B" stroke-width="3"/><path d="M{x-40} 210 Q{x} 160 {x+40} 210Z" fill="#2E343B"/>' for x in (420, 600, 780))
    return svg(b)

def dormitorio(accent, wall="#EEF0EC"):
    b = f'<rect width="{W}" height="{H}" fill="{wall}"/>'
    b += '<rect y="620" width="1200" height="180" fill="#C4A985"/>'
    b += window(80, 150, 260, 320, frame="#2E343B")
    b += '<path d="M60 130 Q120 300 70 500 H40 V130Z M360 130 Q300 300 350 500 H380 V130Z" fill="#E7E1D4"/>'
    b += f'<rect x="460" y="290" width="560" height="200" rx="18" fill="{accent}"/>'
    b += '<rect x="430" y="470" width="620" height="140" rx="16" fill="#FBFAF6"/><rect x="430" y="520" width="620" height="90" rx="10" fill="#E3DCCD"/>'
    b += '<rect x="500" y="430" width="200" height="70" rx="22" fill="#fff"/><rect x="760" y="430" width="200" height="70" rx="22" fill="#fff"/>'
    b += '<rect x="440" y="610" width="20" height="30" fill="#4A4038"/><rect x="1020" y="610" width="20" height="30" fill="#4A4038"/>'
    b += '<rect x="1070" y="500" width="100" height="120" fill="#B98E62"/><path d="M1120 500 V420" stroke="#2E343B" stroke-width="5"/><path d="M1090 420 h60 l-12 -50 h-36z" fill="#EFE3C4"/>'
    b += '<rect x="600" y="140" width="280" height="110" fill="#fff"/><rect x="614" y="154" width="252" height="82" fill="#C9D3CF"/>'
    return svg(b)

def bano(accent, wall="#EEF2F2"):
    b = f'<rect width="{W}" height="{H}" fill="{wall}"/>'
    b += ''.join(f'<path d="M0 {y} H1200" stroke="#DDE4E4" stroke-width="3"/>' for y in range(60, 640, 60))
    b += ''.join(f'<path d="M{x} 0 V640" stroke="#DDE4E4" stroke-width="3"/>' for x in range(0, 1200, 120))
    b += '<rect y="640" width="1200" height="160" fill="#B9B4AA"/>'
    b += '<rect x="720" y="80" width="380" height="560" fill="#CFE3EA" opacity=".55"/><rect x="720" y="80" width="10" height="560" fill="#9AA5AB"/>'
    b += '<path d="M960 120 h80 v30" stroke="#8A9096" stroke-width="8" fill="none"/><rect x="1000" y="150" width="80" height="16" rx="8" fill="#8A9096"/>'
    b += f'<rect x="140" y="440" width="460" height="150" fill="{accent}"/>'
    b += '<rect x="130" y="420" width="480" height="28" fill="#F6F4EF"/><ellipse cx="370" cy="430" rx="120" ry="14" fill="#E3E0DA"/>'
    b += '<path d="M370 420 v-40 h30" stroke="#8A9096" stroke-width="8" fill="none"/>'
    b += '<rect x="200" y="120" width="340" height="250" rx="16" fill="#C9D8DE"/><path d="M230 330 L330 160" stroke="#fff" stroke-width="10" opacity=".5"/>'
    b += '<rect x="610" y="560" width="70" height="80" fill="#6E9161" opacity=".0"/>'
    b += '<path d="M630 640 q-10 -80 20 -120 q6 60 -6 120z M660 640 q14 -70 46 -90 q-12 50 -30 90z" fill="#6E9161"/>'
    return svg(b)

def piscina_jardin(accent, kind="dia"):
    d, b = sky(kind, sx=200, sy=140)
    b += hills(420)
    b += '<rect y="420" width="1200" height="380" fill="#A8BE84"/>'
    b += '<path d="M120 500 H1080 L1140 760 H60Z" fill="#EDE8DC"/>'
    b += '<path d="M200 520 H1000 L1040 720 H160Z" fill="url(#wa)"/>'
    b += ''.join(f'<path d="M{x} {y} q30 -8 60 0 t60 0" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>' for x, y in [(300,580),(620,620),(460,680),(800,560)])
    for x in (240, 420):
        b += f'<path d="M{x} 470 l130 0 l40 -50" stroke="#3A3F45" stroke-width="6" fill="none"/><rect x="{x}" y="450" width="130" height="18" rx="6" fill="{accent}"/>'
    b += '<circle cx="900" cy="300" r="2" fill="none"/>'
    b += '<path d="M840 470 V330" stroke="#3A3F45" stroke-width="6"/><path d="M720 340 Q840 250 960 340Z" fill="#F4F1EA"/>'
    b += palm(1100, 520, .9) + olive(80, 520, .9) + cypress(1000, 430, 160)
    return svg(b, d)

def terraza(accent, kind="tarde"):
    return atico(accent, kind)

def nave_int(accent):
    b = '<rect width="1200" height="800" fill="#D4D8DB"/>'
    b += '<path d="M0 0 L600 120 L1200 0 V60 L600 180 L0 60Z" fill="#B9BEC2"/>'
    b += ''.join(f'<path d="M{x} {120 - abs(600-x)*120/600} V180" stroke="#9EA4A9" stroke-width="5"/>' for x in range(0, 1201, 100))
    b += '<rect y="560" width="1200" height="240" fill="#A9ADB0"/>'
    b += '<path d="M0 640 H1200" stroke="#F2D04A" stroke-width="8"/>'
    b += '<rect x="420" y="250" width="360" height="310" fill="#8C939A"/>' + ''.join(f'<path d="M420 {y} H780" stroke="#7A8188" stroke-width="3"/>' for y in range(262, 560, 14))
    b += ''.join(f'<rect x="{x}" y="380" width="120" height="180" fill="#C8A370"/>' for x in (80, 210))
    b += f'<rect x="900" y="300" width="200" height="260" fill="{accent}" opacity=".8"/>'
    b += window(940, 330, 120, 80, mull=False)
    return svg(b)

def local_int(accent):
    b = '<rect width="1200" height="800" fill="#F1EEE8"/>'
    b += '<rect y="600" width="1200" height="200" fill="#CFC8BB"/>'
    b += window(60, 120, 520, 470, frame="#2E343B")
    b += f'<rect x="700" y="420" width="420" height="180" fill="{accent}"/><rect x="690" y="400" width="440" height="24" fill="#3A3F45"/>'
    b += ''.join(f'<rect x="{x}" y="160" width="120" height="14" fill="#3A3F45"/>' for x in (720, 860, 1000))
    b += ''.join(f'<circle cx="{x}" cy="40" r="0"/><path d="M{x} 0 V90" stroke="#3A3F45" stroke-width="3"/><circle cx="{x}" cy="100" r="16" fill="#F2D59A"/>' for x in (760, 920, 1080))
    return svg(b)

def plano_solar(accent):
    b = '<rect width="1200" height="800" fill="#F5F3EE"/>'
    b += ''.join(f'<path d="M{x} 0 V800" stroke="#E4E0D6" stroke-width="2"/>' for x in range(0, 1200, 40))
    b += ''.join(f'<path d="M0 {y} H1200" stroke="#E4E0D6" stroke-width="2"/>' for y in range(0, 800, 40))
    b += f'<path d="M300 200 L880 160 L940 600 L260 640Z" fill="{accent}" opacity=".18" stroke="{accent}" stroke-width="6"/>'
    b += '<path d="M120 700 H1080" stroke="#3A3F45" stroke-width="40"/><text x="600" y="712" font-family="sans-serif" font-size="22" fill="#fff" text-anchor="middle" letter-spacing="6">VIAL DE ACCESO</text>'
    b += '<path d="M260 680 v-40 M940 680 v-80" stroke="#3A3F45" stroke-width="3"/>'
    b += f'<text x="600" y="420" font-family="sans-serif" font-weight="700" font-size="64" fill="{accent}" text-anchor="middle">Parcela</text>'
    b += '<path d="M1080 120 l0 -60 l-14 24 m14 -24 l14 24" stroke="#3A3F45" stroke-width="4" fill="none"/><text x="1080" y="150" font-family="sans-serif" font-size="24" fill="#3A3F45" text-anchor="middle">N</text>'
    return svg(b)

PROPS = {
    # ref: (exterior fn, accent, sky, interiores)
    "gs101": (chalet, "#0E9F7E", "dia", [salon, cocina, dormitorio, piscina_jardin, bano]),
    "gs102": (adosado, "#2F6F8F", "claro", [salon, cocina, dormitorio, bano]),
    "gs103": (piso, "#3E5C76", "dia", [salon, cocina, dormitorio, bano]),
    "gs104": (pueblo, "#2E6B4F", "tarde", [salon, cocina, dormitorio, bano]),
    "gs105": (solar, "#0E9F7E", "dia", [plano_solar]),
    "gs106": (atico, "#C77D4A", "ocaso", [salon, cocina, dormitorio, bano]),
    "gs107": (pareado, "#7A4E3A", "tarde", [salon, cocina, dormitorio, piscina_jardin]),
    "gs108": (nave, "#0E9F7E", "claro", [nave_int]),
    "gs109": (chalet, "#B5654A", "tarde", [salon, cocina, dormitorio, piscina_jardin]),
    "gs110": (local, "#0E9F7E", "dia", [local_int]),
    "gs111": (piso, "#8A6D52", "claro", [salon, cocina, dormitorio, bano]),
    "gs112": (adosado, "#5B6B8C", "tarde", [salon, cocina, dormitorio, bano]),
}

INT_ACCENTS = ["#7C8C74", "#B98E62", "#5E7A8A", "#A3684F", "#6F7D8C", "#8D8A6A"]

for i, (ref, (fn, acc, kind, ints)) in enumerate(PROPS.items()):
    with open(os.path.join(OUT, f"{ref}-1.svg"), "w") as f:
        f.write(fn(acc, kind))
    for j, g in enumerate(ints, start=2):
        a2 = INT_ACCENTS[(i + j) % len(INT_ACCENTS)]
        if g in (piscina_jardin,):
            out = g(a2, kind)
        else:
            out = g(a2)
        with open(os.path.join(OUT, f"{ref}-{j}.svg"), "w") as f:
            f.write(out)
    print(ref, 1 + len(ints))
