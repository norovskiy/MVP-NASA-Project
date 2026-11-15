"""Pack native renders using a separate geometry alpha pass, excluding the catcher plane.
Usage: python3 scripts/pack-nx-concepts.py RENDERS MASKS
Pillow is only needed for this optional asset build, never for npm build.
"""
from pathlib import Path
import sys
from PIL import Image,ImageChops
root=Path(__file__).resolve().parent.parent
source=Path(sys.argv[1]);masks=Path(sys.argv[2])
for unit in ['nx1','nx2']:
 for view in ['exterior','inside']:
  name=f'{unit}-{view}'
  with Image.open(source/f'{name}.png') as original,Image.open(masks/f'{name}.png') as mask:
   image=original.convert('RGBA');alpha=ImageChops.darker(image.getchannel('A'),mask.convert('RGBA').getchannel('A'));image.putalpha(alpha)
   image.save(root/'public/concepts'/f'{name}.webp',quality=94,method=6)
   print(name,image.size,'transparent corners',alpha.getpixel((0,0)))
