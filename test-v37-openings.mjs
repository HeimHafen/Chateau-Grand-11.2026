// Independent physical-geometry audit: door clearances against ALL actual
// instanced wall and decorative meshes, not just collision rectangles.
import * as THREE from './vendor/three/build/three.module.js';
import {buildChateau} from './chateau/architecture.js';
const donor=new THREE.Group();
for (const [i,x] of [-7.4,-2.47,2.47,7.4].entries()){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,9.6,12));m.name=['Cone001','Cone007','Cone010','Cone013'][i];m.position.set(x,6.1,18.1);donor.add(m);
 for(const [n,y] of [[['Cube419','Cube423','Cube425','Cube427'][i],1],[['Cube420','Cube424','Cube426','Cube428'][i],11.3]]){
  const c=new THREE.Mesh(new THREE.BoxGeometry(1.65,.4,1.65));c.name=n;c.position.set(x,y,18.1);donor.add(c);
 }
}
for(const n of ['Giebel','Cube431','Cube432','Cube439','Cube440']){
 const c=new THREE.Mesh(new THREE.BoxGeometry(17,.3,7.54));c.name=n;c.position.set(0,12,15.45);donor.add(c);
}
const mat=new THREE.MeshStandardMaterial();
const mats={facadeWall:mat,dressedStone:mat,trim:mat,windowStone:mat,shade:mat,paintedSash:mat,roof:mat,porticoPaving:mat,columnFinish:mat,brass:mat};
const glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.18});
const arch=buildChateau(THREE,new THREE.Scene(),donor,mats,glass);
const A=[];
for(const floor of ['eg','og']){
 arch.historicalLayers[floor].traverse(o=>{
  if(!o.isInstancedMesh||!o.name.startsWith('Historische_Bauteile_'))return;
  const material=o.name.split(':').at(-1), m=new THREE.Matrix4(), p=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3();
  for(let i=0;i<o.count;i++){
   o.getMatrixAt(i,m);m.decompose(p,q,s);
   A.push({floor,material,x:p.x,y:p.y,z:p.z,w:s.x,h:s.y,d:s.z});
  }
 });
}
const overlap=(a,b,k,dim)=>Math.min(a[k]+a[dim]/2,b[k]+b[dim]/2)-Math.max(a[k]-a[dim]/2,b[k]-b[dim]/2);
const violations=[];
for(const door of arch.interiorDoorways){
 const central=door.axis==='x'
  ?{x:door.at,y:door.baseY+1.40,z:door.fixed,w:door.width-.26,h:2.70,d:.29}
  :{x:door.fixed,y:door.baseY+1.40,z:door.at,w:.29,h:2.70,d:door.width-.26};
 for(const b of A){
  if(b.floor!==door.floor||!['wall','trim','window'].includes(b.material))continue;
  const ix=overlap(b,central,'x','w'),iy=overlap(b,central,'y','h'),iz=overlap(b,central,'z','d');
  if(ix>.045 && iy>.05 && iz>.045)violations.push({door,b,overlap:[ix,iy,iz]});
 }
}
console.log(JSON.stringify({interiorDoors:arch.interiorDoorways.length,testedObjects:A.length,blocked:violations.length}));
if(violations.length){for(const v of violations.slice(0,20))console.error(JSON.stringify(v));throw Error(violations.length+' doorway obstructions');}
if(arch.interiorDoorways.length!==45)throw Error('Door count changed from 45');
console.log('PASS: all 45 interior clearances clear of wall, jamb and lintel intrusions');
