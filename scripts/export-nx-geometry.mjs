// Export the same authored React geometry for offline concept renders.
// No browser or screenshots are used. R3F UI wrappers are omitted from the geometry.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import React from 'react';
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await fs.mkdir(path.join(root,'.sites'),{recursive:true});
let source=await fs.readFile(path.join(root,'src/components/NXModel.jsx'),'utf8');
source=source.replace("import React,{useMemo,useState,useEffect,useRef} from 'react';","import React from 'react'; const useMemo=fn=>fn();");
const outfile=path.join(root,'.sites/nx-export-source.mjs');
await build({stdin:{contents:source,resolveDir:path.join(root,'src/components'),loader:'jsx'},bundle:true,platform:'node',format:'esm',packages:'external',outfile,plugins:[{name:'omit-r3f-ui',setup(b){b.onResolve({filter:/^@react-three\/(fiber|drei)$/},args=>({path:args.path,namespace:'nx-render-stubs'}));b.onLoad({filter:/.*/,namespace:'nx-render-stubs'},()=>({contents:"export const Canvas='canvas';export const useThree=()=>()=>{};export const RoundedBox='rounded-box';export const Html='nx-html';export const ContactShadows='nx-shadow';export const OrbitControls='nx-controls';",loader:'js'}));}}]});
const {NX1Geometry,NX2Geometry}=await import(pathToFileURL(outfile));
function construct(element){
 if(element===null||element===undefined||typeof element==='boolean'||typeof element==='string')return null;
 if(Array.isArray(element)){const g=new THREE.Group();for(const el of element){const child=construct(el);if(child)g.add(child);}return g;}
 const {type,props={}}=element;
 if(type===React.Fragment)return construct(props.children);
 if(typeof type==='function'){
  if(type.name==='Part'){const g=construct(props.children);g.name=props.id;return g;}
  return construct(type(props));
 }
 if(typeof type!=='string'||type.startsWith('nx-'))return null;
 const clean={...props};for(const key of ['children','key','ref','attach'])delete clean[key];
 if(type.endsWith('Geometry')){const Ctor=THREE[type[0].toUpperCase()+type.slice(1)];if(!Ctor)throw Error(type);return new Ctor(...(props.args||[]));}
 if(type.endsWith('Material')){const Ctor=THREE[type[0].toUpperCase()+type.slice(1)];return new Ctor(clean);}
 let object=type==='mesh'||type==='rounded-box'?new THREE.Mesh():new THREE.Group();
 if(type==='rounded-box'){object.geometry=new THREE.BoxGeometry(...props.args);object.name='RoundedBox';}
 const children=Array.isArray(props.children)?props.children:[props.children];
 for(const item of children.flat(Infinity)){
  const child=construct(item);if(!child)continue;
  if(child.isBufferGeometry)object.geometry=child;else if(child.isMaterial)object.material=child;else object.add(child);
 }
 for(const key of ['position','rotation','scale'])if(props[key]!==undefined){const value=props[key];if(Array.isArray(value))object[key].set(...value);else if(typeof value==='number')object[key].setScalar(value);else object[key].copy(value);}
 if(props.onUpdate)props.onUpdate(object);
 object.castShadow=!!props.castShadow;object.receiveShadow=!!props.receiveShadow;
 return object;
}
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.();});}};
for(const [id,Geometry] of [['nx1',NX1Geometry],['nx2',NX2Geometry]]){
 for(const cutaway of [false,true]){
  const scene=new THREE.Scene();scene.add(construct(React.createElement(Geometry,{selected:'',onSelect:()=>{},cutaway})));
  const result=await new GLTFExporter().parseAsync(scene,{binary:true});
  const dest=path.join(root,'public/concepts/'+id+(cutaway?'-inside':'-exterior')+'.glb');await fs.writeFile(dest,Buffer.from(result));console.log(dest,result.byteLength);
 }
}
