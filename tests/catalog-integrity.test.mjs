import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const bundle=await build({stdin:{contents:"export {missions} from './src/data/missions.js';export {robots} from './src/data/robots.js';export {panoramas} from './src/data/panoramas.js';",resolveDir:root},bundle:true,write:false,platform:'node',format:'esm'});
const data=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('every mission has a unique route and a usable surface record',()=>{
 const ids=new Set();
 for(const m of data.missions){assert.ok(!ids.has(m.id),m.id);ids.add(m.id);assert.ok(m.name&&m.site,m.id);assert.ok(Array.isArray(m.points),m.id);if(m.coordinateKnown!==false&&m.planet!=='deep-space'){assert.ok(Number.isFinite(m.lat)&&Math.abs(m.lat)<=90,m.id);assert.ok(Number.isFinite(m.lon),m.id)}}
});
test('catalogue images, models and panoramas ship with the site',()=>{
 const visit=(value,path='catalogue')=>{if(typeof value==='string'&&/^\/(?:media|models|concepts)\//.test(value))assert.ok(existsSync(root+'public'+value),path+': '+value);else if(value&&typeof value==='object')for(const [key,item] of Object.entries(value))visit(item,path+'.'+key)};
 visit(data);
 for(const id of Object.keys(data.panoramas))assert.ok(data.missions.some(m=>m.id===id),'Panorama without mission: '+id);
});
