"""python3 canh-loi.py cua-so.json loi.txt → loi.js
Canh mốc từng câu theo giọng hát thật: cua-so.json = [[giây bắt đầu cửa sổ 6 giây, chữ nhận được], …] (chạy Whisper từng cửa sổ, bước 1,5 giây).
loi.txt: dòng "[Tên đoạn | nhãn hiện]" mở đoạn (thêm "*" cuối nhãn = đoạn tối + nến), các dòng sau là câu hát.
Mỗi câu được gán cửa sổ có chữ khớp ĐẦU câu nhất, theo thứ tự tăng dần (quy hoạch động)."""
import json, sys, unicodedata, re
from difflib import SequenceMatcher

def bo_dau(s):
    s = unicodedata.normalize('NFD', s.lower().replace('đ', 'd'))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]+', ' ', s).split()

CS = json.load(open(sys.argv[1], encoding='utf-8'))
cau = []
nhan, di = '', -1
for d in open(sys.argv[2], encoding='utf-8'):
    d = d.strip()
    if not d: continue
    if d.startswith('['):
        nhan = d.strip('[]').split('|')[-1].strip(); di += 1; continue
    cau.append({'c': d, 'g': nhan.rstrip('*').strip(), 'di': di, 'lang': nhan.endswith('*')})

W = [bo_dau(t) for _, t in CS]
def diem(i, j):
    """khớp đầu câu i với đầu cửa sổ j (0..1)"""
    a = bo_dau(cau[i]['c'])[:5]; b = W[j][:7]
    if not b or 'subscribe' in b: return 0
    m = SequenceMatcher(None, a, b).find_longest_match(0, len(a), 0, len(b))
    sm = SequenceMatcher(None, ' '.join(a), ' '.join(b[:len(a) + 1])).ratio()
    pt = 1 if m.a == 0 and m.b <= 1 else .6
    return sm * pt

N, M = len(cau), len(CS)
LECH = float(sys.argv[4]) if len(sys.argv) > 4 else .6
CACH = int(sys.argv[3]) if len(sys.argv) > 3 else 2  # câu sau cách câu trước ít nhất CACH cửa sổ
NEG = -1e9
f = [[NEG] * M for _ in range(N)]; tr = [[-1] * M for _ in range(N)]
for j in range(M): f[0][j] = diem(0, j)
for i in range(1, N):
    best, bj = NEG, -1
    for j in range(M):
        k = j - CACH
        if k >= 0 and f[i - 1][k] > best: best, bj = f[i - 1][k], k
        if best > NEG: f[i][j] = best + diem(i, j); tr[i][j] = bj
j = max(range(M), key=lambda j: f[N - 1][j]); ds = [0] * N
for i in range(N - 1, -1, -1): ds[i] = j; j = tr[i][j]
# lùi về cửa sổ sớm nhất liền trước vẫn có đầu câu (giọng bắt đầu sớm hơn)
for i in range(N):
    j = ds[i]
    while j - 1 > (ds[i - 1] if i else -1) and diem(i, j - 1) > .55: j -= 1
    ds[i] = j
for i, x in enumerate(cau):
    x['a'] = round(CS[ds[i]][0] + LECH, 2); x['khop'] = round(diem(i, ds[i]), 2)
for i, x in enumerate(cau):
    sau = cau[i + 1]['a'] if i + 1 < N else x['a'] + 7
    x['b'] = round(min(sau - .15, x['a'] + 9), 2)
    if x.get('gop'): pass
TONG = CS[-1][0] + 6
open('loi.js', 'w', encoding='utf-8').write('/* tạo bằng canh-loi.py – sửa tay mốc a (giây) nếu lệch */\nwindow.TONG_NHAC=' + str(TONG) + ';\nwindow.LOI_T=' + json.dumps(cau, ensure_ascii=False, indent=0) + ';\n')
for x in cau: print(f"{x['a']:7.1f} {x['b']:7.1f} {x['khop']:.2f} {x['g'][:14]:14} {x['c']}")
