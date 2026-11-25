import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
const mat=new THREE.MeshStandardMaterial(),glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.12});
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,glass);scene.updateMatrixWorld(true);
const frames=[];scene.traverse(o=>{if(o.isMesh&&o.name.endsWith(':doorFrame'))frames.push(o)});
const ray=new THREE.Raycaster();let rays=0;const gaps=[];
function check(d,half,top,interior){
 const objects=[];d.root.traverse(o=>{if(o.isMesh)objects.push(o)});if(interior)objects.push(...frames);
 const us=[0,-.002,.002,-.005,.005,...[-1,1].flatMap(s=>[.001,.015,.03,.038,.043,.048,.053,.062,.065,.07,.08].map(t=>s*(half-t)))];
 const ys=[.002,.010,.016,.019,.023,.040,.25,.75,1.23,2.1,top-.10,top-.05,top-.025,top-.005].filter(y=>y<top);
 // Portal glass is intentional; sample its edges only at upper elevations.
 for(const u of us)for(const y of ys){if(!interior&&y>1.2&&Math.abs(u)<half-.10&&Math.abs(u)>.01)continue;
  for(const side of [-1,1]){const start=d.root.localToWorld(new THREE.Vector3(u,y,side*.35)),end=d.root.localToWorld(new THREE.Vector3(u,y,-side*.35));ray.set(start,end.clone().sub(start).normalize());ray.far=.70;rays++;
   if(!ray.intersectObjects(objects,false).length)gaps.push({door:d.root.position.toArray(),u,y,side});
  }
 }
}
for(const d of a.interiorDoors)check(d.door,d.width/2,d.clearHeight,true);
for(const d of a.entranceDoors)check(d.door,d.door.width/2,d.door.spring,false);
console.log(JSON.stringify({doors:a.interiorDoors.length+a.entranceDoors.length,closedSeamRays:rays,unblocked:gaps.length,examples:gaps.slice(0,15)},null,2));if(gaps.length)throw Error('Visible gap detected');
