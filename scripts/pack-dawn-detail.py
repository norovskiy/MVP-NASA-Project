"""Pack refine-dawn.py output. Requires Pillow; never runs during npm build."""
from pathlib import Path
import sys
from PIL import Image
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]) if len(sys.argv)>1 else root/'.sites/dawn-refinement'
frames=[source/'frames'/f'{i:02}.png' for i in range(24)]
assert all(p.is_file() for p in frames), 'All 24 renders must finish before packing.'
atlas=Image.new('RGBA',(1024*6,1024*4))
for i,p in enumerate(frames):
    with Image.open(p) as im: atlas.paste(im.convert('RGBA'),(i%6*1024,i//6*1024))
atlas.save(root/'public/models/deep/dawn-detailed-orbit.webp',quality=94,method=6)
with Image.open(source/'dawn-detailed.png') as im:
    im.save(root/'public/models/deep/dawn-detailed-cinematic.webp',quality=94,method=6)
print('Packed Dawn: 24 × 1024 px orbit views; 1600 px poster')
