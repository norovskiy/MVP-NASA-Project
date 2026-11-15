from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent/'public/models/deep'
for name in ['pioneer10','dawn','kepler','near']:
 frames=sorted((Path('/tmp/craft-renders')/name).glob('*.png'))
 if len(frames)!=24:continue
 atlas=Image.new('RGBA',(640*6,640*4))
 for i,p in enumerate(frames):atlas.paste(Image.open(p).convert('RGBA'),(i%6*640,i//6*640))
 dest=root/(name+'-orbit.webp');atlas.save(dest,quality=88,method=6);print(name,dest.stat().st_size)
