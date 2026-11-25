import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {OG,CORNICE} from '../chateau/roissy-config.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const f=a.validations.interiorFinish,d=f.domeGeometry;
const area=r=>(r[1]-r[0])*(r[3]-r[2]);
const overlap=(p,q)=>Math.max(0,Math.min(p[1],q[1])-Math.max(p[0],q[0]))*Math.max(0,Math.min(p[3],q[3])-Math.max(p[2],q[2]));
check(f.domeCount===1&&d.rise===.84,'dome missing');
check(a.roofDeckRectangles.every(r=>overlap(r,d.rect)<1e-8),'roof slab closes opening');
const ray=new THREE.Raycaster();let rays=0;
const [cx,cz]=d.centre,[rx,rz]=d.radii;
const objects=[];scene.traverse(o=>{if(o.isMesh)objects.push(o);});
for(let i=-5;i<=5;i++)for(let j=-5;j<=5;j++){
 const u=i/6,v=j/6;if(u*u+v*v>.82**2)continue;
 ray.set(new THREE.Vector3(cx+rx*u,d.upper-.45,cz+rz*v),new THREE.Vector3(0,1,0));
 const hit=ray.intersectObjects(objects,false)[0];
 check(hit?.object.name==='Roissy_Vestibule_Kuppel','dome occluded '+[u,v,hit?.object.name,hit?.point.y]);
 check(Math.abs(hit.point.y-(d.upper+d.rise*Math.sqrt(1-u*u-v*v)))<.018,'wrong cap height');rays++;
}
// Spandrels seal the rectangular opening outside the ellipse.
let corners=0;
for(const sx of [-1,1])for(const sz of [-1,1])for(const scale of [.82,.90,.96]){
 const x=cx+sx*(d.rect[1]-cx)*scale,z=cz+sz*(d.rect[3]-cz)*scale;
 ray.set(new THREE.Vector3(x,d.upper-.45,z),new THREE.Vector3(0,1,0));
 const hit=ray.intersectObjects(objects,false)[0];check(hit&&Math.abs(hit.point.y-d.upper)<.10,'open spandrel '+[x,z,hit?.object.name,hit?.point.y]);corners++;
}
let support=0;
for(const r of f.ceilingReliefRects){const deck=r.layer==='eg'?a.upperDeckRectangles:a.roofDeckRectangles;check(Math.abs(deck.reduce((n,q)=>n+overlap(r.rect,q),0)-area(r.rect))<1e-6,'unsupported ceiling relief');support++;}
const runs=f.ceilingCorniceRuns;check(runs.length>100,'missing cornices');
for(let i=0;i<runs.length;i++)for(let j=i+1;j<runs.length;j++){const p=runs[i],q=runs[j];if(p.floor===q.floor&&p.profile===q.profile)check(overlap(p.rect,q.rect)<1e-7,'double cornice');}
check(f.plainCeilingFields.length>20,'missing plain ceilings');check(f.fixtureCount===0,'unexpected lighting');check(a.validations.fullDoorwayCoreCollisions===0,'door conflict');check(a.validations.surfaceCleanup.residualOverlap===0,'coplanar overlap');
console.log(JSON.stringify({version:'3.36',plainRooms:f.plainCeilingFields.length,ceilingFields:f.ceilingFields,profilePieces:runs.length,supportedReliefs:support,domeRays:rays,cornerRays:corners,domeRise:d.rise,doors:a.interiorDoorways.length,drawBatches:a.instancedDrawcalls},null,2));
