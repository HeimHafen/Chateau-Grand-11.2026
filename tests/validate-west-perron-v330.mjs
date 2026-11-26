import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {candidateStep,collidesAt,surfaceHeight} from '../chateau/navigation.js';
import {EG,OG,HALF_D,HALF_W,REAR_X_CUTS_OG,FRONT_X_CUTS,CROSS_WALL_Z,PERRON,SECONDARY_ROOM_WALLS} from '../chateau/roissy-config.js';
const check=(v,msg)=>{if(!v)throw Error(msg)};
const mat=new THREE.MeshStandardMaterial(),glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.12});
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,glass);scene.updateMatrixWorld(true);
check(REAR_X_CUTS_OG[1]===FRONT_X_CUTS[1],'west wall axis still offset');
check(!a.planPartitions.some(p=>p.floor==='og'&&p.axis==='x'&&Math.abs(p.fixed-CROSS_WALL_Z)<.001&&p.from<-22.1),'spurious wall inside Antichambre');
let openSamples=0;
for(let x=-26.2;x<=-22.65;x+=.15)for(let z=-3.28;z<=-1.20;z+=.15){check(!collidesAt(x,z,OG,a),'Antichambre obstructed '+[x,z]);openSamples++;}
let joins=0;
for(const f of ['eg','og'])for(const w of SECONDARY_ROOM_WALLS[f]){
 const p=a.planPartitions.find(p=>p.floor===f&&p.axis==='x'&&Math.abs(p.fixed-w.z)<1e-7&&p.doors.includes(w.door));check(p,'missing wall '+w.source);
 for(const x of [p.from,p.to]){
  if(Math.abs(x)>HALF_W-.2)continue;
  const perpendicular=a.planPartitions.find(q=>q.floor===f&&q.axis==='z'&&Math.abs(q.fixed-x)<1e-7&&q.from<=w.z+.10&&q.to>=w.z-.10&&!q.doors.some(d=>Math.abs(d-w.z)<q.doorWidth/2));
  check(perpendicular,'open junction '+w.source+' '+x);joins++;
 }
}
const doors=[...a.entranceDoors,...a.interiorDoors];let p={x:-24.45,z:-5.10,footY:OG},walk=0;
function go(x,z){for(let i=0;i<2000;i++){const d=Math.hypot(x-p.x,z-p.z);if(d<1e-7)return;const n=Math.min(.045,d),nx=p.x+(x-p.x)*n/d,nz=p.z+(z-p.z)*n/d;let q;for(let wait=0;wait<150;wait++){for(const d of doors)d.door.update(1/60,p.x,p.z,p.footY);q=candidateStep(p,nx,nz,a,doors);if(q)break;}check(q,'west walk blocked '+JSON.stringify({p,nx,nz}));p=q;walk++;}throw Error('route limit');}
for(const [x,z] of [[-24.45,-2.2],[-24.45,1.1],[-24.45,5.3],[-21.24,5.3],[-21.24,9.35],[-20,9.35],[-21.24,9.35],[-21.24,5.3],[-24.45,5.3],[-24.45,1.1],[-24.45,-2.2],[-24.45,-5.1]])go(x,z);
const stones=[];scene.traverse(o=>{if(o.isMesh&&o.material?.name==='Roissy_GrandEscalier_Kalkstein')stones.push(o);});
const ray=new THREE.Raycaster();let treadSamples=0;
const checkHeight=(x,z,y)=>{ray.set(new THREE.Vector3(x,EG+3,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(stones,false)[0];check(hit&&Math.abs(hit.point.y-y)<.0001,'wrong rendered stone height '+[x,z,y,hit?.point.y]);check(Math.abs(surfaceHeight(x,z,EG)-y)<.0001,'navigation mismatch');treadSamples++;};
for(let i=0;i<PERRON.steps;i++){const z=PERRON.firstCentreZ+i*PERRON.treadDepth,h=EG*(PERRON.steps-i)/PERRON.steps;for(const x of [-5.5,0,5.5])for(const dz of [-.19,0,.19])checkHeight(x,z+dz,h);}
for(const x of [-5.5,0,5.5])for(const z of [HALF_D+.5,13.5,PERRON.terraceEndZ-.005])checkHeight(x,z,EG);
check(Math.abs(PERRON.terraceEndZ-(PERRON.firstCentreZ-PERRON.treadDepth/2))<1e-8,'terrace seam');
console.log(JSON.stringify({version:'3.30',openAntichambreSamples:openSamples,secondaryWallJunctions:joins,westRoundTripSteps:walk,exteriorTreadAndLandingSamples:treadSamples,interiorDoors:a.interiorDoors.length,doorwayClashes:a.validations.fullDoorwayCoreCollisions},null,2));
