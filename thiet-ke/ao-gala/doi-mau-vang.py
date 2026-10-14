import numpy as np, sys
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
S=sys.argv[1]; SRC=sys.argv[2]; OUT=sys.argv[3]; MAU=tuple(int(sys.argv[4][i:i+2],16) for i in (0,2,4))
im=np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H,W,_=im.shape
mask=np.zeros((H,W),np.float32)
for k,(x0,y0) in [('trc',(200,140)),('sau',(1020,140))]:
    m=np.asarray(Image.open(f'{S}/m_{k}_isnet-general-use.png')).astype(np.float32)/255
    b=nd.binary_fill_holes(m>0.5); b=nd.binary_closing(b,iterations=6); b=nd.binary_fill_holes(b)
    soft=np.maximum(m,b.astype(np.float32)*nd.binary_erosion(b,iterations=3))
    reg=mask[y0:y0+m.shape[0],x0:x0+m.shape[1]]; np.maximum(reg,soft,out=reg)
r,g,b=im[...,0],im[...,1],im[...,2]
mx=im.max(2); mn=im.min(2); L=0.299*r+0.587*g+0.114*b
vai=((mx-mn)<28)&(L>110)
# giữ trắng: huy hiệu tay (vòng vàng) + logo ngực
giu=Image.new('L',(W,H),0); d=ImageDraw.Draw(giu)
vang=(r>150)&(g>115)&(b<120)&((r-b)>55)
ys,xs=np.nonzero(vang[400:620,900:1140])
xa,xb,ya,yb=np.percentile(xs,.5)+900,np.percentile(xs,99.5)+900,np.percentile(ys,.5)+400,np.percentile(ys,99.5)+400
d.ellipse([xa+2,ya+2,xb-2,yb-2],fill=255);print('huy hieu',round(xa),round(xb),round(ya),round(yb))
d.polygon([(769,401),(798,431),(769,461),(740,431)],fill=255)
giu=np.asarray(giu.filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)/255
a=mask*vai*(1-giu)
a=np.asarray(Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))).astype(np.float32)/255
sang=np.clip(L/248,0,1.05)**1.15
mau=np.array(MAU,np.float32)
moi=np.clip(mau[None,None,:]*sang[...,None]+ (255-mau)[None,None,:]*np.clip(sang-1,0,1)[...,None]*0,0,255)
out=im*(1-a[...,None])+moi*a[...,None]
Image.fromarray(out.astype(np.uint8)).save(OUT,quality=95); print('ok',OUT)
