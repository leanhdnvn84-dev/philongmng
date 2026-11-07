"""python3 moc-tay.py → loi.js: mốc đầu câu canh tay (giây) theo cua-so.json + lưới nhịp 136 BPM (1 ô nhịp = 1,765 giây). Sửa số ở MOC rồi chạy lại."""
import json,re
MOC=[2.0,4.0,10.0,12.3,14.0,15.3,17.5,20.0, 23.5,26.5,
 49.8,52.8,56.3,60.6,63.9,66.6,70.2,74.0, 77.2,78.8,80.3,81.8,84.5,91.0,
 92.0,93.8,95.5,97.3,99.1,100.8,102.6,104.4,106.1,107.9,121.0,122.6,
 137.2,140.7,144.0,147.0,150.5,154.0,155.6,157.0, 158.5,159.8,160.6,161.8,163.0,
 167.7,169.4,171.2,173.0,174.7,176.5,178.2,180.0, 184.5,188.0,190.3,192.3,197.5,200.3,
 205.5,207.0,209.0,211.0, 227.5,229.3,231.0,232.8,234.6,236.3,238.1,239.9,
 255.0,256.8,261.0,264.0,265.5,268.0]
cau=[];di=-1;nh=''
for d in open('loi.txt',encoding='utf-8'):
  d=d.strip()
  if not d: continue
  if d.startswith('['): nh=d.strip('[]').split('|')[-1].strip();di+=1;continue
  cau.append({'c':d,'g':nh.rstrip('*').strip(),'di':di,'lang':nh.endswith('*')})
assert len(cau)==len(MOC),(len(cau),len(MOC))
for i,x in enumerate(cau):
  x['a']=MOC[i];sau=MOC[i+1] if i+1<len(MOC) else x['a']+4
  x['b']=round(min(sau-.1,x['a']+(6 if x['lang'] else 4.2)),2)
open('loi.js','w',encoding='utf-8').write('/* tạo bằng moc-tay.py – mốc a (giây) canh tay */\nwindow.TONG_NHAC=282.8;\nwindow.LOI_T='+json.dumps(cau,ensure_ascii=False)+';\n')
print(len(cau),'câu')
