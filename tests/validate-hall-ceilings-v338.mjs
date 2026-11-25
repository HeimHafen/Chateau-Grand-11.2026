import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const f=a.validations.interiorFinish,orn=f.hallCeilingOrnaments,d=f.domeGeometry;
check(orn.filter(o=>o.kind==='stair').length===2,'stair reserves');check(orn.filter(o=>o.kind==='vestibule'&&o.floor==='eg').length===9,'EG coffers');check(orn.some(o=>o.kind==='vestibule'&&o.floor==='og'),'OG coffers');
const objects=[];scene.traverse(o=>{if(o.isMesh)objects.push(o);});const ray=new THREE.Raycaster();let vertices=0,rays=0;
for(const floor of ['eg','og']){
 const o=scene.getObjectByName('Roissy_Hallendecken_Rosetten_V338_'+floor),p=o.geometry.attributes.position,rs=orn.filter(r=>r.floor===floor),deck=floor==='eg'?a.upperDeckRectangles:a.roofDeckRectangles;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);check(rs.some(r=>Math.hypot(x-r.centre[0],z-r.centre[1])<=r.radius+.02&&y>=r.upper-.071&&y<=r.upper+.025),'ornament out of bounds');check(deck.some(q=>x>=q[0]&&x<=q[1]&&z>=q[2]&&z<=q[3]),'no slab');vertices++;}
 for(const r of rs){const [x,z]=r.centre;ray.set(new THREE.Vector3(x+.003,r.upper-.4,z+.006),new THREE.Vector3(0,1,0));const hit=ray.intersectObjects(objects,false)[0];check(hit?.object===o,'hidden rosette '+JSON.stringify(r)+' '+hit?.object.name);rays++;}
}
const o=scene.getObjectByName('Roissy_Kuppel_Lorbeerfries_V338'),p=o.geometry.attributes.position,[cx,cz]=d.centre,[rx,rz]=d.radii;
for(let i=0;i<p.count;i++){const u=(p.getX(i)-cx)/rx,v=(p.getZ(i)-cz)/rz,r=Math.hypot(u,v),dy=p.getY(i)-(d.upper+d.rise*Math.sqrt(Math.max(0,1-r*r)));check(r>.83&&r<.99&&Math.abs(dy)<.065,'dome band off surface '+[r,dy]);vertices++;}
let bandRays=0;for(let i=0;i<32;i++){const t=i*Math.PI/16+.039,r=.933;ray.set(new THREE.Vector3(cx+rx*r*Math.cos(t),d.upper-.4,cz+rz*r*Math.sin(t)),new THREE.Vector3(0,1,0));const hit=ray.intersectObjects(objects,false)[0];check(hit?.object===o,'hidden dome leaf '+i+' '+hit?.object.name);bandRays++;}
check(f.fixtureCount===0&&a.validations.fullDoorwayCoreCollisions===0&&a.validations.surfaceCleanup.residualOverlap===0,'regression');
console.log(JSON.stringify({version:'3.38',medallions:orn.length,lowerHall:orn.filter(o=>o.kind==='vestibule'&&o.floor==='eg').length,upperHall:orn.filter(o=>o.kind==='vestibule'&&o.floor==='og').length,stair:2,domeLaurel:f.domeLaurel,vertices,rays,bandRays},null,2));
