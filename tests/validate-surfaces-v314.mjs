import * as THREE from '../vendor/three/build/three.module.js';
import {resolveStaticFaces} from '../chateau/surface-cleanup.js';
import {buildChateau} from '../chateau/architecture.js';
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const material=new THREE.MeshStandardMaterial();
const example=new Map([['shell:stone',[[0,0,0,4,1,4]]],['shell:floor',[[1,0,0,4,1,4]]]]);
const unit=resolveStaticFaces(THREE,example,{stone:material,floor:material});
check(unit.stats.clippedFaces===4,'four same-facing overlapping sides in simple boxes');
check(unit.stats.residualOverlap===0,'example retains no duplicate faces');
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,new THREE.MeshStandardMaterial()]));
const scene=new THREE.Scene(),model=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));
const stats=model.validations.surfaceCleanup;
check(stats.clippedFaces>1000&&stats.residualOverlap===0,'coplanar cleanup applied');
let triangles=0;scene.traverse(o=>{
 if(!o.name.startsWith('Roissy_Entflechtete_Flaechen_'))return;
 const pos=o.geometry.attributes.position,n=o.geometry.attributes.normal;
 for(let i=0;i<pos.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(pos,i),b=new THREE.Vector3().fromBufferAttribute(pos,i+1),c=new THREE.Vector3().fromBufferAttribute(pos,i+2),normal=new THREE.Vector3().fromBufferAttribute(n,i);
  check(b.sub(a).cross(c.sub(a)).dot(normal)>0,'triangle normal or degeneracy '+o.name);triangles++;
 }
});
check(triangles>0,'renderable clipped geometry');
for(const [i,a] of model.upperDeckRectangles.entries())for(const b of model.upperDeckRectangles.slice(i+1)){
 const x=Math.min(a[1],b[1])-Math.max(a[0],b[0]),z=Math.min(a[3],b[3])-Math.max(a[2],b[2]);check(!(x>1e-7&&z>1e-7),'overlapping upper deck rectangles');
}
console.log(JSON.stringify({version:'3.14',...stats,trianglesChecked:triangles,upperDeckNonOverlapping:true,doorClashes:model.validations.fullDoorwayCoreCollisions,sideWindowClashes:model.validations.sideWindowCollisions,drawBatches:model.instancedDrawcalls},null,2));
