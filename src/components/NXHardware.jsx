import React from "react";
// Surface fittings clarify the team's silhouette; they are illustrative, not flight CAD.
function Fitting({position,scale=1}){
 return <mesh position={position} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.022*scale,.022*scale,.012,6]}/><meshStandardMaterial color="#4c5357" metalness={.85} roughness={.38}/></mesh>;
}
export default function NXHardware({unitId,cutaway}){
 const large=unitId==="nx1",side=large?1.007:.784,y=large?1.32:.83,length=large?2.7:1.8;
 return <group>
  {!cutaway&&[-1,1].map(sign=><group key={sign}>
   {[-.68,0,.68].map(z=><group key={z}>
    <mesh position={[sign*side,y,z]} castShadow><boxGeometry args={[.015,large?.21:.22,.52]}/><meshStandardMaterial color="#777f80" metalness={.8} roughness={.4}/></mesh>
    {[-.18,-.09,0,.09,.18].map(d=><mesh key={d} position={[sign*(side+.011),y,z+d]}><boxGeometry args={[.012,.13,.018]}/><meshStandardMaterial color="#252d31" roughness={.7}/></mesh>)}
    {[-.22,.22].flatMap(d=>[-.084,.084].map(v=><Fitting key={d+":"+v} position={[sign*(side+.02),y+v,z+d]}/>))}
   </group>)}
   <mesh position={[sign*(side-.02),y+.15,0]} castShadow><boxGeometry args={[.035,.026,length]}/><meshStandardMaterial color="#c9c6b9" metalness={.75} roughness={.33}/></mesh>
  </group>)}
  {large?<>
   {!cutaway&&[-.72,.72].map(x=><mesh key={x} position={[x,1.476,0]}><boxGeometry args={[.08,.014,2.5]}/><meshStandardMaterial color="#48545c" metalness={.7} roughness={.38}/></mesh>)}
   <group position={[0,2.391,.18]}>{Array.from({length:12},(_,i)=>[.79,1.17,1.43].map((r,j)=>{const a=i*Math.PI/6+Math.PI/12;return <group key={i+":"+j} position={[Math.cos(a)*r,0,Math.sin(a)*r]} rotation={[0,-a,0]}><mesh><boxGeometry args={[.22,.009,.2+j*.08]}/><meshStandardMaterial color={i%2?"#253f57":"#1e344a"} metalness={.55} roughness={.35}/></mesh><mesh position={[0,.007,0]}><boxGeometry args={[.006,.003,.19+j*.08]}/><meshStandardMaterial color="#8ea2ae" metalness={.8} roughness={.3}/></mesh></group>;}))}</group>
   {[1.49,1.72,2.02,2.25].map(v=><mesh key={v} position={[0,v,.18]}><cylinderGeometry args={[.13,.13,.07,24]}/><meshStandardMaterial color="#a79b82" metalness={.8} roughness={.32}/></mesh>)}
  </>:<>
   {!cutaway&&[-.58,.58].map(x=><mesh key={x} position={[x,1.07,-.12]} castShadow><boxGeometry args={[.06,.05,1.7]}/><meshStandardMaterial color="#c6c6bd" metalness={.75} roughness={.35}/></mesh>)}
   {[-.22,.22].map(x=><group key={x} position={[x,.97,-1.274]} rotation={[Math.PI/2,0,0]}><mesh><torusGeometry args={[.09,.014,8,28]}/><meshStandardMaterial color="#86989f" metalness={.85} roughness={.24}/></mesh><mesh position={[0,0,.01]}><circleGeometry args={[.063,28]}/><meshPhysicalMaterial color="#0f2633" metalness={.15} roughness={.08} clearcoat={1}/></mesh></group>)}
   <mesh position={[0,.73,-1.193]} castShadow><boxGeometry args={[.72,.035,.045]}/><meshStandardMaterial color="#e2a857" metalness={.55} roughness={.45}/></mesh>
  </>}
  {[-1,1].flatMap(x=>[-1,0,1].map(z=><group key={x+":"+z} position={[x*(large?1.27:.985),large?.43:.335,z*(large?1.15:.85)]}>{Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return <Fitting key={i} position={[0,Math.cos(a)*(large?.17:.13),Math.sin(a)*(large?.17:.13)]} scale={.8}/>;})}</group>))}
 </group>;
}
