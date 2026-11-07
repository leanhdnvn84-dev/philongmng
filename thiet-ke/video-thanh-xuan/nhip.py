"""python3 nhip.py quay-len.mp3 → nhip.js: mỗi khung 1/25 giây: b (trống trầm), m (giữa), h (cao) 0..1, k = 1 khi có nhịp trống mạnh"""
import subprocess,numpy as np,json,sys
SR,FPS=22050,25
x=np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',sys.argv[1],'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32)
hop=SR//FPS;n=len(x)//hop;win=2048;w=np.hanning(win);f=np.fft.rfftfreq(win,1/SR)
dai=lambda a,b:(f>=a)&(f<b);B,M,H=dai(30,160),dai(300,2500),dai(4000,11000)
E=np.zeros((n,3))
for i in range(n):
  s=x[i*hop:i*hop+win]
  if len(s)<win: s=np.pad(s,(0,win-len(s)))
  p=np.abs(np.fft.rfft(s*w))**2
  E[i]=[p[B].sum(),p[M].sum(),p[H].sum()]
E=np.log1p(E*1e3)
for j in range(3):
  lo,hi=np.percentile(E[:,j],5),np.percentile(E[:,j],99);E[:,j]=np.clip((E[:,j]-lo)/(hi-lo),0,1)
d=np.maximum(0,np.diff(E[:,0],prepend=E[0,0]))
k=np.zeros(n)
th=np.percentile(d,92);last=-99
for i in range(n):
  if d[i]>th and E[i,0]>.45 and i-last>=8: k[i]=1;last=i
ks=np.where(k)[0]/FPS;print('so nhip',len(ks),'khoang',np.median(np.diff(ks)) if len(ks)>2 else 0)
open('nhip.js','w').write('window.NHIP={fps:%d,b:%s,m:%s,h:%s,k:%s};\n'%(FPS,json.dumps([round(v,2) for v in E[:,0]]),json.dumps([round(v,2) for v in E[:,1]]),json.dumps([round(v,2) for v in E[:,2]]),json.dumps([int(i) for i in np.where(k)[0]])))
