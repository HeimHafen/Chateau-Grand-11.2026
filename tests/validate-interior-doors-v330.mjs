import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {candidateStep,collidesAt,surfaceHeight} from '../chateau/navigation.js';
const check=(ok,m)=>{if(!ok)throw Error(m)};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),doors=a.interiorDoors;
check(doors.length===43&&a.interiorDoorways.length===43,'43 apertures after removal of spurious partition');
let steps=0,meshes=0;const unique=new Set(),blocked=[],sweeps=[];
for(const d of doors){const door=d.door,point=(u,v)=>d.axis==='x'?[d.at+u,d.fixed+v]:[d.fixed-v,d.at+u];const [x,z]=point(0,0);const label=`${d.floor} ${d.axis} ${d.fixed} ${d.at}`;
 check(door.blocks(x,z,.30,d.baseY),'closed '+label);check(!door.blocks(x,z,.30,d.baseY+5.7),'other floor');
 door.root.traverse(o=>{if(!o.isMesh)return;meshes++;unique.add(o.geometry);for(const k of ['position','normal','uv'])check(o.geometry.attributes[k].array.every(Number.isFinite),'invalid mesh '+label)});
 if(d.sweepScores[door.swing===-1?0:1])sweeps.push([label,d.sweepScores,door.swing]);
 const [ax,az]=point(0,-.85);for(let i=0;i<45;i++)door.update(1/60,ax,az,d.baseY);check(Math.abs(door.angle-Math.PI/2)<1e-6,'opening '+label);
 for(const dir of [-1,1]){const [sx,sz]=point(0,dir*.85);let p={x:sx,z:sz,footY:d.baseY};for(let i=1;i<=34;i++){const [nx,nz]=point(0,dir*(.85-i*.05));const q=candidateStep(p,nx,nz,a,[d]);if(!q){blocked.push([label,dir,i,nx,nz,collidesAt(nx,nz,d.baseY,a),door.blocks(nx,nz,.3,d.baseY),surfaceHeight(nx,nz,d.baseY)]);break;}p=q;steps++;}}
 const [fx,fz]=point(0,7);for(let i=0;i<100;i++)door.update(1/60,fx,fz,d.baseY);check(door.blocks(x,z,.30,d.baseY),'closing '+label);
}
console.log(JSON.stringify({doors:doors.length,leaves:doors.length*2,meshes,uniqueGeometries:unique.size,walkSteps:steps,blocked,sweeps},null,2));check(!blocked.length,'blocked route');check(!sweeps.length,'swing intersects static collider');
