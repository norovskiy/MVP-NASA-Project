import urllib.request,re,html,pathlib,concurrent.futures,json
from PIL import Image
from io import BytesIO
pages={
'spirit':'https://science.nasa.gov/resource/spirit-mars-rover-in-mcmurdo-panorama-2/',
'insight':'https://science.nasa.gov/photojournal/insights-final-selfie/',
'apollo15':'https://science.nasa.gov/resource/apollo-15-mission-image-view-of-the-apollo-lunar-surface-experiments-package-alsep/',
'ingenuity':'https://science.nasa.gov/resource/perseverances-selfie-with-ingenuity/',
'pathfinder':'https://science.nasa.gov/mission/mars-pathfinder/',
'viking1':'https://science.nasa.gov/resource/sand-dunes-and-large-rocks-revealed-by-viking-1/'
}
ROOT=pathlib.Path(__file__).resolve().parents[1]
def run(item):
 key,page=item
 try:
  raw=urllib.request.urlopen(page,timeout=20).read().decode()
  urls=list(dict.fromkeys(html.unescape(x) for x in re.findall(r'(?:src|href)=[\"\']([^\"\']+)',raw) if '/content/dam/science/' in x and any(e in x.lower() for e in ['.jpg','.png','.jpeg'])))
  print(key,urls[:5],flush=True)
  for url in urls[:4]:
   try:
    data=urllib.request.urlopen(url,timeout=20).read();im=Image.open(BytesIO(data))
    if im.width>=3840:
     im.thumbnail((6000,4000));im.convert('RGB').save(ROOT/'public/media'/f'{key}.jpg',quality=91)
     return {'id':key,'page':page,'source':url,'width':im.width,'height':im.height}
   except Exception as e: print(key,str(e)[:100],flush=True)
  return {'id':key,'page':page,'unavailable_4k':True}
 except Exception as e:return {'id':key,'page':page,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:out=list(ex.map(run,pages.items()))
(ROOT/'scripts/new-assets.json').write_text(json.dumps(out,indent=2));print(json.dumps(out),flush=True)
