"""python3 canh-luoi.py cua-so.json loi.txt [ngưỡng=.7] → loi.js
Như canh-loi.py nhưng hợp nhạc EDM (Whisper nghe kém): chỉ tin các câu khớp ≥ ngưỡng làm MỐC, câu ở giữa chia đều
giữa 2 mốc, rồi bắt mọi mốc vào lưới phách lấy từ nhip.js (nhịp trống). Sửa tay: thêm dòng vào SUA {số câu: giây}."""
import json, sys, re, subprocess
SUA = {}
NG = float(sys.argv[3]) if len(sys.argv) > 3 else .7
out = subprocess.run([sys.executable, 'canh-loi.py', sys.argv[1], sys.argv[2], '1', '.3'], capture_output=True, text=True).stdout
cau = json.loads(re.search(r'window\.LOI_T=(.*);\s*$', open('loi.js', encoding='utf-8').read(), re.S).group(1))
nh = open('nhip.js').read(); K = json.loads(re.search(r'k:(\[[^\]]*\])', nh).group(1)); fps = 25
ks = [k / fps for k in K]; d = sorted(b - a for a, b in zip(ks, ks[1:]) if .3 < b - a < .6); phach = d[len(d) // 2]
goc = ks[0]
luoi = lambda t: goc + round((t - goc) / phach) * phach
N = len(cau)
moc = {i: x['a'] for i, x in enumerate(cau) if x['khop'] >= NG}
moc.update(SUA)
ds = sorted(moc)
# bỏ mốc làm thời gian đi lùi hoặc dồn quá sát (< 0,5 giây/câu)
tot = []
for i in ds:
    if tot and (moc[i] - moc[tot[-1]]) < .5 * (i - tot[-1]): continue
    tot.append(i)
a = [None] * N
for i in tot: a[i] = moc[i]
if a[0] is None: a[0] = max(0, (a[tot[0]] if tot else 1) - 2 * tot[0])
for i in range(N):
    if a[i] is None:
        j = next((k for k in tot if k > i), None); p = max(k for k in range(i) if a[k] is not None)
        a[i] = a[p] + (a[j] - a[p]) * (i - p) / (j - p) if j is not None else a[p] + 1.8 * (i - p)
for i in range(N):
    a[i] = round(luoi(a[i]), 2) if i not in SUA else SUA[i]
    if i and a[i] <= a[i - 1]: a[i] = round(a[i - 1] + phach, 2)
for i, x in enumerate(cau):
    x['a'] = a[i]; sau = a[i + 1] if i + 1 < N else a[i] + 4
    x['b'] = round(min(sau - .08, a[i] + (6 if x['lang'] else 4.5)), 2); x['moc'] = i in tot
TONG = json.loads(re.search(r'window\.TONG_NHAC=([\d.]+)', open('loi.js').read()).group(1))
open('loi.js', 'w', encoding='utf-8').write('/* tạo bằng canh-luoi.py (mốc Whisper + chia đều + bắt lưới phách %.3f s) */\nwindow.TONG_NHAC=%s;\nwindow.LOI_T=%s;\n' % (phach, TONG, json.dumps(cau, ensure_ascii=False)))
for i, x in enumerate(cau): print(f"{i:3} {x['a']:7.2f} {'*' if x['moc'] else ' '} {x['khop']:.2f} {x['c']}")
