/**
 * Regression suite for V3.8: physical interior partition walls, real exterior
 * window cutouts, two-sided interior architrave clearances. No fake visual claim.
 */
import * as THREE from './vendor/three/build/three.module.js';
import {buildChateau} from './chateau/architecture.js';
import {PLAN,HALF_W,HALF_D,EG,OG,FRONT_WINDOW_AXES,REAR_WINDOW_AXES,SIDE_WINDOW_AXES,FRONT_DOORS} from './chateau/roissy-config.js';
const donor=new THREE.Group();
const names=['Cone001','Cone007','Cone010','Cone013'];
for(const [i,x] of [-7.4,-2.47,2.47,7.4].entries()){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,9.6,12));m.name=names[i];m.position.set(x,6.1,18.1);donor.add(m);
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
const scene=new THREE.Scene(),model=buildChateau(THREE,scene,donor,mats,glass);
function overlap(A,B){return ['x','y','z'].map((k,i)=>Math.min(A[`${k}1`],B[`${k}1`])-Math.max(A[`${k}0`],B[`${k}0`]));}
const failures=[],windows=[];
const facadeDefinitions=[
 {side:'north/front',axis:'x',plane:HALF_D,centres:FRONT_WINDOW_AXES},
 {side:'south/rear',axis:'x',plane:-HALF_D,centres:REAR_WINDOW_AXES},
 {side:'east',axis:'z',plane:HALF_W,centres:SIDE_WINDOW_AXES},
 {side:'west',axis:'z',plane:-HALF_W,centres:SIDE_WINDOW_AXES}
];
for(const f of ['eg','og']){
 for(const face of facadeDefinitions){
  for(const at of face.centres){
   if(f==='eg'&&face.side==='north/front'&&FRONT_DOORS.includes(at))continue;
   const hw=face.axis==='z'?.825:(f==='eg'?1.075:1.025);
   const band=face.plane>0?[face.plane-.63,face.plane+.18]:[face.plane-.18,face.plane+.63];
   const box=face.axis==='x'
     ?{x0:at-hw+.035,x1:at+hw-.035,z0:band[0],z1:band[1]}
     :{x0:band[0],x1:band[1],z0:at-hw+.035,z1:at+hw-.035};
   for(const w of model.interiorCollision[f]){
    const x=Math.min(box.x1,w.x1)-Math.max(box.x0,w.x0);
    const z=Math.min(box.z1,w.z1)-Math.max(box.z0,w.z0);
    if(x>.03&&z>.03)failures.push({type:'room partition blocks outside window',f,face:face.side,at,overlap:[x,z],wall:w});
   }
   windows.push({floor:f,face:face.side,at});
  }
 }
}
let physical=[];
for(const f of ['eg','og'])model.historicalLayers[f].traverse(o=>{
 if(!o.isInstancedMesh||!o.name.startsWith('Historische_Bauteile_'))return;
 const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 const material=o.name.split(':').at(-1);
 if(!['wall','window','trim'].includes(material))return;
 for(let i=0;i<o.count;i++){
  o.getMatrixAt(i,m);m.decompose(p,q,s);
  physical.push({floor:f,material,x0:p.x-s.x/2,x1:p.x+s.x/2,y0:p.y-s.y/2,y1:p.y+s.y/2,z0:p.z-s.z/2,z1:p.z+s.z/2});
 }
});
for(const door of model.interiorDoorways){
 const half=(door.width-.040)/2,prism=door.axis==='x'
  ?{x0:door.at-half,x1:door.at+half,z0:door.fixed-.14,z1:door.fixed+.14}
  :{x0:door.fixed-.14,x1:door.fixed+.14,z0:door.at-half,z1:door.at+half};
 Object.assign(prism,{y0:door.baseY+.018,y1:door.baseY+2.785});
 for(const element of physical){
  if(element.floor!==door.floor)continue;
  const [x,y,z]=overlap(prism,element);
  if(x>.015&&y>.015&&z>.015)failures.push({type:'doorway obstructed',door,element,overlap:[x,y,z]});
 }
}
console.log(JSON.stringify({version:'3.8',outerWindowLocations:windows.length,interiorDoors:model.interiorDoorways.length,testedRoomAndFrameSolids:physical.length,roomWindowConflicts:model.validations.sideWindowCollisions,failures:failures.length}));
if(windows.length!==53)throw Error('Unexpected window location count: '+windows.length);
if(model.interiorDoorways.length!==45)throw Error('Expected 45 plan-based doorways');
if(!model.validations.realDoorReveals||!model.validations.sideWindowsCheckedAgainstPartitionColliders)throw Error('V3.8 construction checks missing');
if(failures.length){for(const violation of failures.slice(0,10))console.error(JSON.stringify(violation));throw Error(`${failures.length} physical window/door overlap(s)`);}
console.log('PASS: plan-aware outside window apertures and all interior doorway cores remain free.');
