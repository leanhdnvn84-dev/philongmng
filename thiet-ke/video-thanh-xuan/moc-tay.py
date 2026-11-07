"""python3 moc-tay.py → loi.js: mốc đầu câu canh tay (giây) theo cua-so.json + lưới nhịp 150 BPM (phách 0,4 giây), mốc lấy từ cua-so.json. Sửa số ở MOC rồi chạy lại."""
import json,re
MOC=[1.0,3.0,9.0,11.0,14.0,16.6,24.5,26.5,28.5,30.8,33.4,36.6,41.0,43.6,46.0,48.0,50.0,51.6,54.0,56.6,58.6,60.6,69.4,71.4,72.8,74.4,75.6,78.6,79.6,80.8,82.0,83.6,86.0,87.6,88.6,90.4,91.6,93.0,94.2,96.0,97.8,99.4,105.6,107.0,108.6,110.4,112.0,113.0,114.0,115.6,119.0,122.0,126.0,127.4,131.0,133.0,135.6,137.4,139.4,141.4,143.0,144.0,159.0,160.6,161.8,163.2,164.4,166.0,167.2,169.2,171.6,173.6,175.6,177.0,179.0,180.4,181.4,182.6,185.0,186.8,189.4,190.8,192.6,193.8,195.0,196.4,200.0,202.0,204.0,206.0,208.0,210.0,213.4,214.8,216.0,217.4,220.4,221.8,222.8,224.4,229.0,231.0,233.0,236.0,238.6,240.6,241.8,242.6,243.8,247.0,255.6,257.0,257.8,258.8,260.0,261.0,262.4,263.8,267.0,269.0,270.8,272.6,274.4,276.2,299.6,301.6,304.0,306.0]
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
open('loi.js','w',encoding='utf-8').write('/* tạo bằng moc-tay.py – mốc a (giây) canh tay */\nwindow.TONG_NHAC=309.9;\nwindow.LOI_T='+json.dumps(cau,ensure_ascii=False)+';\n')
print(len(cau),'câu')
