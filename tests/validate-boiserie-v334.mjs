import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
const check=(v,m)=>{if(!v)throw Error(m)};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),f=a.validations.interiorFinish;
check(f.formalWallPanels.length>0&&f.formalDadoPanels.length>0&&f.formalReliefs.length>0,'missing formal detail');
let verts=0,doors=0;
for(const floor of ['eg','og']){
 const o=scene.getObjectByName('Roissy_Salon_Wandreliefs_'+floor);if(!o)continue;
 const pos=o.geometry.attributes.position;
 const rel=f.formalReliefs.filter(d=>d.floor===floor);
 const openings=a.interiorDoorways.filter(d=>d.floor===floor);
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
  check(rel.some(d=>{const [m,Y]=d.centre,[p,q,b,t]=d.panel,u=d.axis==='x'?x:z,v=d.axis==='x'?z:x,dep=d.side*(v-d.fixed)-d.edge;return u>=p+.10&&u<=q-.10&&y>=b+.10&&y<=t-.10&&Math.abs(u-m)<=d.radius*1.15&&Math.abs(y-Y)<=d.radius&&dep>.018&&dep<.09;}),'relief vertex exceeds panel');
  for(const d of openings){const u=d.axis==='x'?x:z,v=d.axis==='x'?z:x;check(!(Math.abs(u-d.at)<d.width/2-.04&&Math.abs(v-d.fixed)<.27&&y>d.baseY&&y<d.baseY+2.78),'relief intersects doorway');doors++;}
  verts++;
 }
}
check(a.validations.surfaceCleanup.residualOverlap===0,'coplanar overlap');check(a.validations.fullDoorwayCoreCollisions===0,'door core clash');
console.log(JSON.stringify({formalPanels:f.formalWallPanels.length,dadoPanels:f.formalDadoPanels.length,reliefs:f.formalReliefs.length,rooms:[...new Set(f.formalWallPanels.map(d=>d.room))],reliefVertices:verts,doorChecks:doors,doorways:a.interiorDoorways.length,overlap:a.validations.surfaceCleanup.residualOverlap},null,2));
