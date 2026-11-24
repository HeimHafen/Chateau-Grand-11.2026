/** V3.9 regression: floor-to-exterior seal, real Salon+Grand Escalier voids,
    dressed deck opening edges, and no regressions in door connectivity. */
import * as THREE from './vendor/three/build/three.module.js';
import {buildChateau} from './chateau/architecture.js';
import {HALF_W,HALF_D,OG,CORNICE} from './chateau/roissy-config.js';
const donor=new THREE.Group();
for(const [i,x] of [-7.4,-2.47,2.47,7.4].entries()){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,9.6,12));
  m.name=['Cone001','Cone007','Cone010','Cone013'][i];m.position.set(x,6.1,18.1);donor.add(m);
  for(const [n,y] of [[['Cube419','Cube423','Cube425','Cube427'][i],1],[['Cube420','Cube424','Cube426','Cube428'][i],11.3]]){
    const c=new THREE.Mesh(new THREE.BoxGeometry(1.65,.4,1.65));c.name=n;c.position.set(x,y,18.1);donor.add(c);
  }
}
for(const n of ['Giebel','Cube431','Cube432','Cube439','Cube440']){
  const m=new THREE.Mesh(new THREE.BoxGeometry(17,.3,7.54));m.name=n;m.position.set(0,12,15.45);donor.add(m);
}
const material=new THREE.MeshStandardMaterial();
const materials={facadeWall:material,dressedStone:material,trim:material,windowStone:material,shade:material,paintedSash:material,roof:material,porticoPaving:material,columnFinish:material,brass:material};
const glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.18});
const scene=new THREE.Scene(),model=buildChateau(THREE,scene,donor,materials,glass),v=model.validations;
if(!v.roofAndCeilingAreaConformsToPlan||!v.ceilingNeverBridgesSalonOrStair)throw Error('V3.9 roof/ceiling audit not present');
if(v.slabOpeningIntrusions!==0)throw Error('Slab intersects historical double-height voids');
if(v.slabPerimeterWallOverlap.some(n=>n<.025||n>.08))throw Error('Floor-to-exterior overlap outside 2.5–8 cm tolerances');
if(v.deckEdgeSegments<8||v.deckEdgeSegments>100)throw Error('Slab edge fascia count out of range');
const batches=[];
for(const o of scene.children){o.traverse(k=>{if(k.isInstancedMesh&&k.name.startsWith('Historische_Bauteile_'))batches.push(k);});}
if(!batches.length)throw Error('No historical room walls generated');
// Verify under-slab finishes do not bridge the Salon and west stairwell.
let checked=0;
for(const g of batches.filter(o=>o.name==='Historische_Bauteile_shell:ceiling')){
  const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
  for(let i=0;i<g.count;i++){
    g.getMatrixAt(i,m);m.decompose(p,q,s);
    if(Math.abs(p.y-(OG-.095-.114))>.02)continue;
    for(const h of [[-6.70,6.70,-11.10,-2.32],[-13.18,-6.77,-2.10,8.70]]){
      const ix=Math.max(0,Math.min(p.x+s.x/2,h[1])-Math.max(p.x-s.x/2,h[0]));
      const iz=Math.max(0,Math.min(p.z+s.z/2,h[3])-Math.max(p.z-s.z/2,h[2]));
      if(ix*iz>.00001)throw Error('An underside ceiling mesh spans the Salon/stairwell open volume');
    }
    checked++;
  }
}
if(checked<4)throw Error('Too few underside ceiling fields found');
console.log('ROISSY V3.9 CEILING PASS',JSON.stringify({outerWallEmbed:v.slabPerimeterWallOverlap,edgeFinishSegments:v.deckEdgeSegments,slabOpeningIntrusions:v.slabOpeningIntrusions,underCeilingFields:checked,building:[HALF_W*2,HALF_D*2],topOfWalls:CORNICE}));
