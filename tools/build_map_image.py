import numpy as np, json, math, requests, io
from PIL import Image, ImageFilter
from pyproj import Transformer
W,S,E,N=-15.87,27.72,-15.33,28.20
lat0=(S+N)/2
mlon=111320*math.cos(math.radians(lat0)); mlat=110860
OW=int(round((E-W)*mlon/10)); OH=int(round((N-S)*mlat/10))
print('out',OW,OH)
lon=W+(np.arange(OW)+.5)/OW*(E-W); lat=N-(np.arange(OH)+.5)/OH*(N-S)
LON,LAT=np.meshgrid(lon,lat)
# satellite
a=np.load('tci.npy').transpose(1,2,0).astype(np.float32); m=json.load(open('tci.json'))
b2=np.load('tci2.npy').transpose(1,2,0).astype(np.float32)
assert b2.shape==a.shape and json.load(open('tci2.json'))['transform']==m['transform']
def cloudy(x):
    br=x.mean(2); sat=x.max(2)-x.min(2)
    return (br>150)&(sat<45)
from PIL import ImageFilter as IF
c1=np.asarray(Image.fromarray((cloudy(a)*255).astype(np.uint8)).filter(IF.MaxFilter(9)).filter(IF.GaussianBlur(4))).astype(np.float32)/255
c2=cloudy(b2)
w=(c1*(~c2))[...,None]
a=a*(1-w)+b2*w
print('patched frac',(c1>0.5).mean())
t=m['transform']  # a,b,c,d,e,f
tr=Transformer.from_crs('EPSG:4326',m['crs'],always_xy=True)
X,Y=tr.transform(LON,LAT)
px=(X-t[2])/t[0]-.5; py=(Y-t[5])/t[4]-.5
def bil(img,px,py):
    h,w=img.shape[:2]
    x0=np.clip(np.floor(px).astype(int),0,w-2); y0=np.clip(np.floor(py).astype(int),0,h-2)
    fx=np.clip(px-x0,0,1)[...,None] if img.ndim==3 else np.clip(px-x0,0,1); fy=np.clip(py-y0,0,1)[...,None] if img.ndim==3 else np.clip(py-y0,0,1)
    return (img[y0,x0]*(1-fx)*(1-fy)+img[y0,x0+1]*fx*(1-fy)+img[y0+1,x0]*(1-fx)*fy+img[y0+1,x0+1]*fx*fy)
sat=bil(a,px,py)
inside=(px>=0)&(py>=0)&(px<a.shape[1]-1)&(py<a.shape[0]-1)
print('inside frac',inside.mean())
# elevation (terrarium z12)
z=12
def tile_xy(lo,la):
    n=2**z; x=(lo+180)/360*n; y=(1-math.log(math.tan(math.radians(la))+1/math.cos(math.radians(la)))/math.pi)/2*n; return x,y
x0,y0=tile_xy(W,N); x1,y1=tile_xy(E,S)
tx0,ty0,tx1,ty1=int(x0),int(y0),int(x1),int(y1)
mos=np.zeros(((ty1-ty0+1)*256,(tx1-tx0+1)*256),np.float32)
for tx in range(tx0,tx1+1):
    for ty in range(ty0,ty1+1):
        r=requests.get(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{tx}/{ty}.png')
        im=np.asarray(Image.open(io.BytesIO(r.content)).convert('RGB')).astype(np.float32)
        mos[(ty-ty0)*256:(ty-ty0+1)*256,(tx-tx0)*256:(tx-tx0+1)*256]=im[...,0]*256+im[...,1]+im[...,2]/256-32768
n=2**z
ex=((LON+180)/360*n-tx0)*256-.5
ey=((1-np.log(np.tan(np.radians(LAT))+1/np.cos(np.radians(LAT)))/np.pi)/2*n-ty0)*256-.5
elev=bil(mos,ex,ey)
np.save('elev.npy',elev.astype(np.float32))
print('elev max',elev.max())
# hillshade
dy,dx=np.gradient(elev,10)
az,alt=math.radians(315),math.radians(40)
slope=np.arctan(np.hypot(dx,dy)*1.6); aspect=np.arctan2(-dx,dy)
hs=np.sin(alt)*np.cos(slope)+np.cos(alt)*np.sin(slope)*np.cos(az-aspect)
hs=np.clip(hs,0,1)
land=(elev>1).astype(np.float32)
lm=Image.fromarray((land*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
landf=np.asarray(lm).astype(np.float32)/255
# distance-ish from coast for sea fade: blur land mask widely
far=np.asarray(Image.fromarray((land*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(60))).astype(np.float32)/255
sea_keep=np.clip(far*3.2,0,1)  # 1 near coast, 0 far out
# colour grade satellite: contrast + saturation
s=sat/255.0
s=np.clip((s-0.03)/0.9,0,1)**0.9
g=s.mean(2,keepdims=True); s=np.clip(g+(s-g)*1.25,0,1)
shade=(0.84+0.28*hs)[...,None]
landimg=np.clip(s*np.where(landf[...,None]>0.5,shade,1),0,1)
# sea colour gradient (deep navy-teal)
seac=np.array([0.07,0.20,0.30],np.float32)
seadeep=np.array([0.04,0.13,0.22],np.float32)
seabase=seac*(sea_keep[...,None])+seadeep*(1-sea_keep[...,None])
bright=s.mean(2); cloud=np.clip((bright-0.28)/0.12,0,1)
keep=(sea_keep*0.75*(1-cloud))[...,None]
seaimg=np.where(inside[...,None], s*keep+seabase*(1-keep), seabase)
out=landimg*landf[...,None]+seaimg*(1-landf[...,None])
out=(out*255).astype(np.uint8)
im=Image.fromarray(out)
im.save('full.png')
for wpx,q,name in ((4000,80,'gc-4000.jpg'),(1200,72,'gc-1200.jpg')):
    im.resize((wpx,round(wpx*OH/OW)),Image.LANCZOS).save(name,quality=q,optimize=True,progressive=True)
json.dump({'west':W,'east':E,'south':S,'north':N,'w':OW,'h':OH},open('extent.json','w'))
print('done')
