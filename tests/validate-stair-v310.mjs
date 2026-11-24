/** Château Grand V3.10 – reproducible headless geometry test, no WebGL renderer.
 * Run from repository root: node --experimental-default-type=module tests/validate-stair-v310.mjs
 * The donor GLB is replaced by same-named lightweight bounding stand-ins here;
 * this verifies the generated scene graph and collision constraints, NOT actual
 * iPhone Safari rendering or historical centimetre fidelity.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG,GRAND_STAIR,ROOMDATA} from '../chateau/roissy-config.js';
import {candidateStep} from '../chateau/navigation.js';
const basic=()=>new THREE.MeshStandardMaterial({color:0xbdb4aa});
const mat={facadeWall:basic(),dressedStone:basic(),trim:basic(),windowStone:basic(),shade:basic(),paintedSash:basic(),porticoPaving:basic(),columnFinish:basic(),brass:basic()};
const donor=new THREE.Group();
for(const name of ['Giebel','Cube431','Cube432','Cube439','Cube440','Cone001','Cone007','Cone010','Cone013','Cube419','Cube423','Cube425','Cube427','Cube420','Cube424','Cube426','Cube428']){
  const m=new THREE.Mesh(new THREE.BoxGeometry(1,name.startsWith('Cone')?9:1,1),basic());m.name=name;
  m.position.set(name.startsWith('Cone')?(-2+['Cone001','Cone007','Cone010','Cone013'].indexOf(name)*1.3):0,
    name.startsWith('Cone')?5.5:1,
    name==='Giebel'?16:15);
  donor.add(m);
}
const scene=new THREE.Scene();
const chateau=buildChateau(THREE,scene,donor,mat,basic());
const v=chateau.validations;
const a=v.grandEscalierConstruction;
function assert(ok,msg){if(!ok)throw Error('FAILED '+msg);}
assert(a?.steps===36,'36 matching treads');
assert(Math.abs(a.stairMid-(EG+OG)/2)<1e-8,'middle landing height');
assert(Math.abs(a.stairEnd-OG)<1e-8,'upper floor height');
assert(a.soffits===6,'two soffits and four stone stringers');
assert(a.handrails===4,'two flight rails and both landing rails');
assert(a.balusters===36+11+7,'baluster count');
assert(a.endPiers===8,'four sets of guard end piers');
assert(a.railClearance>=2.05,'free tread width');
assert(v.fullDoorwayCoreCollisions===0,'interior doors not occluded');
assert(v.sideWindowCollisions===0,'no blocked side windows');
assert(v.slabOpeningIntrusions===0,'stair and salon voids unblocked by slabs');
assert(v.roomCountEG===18&&v.roomCountOG===21,'historical room zones intact');
assert(chateau.entranceDoors.length===3,'three entrance doors');
assert(scene.getObjectByName('Roissy_Treppenuntersicht_Aus_Kalkstein'),'inclined structural soffits present');
assert(scene.getObjectByName('Roissy_Geschlossenes_Seitliches_Treppenprofil'),'two structural side stringers present');
let bad=0,objectCount=0;
scene.traverse(o=>{if(!o.isMesh && !o.isInstancedMesh)return;objectCount++;
 const a=o.position;const q=o.quaternion;
 if(![a.x,a.y,a.z,q.x,q.y,q.z,q.w].every(Number.isFinite))bad++;
 const pos=o.geometry?.getAttribute?.('position');if(pos){for(let i=0;i<pos.array.length;i++)if(!Number.isFinite(pos.array[i])){bad++;break;}}
});
assert(bad===0,'all geometry finite');
const clear1=GRAND_STAIR.first.width-.24-.21;
assert(clear1>=2.05,'first flight has clearance');
// The actual navigation module must let the player walk the historical U staircase
// without a teleport; use short, continuous steps (both directions).
let walk={x:GRAND_STAIR.first.x,z:8.81,footY:EG},walkChecks=0;
function advance(x,z,stage){
  const next=candidateStep(walk,x,z,chateau,[]);
  assert(!!next,`${stage}: blocked at ${x.toFixed(3)},${z.toFixed(3)} from h=${walk.footY.toFixed(3)}`);
  walk=next;walkChecks++;
}
function alongZ(to,step,stage){
  const delta=Math.sign(to-walk.z);
  while(Math.abs(to-walk.z)>step+1e-6){advance(walk.x,walk.z+delta*step,stage);}
  advance(walk.x,to,stage);
}
function alongX(to,step,stage){
  const delta=Math.sign(to-walk.x);
  while(Math.abs(to-walk.x)>step+1e-6){advance(walk.x+delta*step,walk.z,stage);}
  advance(to,walk.z,stage);
}
alongZ(-1.76,.045,'first flight up');
alongX(GRAND_STAIR.second.x,.07,'turn at intermediate landing');
alongZ(8.76,.045,'second flight up');
assert(Math.abs(walk.footY-OG)<.001,'upper floor reached on foot');
alongZ(-1.76,.045,'second flight down');
alongX(GRAND_STAIR.first.x,.07,'turn back');
alongZ(8.80,.045,'first flight down');
assert(Math.abs(walk.footY-EG)<.001,'returned to EG without teleport');
const report={version:'3.10',scope:'Grand Escalier / Geländer / Untersichten',
  geometryBuild:true,meshObjects:objectCount,invalidMeshes:bad,
  roomZones:{ground:ROOMDATA.eg.length,first:ROOMDATA.og.length},
  entranceDoors:chateau.entranceDoors.length,stairs:a,walkSimulation:{samples:walkChecks,roundTrip:true},
  doorwayClashes:v.fullDoorwayCoreCollisions,
  windowClashes:v.sideWindowCollisions,
  voidIntrusions:v.slabOpeningIntrusions,
  limitations:'No real Safari/WebGL render; substitute donor geometry used for headless build. Source dimensions estimated from Le Rouge plan.'};
console.log(JSON.stringify(report,null,2));
