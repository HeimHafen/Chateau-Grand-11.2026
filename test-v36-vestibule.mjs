import * as THREE from './vendor/three/build/three.module.js';
import {buildChateau} from './chateau/architecture.js';
import {EG,OG,HALF_D} from './chateau/roissy-config.js';
const donor=new THREE.Group();
for(const [i,cx] of [-7.4,-2.47,2.47,7.4].entries()){
  const col=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,9.6,12));
  col.name=['Cone001','Cone007','Cone010','Cone013'][i];col.position.set(cx,6.1,18.1);donor.add(col);
  for(const [nm,y] of [[['Cube419','Cube423','Cube425','Cube427'][i],1],[['Cube420','Cube424','Cube426','Cube428'][i],11.3]]){
    const m=new THREE.Mesh(new THREE.BoxGeometry(1.65,.4,1.65));m.name=nm;m.position.set(cx,y,18.1);donor.add(m);
  }
}
for(const name of ['Giebel','Cube431','Cube432','Cube439','Cube440']){
  const m=new THREE.Mesh(new THREE.BoxGeometry(17,.3,7.54));m.name=name;m.position.set(0,12,15.45);donor.add(m);
}
const mat=new THREE.MeshStandardMaterial({color:0xc9b9a2});
const mats={facadeWall:mat,dressedStone:mat,trim:mat,windowStone:mat,shade:mat,paintedSash:mat,roof:mat,porticoPaving:mat,columnFinish:mat,brass:mat};
const scene=new THREE.Scene();const data=buildChateau(THREE,scene,donor,mats,mat);
let floor=null,inlays=0;scene.traverse(o=>{
 if(o.name==='Roissy_Vestibule_Natursteinboden_Grossformat')floor=o;
 if(o.name==='Roissy_Vestibule_Eingelassener_Steinfries')inlays++;
});
if(!floor)throw Error('Vestibule material plane missing');
if(inlays!==8)throw Error('Expected eight stone perimeter inlays, got '+inlays);
const size=new THREE.Box3().setFromObject(floor).getSize(new THREE.Vector3());
if(Math.abs(size.x-13.19)>.02||Math.abs(size.z-13.278)>.02)throw Error('Floor does not fit plan '+size.toArray());
if(Math.abs(floor.position.y-(EG+.008))>1e-6)throw Error('Floating vestibule floor');
const porch=data.originalPortico;
const back=11.68*.75+porch.position.z;
if(back<HALF_D+.2)throw Error('Original imported Giebel enters upper vestibule');
const markers=data.validations;
for(const field of ['donorPedimentClearOfUpperVestibule','externalCornerQuoinsOnly','vestibuleNaturalStonePBR'])
  if(markers[field]!==true)throw Error('QA marker false: '+field);
if(data.historicalFloors.eg.length!==18||data.historicalFloors.og.length!==21)throw Error('Roissy plan changed');
if(data.entranceDoors.length!==3)throw Error('Automatic doors missing');
console.log('V3.6 PASS:',JSON.stringify({floorMeters:[size.x,size.z],inlays,entranceDoors:data.entranceDoors.length,porticoGableMinZ:back,upperFloorY:OG}));
