import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
const check=(ok,m)=>{if(!ok)throw Error(m)};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const a=buildChateau(THREE,new THREE.Scene(),null,mats,new THREE.MeshStandardMaterial({transparent:true}));
let vertices=0,poses=0,minGap=Infinity,hinges=0;
const cache=new Map();
for(const d of a.interiorDoors){
 const door=d.door,half=d.width/2;
 check(Math.abs(door.hingeAt-(half-.095))<1e-9,'pivot');
 const fixed=door.root.getObjectByName('Roissy_Zarge_Feste_Baender_V339');check(fixed?.isMesh,'fixed hinge assembly');
 const fp=fixed.geometry.attributes.position;
 check(fp.array.every(Number.isFinite),'fixed hinge finite');
 for(const {side,hinge} of door.leaves){
  for(const y of [.23,1.42,2.49]){
   for(const dy of [-.029,.029]){
    let hit=false;for(let i=0;i<fp.count;i++)if(Math.abs(fp.getX(i)-side*door.hingeAt)<.013&&Math.abs(fp.getY(i)-y-dy)<.012&&Math.abs(fp.getZ(i))<=.0121){hit=true;break;}
    check(hit,'hinge pin alignment');
   }
   hinges++;
  }
  // Sample every moving vertex through the complete swing, against both
  // jambs and the header. This is an envelope test, not a rendered image.
  for(const mesh of hinge.children){const p=mesh.geometry.attributes.position;
   const key=[mesh.geometry.uuid,door.hingeAt,side,door.swing].join(':');
   if(cache.has(key)){const c=cache.get(key);minGap=Math.min(minGap,c.gap);vertices+=c.vertices;poses+=19;continue;}
   let gap=Infinity,n=0;
   for(let k=0;k<=18;k++){
    const ang=side*door.swing*k*Math.PI/36,c=Math.cos(ang),s=Math.sin(ang);
    for(let i=0;i<p.count;i++){
     const x=side*door.hingeAt+p.getX(i)*c+p.getZ(i)*s,z=-p.getX(i)*s+p.getZ(i)*c,y=p.getY(i);
     if(Math.abs(z)<=.156&&y>=0&&y<2.8){
      const g=half-.038-Math.abs(x);gap=Math.min(gap,g);check(g>=-1e-5,'moving geometry meets jamb '+[d.floor,d.fixed,d.at,k,x,z,g]);
      check(y<=2.75+1e-5,'moving geometry meets header');
     }
     n++;
    }
   }
   cache.set(key,{gap,vertices:n});minGap=Math.min(minGap,gap);vertices+=n;poses+=19;
  }
 }
}
check(a.validations.fullDoorwayCoreCollisions===0,'masonry obstruction');
console.log(JSON.stringify({doors:a.interiorDoors.length,hingePairs:hinges,sampledMovingVertices:vertices,meshPoses:poses,minJambGapMM:+(minGap*1000).toFixed(2)},null,2));
let portalVertices=0,portalGap=Infinity;
for(const {door} of a.entranceDoors){
 const r=door.width/2;
 for(const {side,hinge} of door.leaves){
  check(Math.abs(hinge.position.x-side*(r-.142))<1e-8,'portal hinge offset');
  for(const m of hinge.children){const p=m.geometry.attributes.position;for(let k=0;k<=18;k++){
   const ang=-side*k*Math.PI/36,c=Math.cos(ang),s=Math.sin(ang);
   for(let i=0;i<p.count;i++){
    const x=hinge.position.x+p.getX(i)*c+p.getZ(i)*s,z=-p.getX(i)*s+p.getZ(i)*c,y=p.getY(i);
    if(Math.abs(z)<=.08001&&y>=0&&y<=door.spring){
     const g=r-.062-Math.abs(x);portalGap=Math.min(portalGap,g);check(g>=-1e-5,'portal jamb clash '+[x,z,y,k,g]);
     check(y<=door.spring-.0825+1e-5,'portal header clash '+[x,z,y,k]);
    }portalVertices++;
   }
  }}
 }
}
console.log(JSON.stringify({portals:a.entranceDoors.length,portalVertices,minPortalJambGapMM:+(portalGap*1000).toFixed(2)},null,2));
