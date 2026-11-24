import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {candidateStep} from '../chateau/navigation.js';
import {EG} from '../chateau/roissy-config.js';
const check=(x,m)=>{if(!x)throw Error(m);};
const mat=new THREE.MeshStandardMaterial(),glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.18});
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,glass),doors=a.entranceDoors;
check(doors.length===3,'three doors');let meshes=0,triangles=0,walkSteps=0;
for(const {x,z,base,door} of doors){
 check(door.leaves.length===2,'two moving leaves');
 check(door.blocks(x,z-.18,.3,base),'closed door blocks');
 door.root.traverse(o=>{if(!o.isMesh)return;meshes++;const geo=o.geometry;for(const k of ['position','normal','uv'])check(geo.attributes[k].array.every(Number.isFinite),'finite '+k);triangles+=geo.attributes.position.count/3;check(!o.material.emissiveIntensity||o.material.emissive.getHex()===0,'no emission');});
 for(let i=0;i<60;i++)door.update(1/60,x,z+2,base);
 check(!door.blocks(x,z-.18,.30,base),'open door center clear');
 for(const l of door.leaves)check(Math.abs(Math.abs(l.hinge.rotation.y)-Math.PI/2)<1e-5,'open angle');
 let p={x,z:z+1.4,footY:EG};for(let i=0;i<56;i++){const q=candidateStep(p,x,p.z-.05,a,doors);check(q,'entry route '+x+' '+JSON.stringify(p));p=q;walkSteps++;}
 for(let i=0;i<56;i++){const q=candidateStep(p,x,p.z+.05,a,doors);check(q,'exit route '+x);p=q;walkSteps++;}
 for(let i=0;i<90;i++)door.update(1/60,x,z+12,base);
 check(door.blocks(x,z-.18,.30,base),'automatic closing');
}
console.log(JSON.stringify({portals:doors.length,leaves:doors.length*2,meshes,triangles,entryExitSteps:walkSteps,closedCollision:true,automaticOpeningAndClosing:true},null,2));
