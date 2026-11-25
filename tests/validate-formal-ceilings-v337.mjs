import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const f=a.validations.interiorFinish,rooms=f.formalCeilings;
check(rooms.length===5,'missing formal ceilings');check(new Set(rooms.map(r=>r.style)).size===5,'missing individual designs');
const objects=[];scene.traverse(o=>{if(o.isMesh)objects.push(o);});
let vertices=0,rays=0,leaves=0,stems=0,collars=0;
const ray=new THREE.Raycaster();
for(const r of rooms){
 const [x0,x1,z0,z1]=r.rect,deck=r.layer==='eg'?a.upperDeckRectangles:a.roofDeckRectangles;
 for(const name of r.meshes){const o=scene.getObjectByName(name);check(o?.isMesh,'missing '+name);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);check(Number.isFinite(x+y+z)&&x>=x0+.299&&x<=x1-.299&&z>=z0+.299&&z<=z1-.299&&y>=r.upper-.15&&y<=r.upper+.035,'out of field '+name);check(deck.some(q=>x>=q[0]-1e-5&&x<=q[1]+1e-5&&z>=q[2]-1e-5&&z<=q[3]+1e-5),'unsupported '+name);vertices++;}}
 const [cx,cz]=r.centre;for(const [x,z] of [[cx+.003,cz+.007],[cx-.025,cz+.004],[cx+.025,cz-.003],[cx-.004,cz-.025],[cx+.006,cz+.025]]){ray.set(new THREE.Vector3(x,r.upper-.40,z),new THREE.Vector3(0,1,0));const hit=ray.intersectObjects(objects,false)[0];check(hit?.object.name.startsWith('Roissy_Deckenrelief_V337_'+r.name),'occluded '+r.name+' '+hit?.object.name);rays++;}
 leaves+=r.leaves;stems+=r.stems;collars+=r.collars;
}
check(a.validations.fullDoorwayCoreCollisions===0,'door collision');check(a.validations.surfaceCleanup.residualOverlap===0,'static coplanar overlap');check(f.fixtureCount===0,'unexpected lights');
console.log(JSON.stringify({version:'3.37',rooms:rooms.map(({name,style,rosetteDiameter,leaves})=>({name,style,rosetteDiameter:+rosetteDiameter.toFixed(2),leaves})),vertices,rays,leaves,stems,collars,doorways:a.interiorDoorways.length,staticOverlap:a.validations.surfaceCleanup.residualOverlap},null,2));
