import * as THREE from './vendor/three/build/three.module.js';
import {buildChateau} from './chateau/architecture.js';
import {candidateStep,describePlace,EG_Y,OG_Y,surfaceHeight,collidesAt} from './chateau/navigation.js';
const donor=new THREE.Group();
for(const [i,cx] of [-7.4,-2.47,2.47,7.4].entries()){
 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,9.6,12),new THREE.MeshStandardMaterial());shaft.name=['Cone001','Cone007','Cone010','Cone013'][i];shaft.position.set(cx,6.1,18.1);donor.add(shaft);
 for(const [s,y,h,name] of [[0,1.0,.38,['Cube419','Cube423','Cube425','Cube427'][i]],[0,11.32,.28,['Cube420','Cube424','Cube426','Cube428'][i]]]){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.65,h,1.65),new THREE.MeshStandardMaterial());mesh.name=name;mesh.position.set(cx,y,18.1);donor.add(mesh);
 }
}
for(const name of ['Giebel','Cube431','Cube432','Cube439','Cube440']){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(17.6,.3,8),new THREE.MeshStandardMaterial());mesh.name=name;mesh.position.set(0,name==='Giebel'?14:12,15.5);donor.add(mesh);
}
const mat=new THREE.MeshStandardMaterial({color:0xbbab8a});
const mats={facadeWall:mat,dressedStone:mat,trim:mat,windowStone:mat,shade:mat,paintedSash:mat,roof:mat,porticoPaving:mat,columnFinish:mat,brass:mat};
const gl=new THREE.MeshStandardMaterial({transparent:true,opacity:.18,side:THREE.DoubleSide});
const scene=new THREE.Scene();
const data=buildChateau(THREE,scene,donor,mats,gl);
const expectedKeys=['front','originalPortico','facadeWidth','palaceDimensions','historicalFloors','historicalLayers','interiorCollision','entranceDoors'];
for(const k of expectedKeys)if(!data[k])throw Error('Missing '+k);
if(data.entranceDoors.length!==3)throw Error('Expected three doors');
if(data.originalPortico.children.length<17)throw Error('MaxGame portico missing');
if(data.historicalFloors.eg.length!==18||data.historicalFloors.og.length!==21)throw Error('Bad room counts');
let meshes=0,verts=0,invalid=0;
scene.traverse(o=>{if(o.isMesh){meshes++;if(o.geometry?.attributes?.position){const arr=o.geometry.attributes.position.array;verts+=arr.length/3;for(const v of arr)if(!Number.isFinite(v))invalid++;}}});
if(invalid)throw Error('Invalid mesh vertices: '+invalid);
console.log('SUCCESS',JSON.stringify({dims:data.palaceDimensions,portico:data.originalPortico.children.length,doors:data.entranceDoors.length,meshes,verts,roomCountEG:data.historicalFloors.eg.length,roomCountOG:data.historicalFloors.og.length,batches:data.instancedDrawcalls,instances:data.instancedElements,colliderWallsEG:data.interiorCollision.eg.length,colliderWallsOG:data.interiorCollision.og.length}));
// Integrate continuous axis-aligned path to door. Movement moves 0.1 m at a time.
let p={x:0,z:31,footY:0};let fail=null;
for(let z=30.9;z>=5;z-=.1){const c=candidateStep(p,0,z,data,data.entranceDoors);if(!c){fail={at:z,p,foot:surfaceHeight(0,z,p.footY),blocked:collidesAt(0,z,p.footY,data,data.entranceDoors)};break;}p={...p,...c};}
console.log('Entrance path',fail?JSON.stringify(fail):'PASS '+JSON.stringify(p));
// Stop at the treppe front and examine navigation heights.
for(const [x,z,fromY] of [[0,35,0],[0,19.8,0],[0,18.2,.82],[0,13,EG_Y],[-11.37,8.5,EG_Y],[-11.37,-1,EG_Y+(OG_Y-EG_Y)*.5],[-8.55,8.5,OG_Y]]){
 console.log('surface',x,z,fromY,surfaceHeight(x,z,fromY),describePlace(x,z,fromY,data));
}
function moveTo(destX,destZ,start){let p={...start};for(let n=0;n<3000;n++){
 const dist=Math.hypot(destX-p.x,destZ-p.z);if(dist<.071)return {ok:true,p,n};
 const step=Math.min(.085,dist),x=p.x+(destX-p.x)/dist*step,z=p.z+(destZ-p.z)/dist*step;
 for(const d of data.entranceDoors)d.door.update(.016,p.x,p.z,p.footY);
 let c=candidateStep(p,x,z,data,data.entranceDoors);
 if(!c){
   // Door has opened progressively: hold course for maximum 2s when blocked.
   let resumed=false;
   for(let wait=0;wait<130;wait++){
     for(const d of data.entranceDoors)d.door.update(.016,p.x,p.z,p.footY);
     c=candidateStep(p,x,z,data,data.entranceDoors);if(c){resumed=true;break;}
   }
   if(!resumed)return {ok:false,p,n,attempt:[x,z],floor:surfaceHeight(x,z,p.footY),blocked:collidesAt(x,z,p.footY,data,data.entranceDoors)};
 }
 p={...p,...c};
 }
 return {ok:false,p,maxSteps:true};
}
let p2={x:0,z:31,footY:0};
for(const [x,z,description] of [[0,8,'door to vestibule'],[0,-4.5,'vestibule to Salon'],[0,8,'back to vestibule'],[0,5.3,'central aisle'],[-5.6,5.3,'vestibule to west doorway'],[-8.1,5.3,'west doorway to stair landing'],[-8.05,8.66,'approach first flight at bottom'],[-11.37,8.66,'stair foot'],[-11.37,-1.65,'first stair flight'],[-8.55,-1.65,'intermediate landing'],[-8.55,8.7,'second stair flight'],[-8.55,9.35,'upper stair landing'],[-5.65,9.35,'1OG gallery door']]){
 const result=moveTo(x,z,p2);console.log('WALK',description,JSON.stringify(result));if(!result.ok)break;p2=result.p;
}
// V3.4 precise stair-to-navigation correspondence, both flights.
const {GRAND_STAIR: S}=await import('./chateau/roissy-config.js');
const delta=(OG_Y-EG_Y)/(S.stepsPerFlight*2);
for(const [flight,baseStep] of [[S.first,0],[S.second,S.stepsPerFlight]]){
  for(let i=0;i<S.stepsPerFlight;i++){
    const z=flight.startZ+flight.direction*(i+.5)*flight.length/S.stepsPerFlight;
    const h=EG_Y+(baseStep+i+1)*delta;
    const prior=EG_Y+(baseStep+i)*delta;
    const computed=surfaceHeight(flight.x,z,prior);
    if(Math.abs(computed-h)>1e-7)throw Error(`Mismatched stair step ${baseStep+i+1}: model ${h} vs navigation ${computed}`);
  }
}
if(data.validations.salonGalleryGuardedWidth!==4.90)throw Error('Unsupported gallery dimensions');
if(data.validations.stairRisersPerFlight!==S.stepsPerFlight)throw Error('Missing stone risers per flight');
if(!data.validations.stairRailAnchoredToTreads)throw Error('Stair guards not aligned');
for(const floorName of ['eg','og']){
  const floorLayer=data.historicalLayers[floorName];
  if(!floorLayer)throw Error('Missing historical floor layer '+floorName);
}
scene.traverse(o=>{
  if(!o.isInstancedMesh)return;
  const matrix=o.instanceMatrix.array;
  for(const v of matrix)if(!Number.isFinite(v))throw Error(`Invalid instance matrix ${o.name}`);
});
console.log('V3.4 CHECKS PASSED: 36 treads match navigation, salon gallery spans 4.90m, all matrices finite.');
// Verify the return route down the U-stair (no hidden one-way drop).
let reverse={x:-5.66,z:9.35,footY:OG_Y};
for(const [x,z,description] of [[-8.55,9.35,'OG passage to stair'],[-8.55,8.65,'upper stair foot'],[-8.55,-1.66,'second flight downhill'],[-11.37,-1.66,'landing west'],[-11.37,8.66,'first flight downhill'],[-8.05,8.66,'EG stair exit'],[-8.05,5.30,'approach EG west door'],[0,5.30,'EG vestibule']]){
  const result=moveTo(x,z,reverse);
  if(!result.ok)throw Error('Descending route BLOCKED at '+description+': '+JSON.stringify(result));
  reverse=result.p;
}
if(Math.abs(reverse.footY-EG_Y)>.001)throw Error('Downstairs did not return to EG');
console.log('V3.4 DESCENT PASS: upper floor to vestibule without teleporting.');
