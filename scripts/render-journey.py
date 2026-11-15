"""Render a cinematic visualization from credited equirectangular maps.
Not a scale model or spacecraft trajectory. No scientific measurements generated.
"""
import cv2,numpy as np,subprocess,math,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
W,H=1440,810;FPS=24;FRAMES=432
maps={n:cv2.imread(str(ROOT/'public/models'/f'{n}.jpg')) for n in ['earth','moon','mars']}
clouds=cv2.imread(str(ROOT/'public/media/earth-clouds.jpg'))
if clouds is not None:
 clouds=cv2.resize(clouds,(maps['earth'].shape[1],maps['earth'].shape[0])).astype(np.float32)/255
 alpha=np.mean(clouds,axis=2,keepdims=True)*.65
 maps['earth']=np.uint8(maps['earth']*(1-alpha)+np.ones_like(maps['earth'])*235*alpha)
rng=np.random.default_rng(27);stars=rng.uniform([0,0,.15],[W,H,1],(330,3))
light=np.array([-.68,.36,.64]);light/=np.linalg.norm(light)
def sphere(img,name,cx,cy,r,angle):
 x0=max(0,int(cx-r-3));x1=min(W,int(cx+r+4));y0=max(0,int(cy-r-3));y1=min(H,int(cy+r+4))
 if x1<=x0 or y1<=y0 or r<1:return
 yy,xx=np.mgrid[y0:y1,x0:x1].astype(np.float32);nx=(xx-cx)/r;ny=-(yy-cy)/r;rr=nx*nx+ny*ny;mask=rr<=1;nz=np.sqrt(np.clip(1-rr,0,1))
 u=(np.arctan2(nx,nz)/(2*np.pi)+.5+angle)%1;v=np.arccos(np.clip(ny,-1,1))/np.pi
 tex=maps[name];sample=cv2.remap(tex,(u*(tex.shape[1]-1)).astype(np.float32),(v*(tex.shape[0]-1)).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_WRAP).astype(np.float32)/255
 diffuse=np.clip(nx*light[0]+ny*light[1]+nz*light[2],0,1)
 # Work in approximately linear light, then return to display gamma.
 shaded=np.power(np.power(sample,2.2)*(diffuse[...,None]*1.3+.018),1/2.2)
 if name=='earth':
  rim=np.power(1-nz,4)*np.clip(diffuse+.14,0,1)*mask
  shaded+=rim[...,None]*np.array([.22,.1,.025])
 alpha=(np.clip((1-rr)*r*.65,0,1)*mask)[...,None]
 img[y0:y1,x0:x1]=img[y0:y1,x0:x1]*(1-alpha)+np.clip(shaded*255,0,255)*alpha
cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-g','12','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'public/media/journey.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for i in range(FRAMES):
 t=i/(FRAMES-1);frame=np.zeros((H,W,3),dtype=np.uint8);frame[:]=[8,5,3]
 for x,y,b in stars:
  sx=int((x-t*100*(b+.1))%W);sy=int(y);c=int(b*160)
  cv2.circle(frame,(sx,sy),1,(c,c,c),-1)
 # A narrative camera path with normalized sizes and distances.
 if t<.43:
  a=t/.43;sphere(frame,'earth',1120-a*1700,490+a*330,470*(1-a)**1.3+25,.10+t*.065)
 if t<.81:
  a=np.clip((t-.08)/.66,0,1);size=28+450*np.sin(a*np.pi)**1.6
  sphere(frame,'moon',1600-a*1550,330+70*np.sin(a*np.pi),size,.34+t*.055)
 if t>.51:
  a=(t-.51)/.49;e=a*a*(3-2*a)
  sphere(frame,'mars',1510-e*430,440,30+480*e,.34+t*.04)
 if i in [0,200,FRAMES-1]:cv2.imwrite(str(ROOT/'public/media'/f'journey-{i}.jpg'),frame,[cv2.IMWRITE_JPEG_QUALITY,94])
 p.stdin.write(frame.tobytes())
 if i%72==0:print(f'{i}/{FRAMES}',flush=True)
p.stdin.close();assert p.wait()==0
print('Rendered journey.mp4',flush=True)
