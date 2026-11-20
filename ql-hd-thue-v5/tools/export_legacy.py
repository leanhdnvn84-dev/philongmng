"""Chuyển file xlsx dữ liệu cũ (QL-HD-THUE) sang JSON chuẩn hóa để app mới đọc.
Không sửa dữ liệu: chỉ đổi kiểu (ngày -> ISO, số -> number, chuỗi trống -> null)."""
import json, sys, datetime as dt
import openpyxl

SRC = sys.argv[1]
OUT = sys.argv[2]
SHEETS = ['toanha','tang_phong','khach_khachthue','hopdong','phuluc','giathue','phidichvu',
          'kythanhtoan','chitietky','denghithanhtoan','hoadon','thanhtoan','sys_cauhinh',
          'dien_congto','dien_chiso','dien_dongia','dien_tinhtien']

def norm(v):
    if v is None: return None
    if isinstance(v, str):
        s = v.strip()
        return s if s != '' else None
    if isinstance(v, dt.datetime):
        return v.date().isoformat()
    if isinstance(v, bool): return v
    if isinstance(v, (int, float)): return float(v) if isinstance(v, float) and not float(v).is_integer() else (int(v) if float(v).is_integer() else v)
    return str(v)

wb = openpyxl.load_workbook(SRC, data_only=True)
out = {}
for name in SHEETS:
    ws = wb[name]
    rows = list(ws.iter_rows(values_only=True))
    headers = [norm(h) if h is not None else f'_col{i}' for i, h in enumerate(rows[0])]
    headers = [str(h).strip() if h is not None else f'_col{i}' for i, h in enumerate(headers)]
    recs = []
    for i, r in enumerate(rows[1:], start=2):
        vals = [norm(v) for v in r]
        if all(v is None for v in vals): continue
        d = {h: v for h, v in zip(headers, vals) if not h.startswith('_col')}
        d['_row'] = i
        recs.append(d)
    out[name] = {'headers': [h for h in headers if not h.startswith('_col')], 'rows': recs}
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: len(v['rows']) for k, v in out.items()})
