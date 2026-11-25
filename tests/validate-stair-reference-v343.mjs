import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG,GRAND_STAIR as S} from '../chateau/roissy-config.js';
import {surfaceHeight} from '../chateau/navigation.js';
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const check=(b,m)=>{if(!b)throw Error(m)};
const audit=a.validations.grandEscalierConstruction;const ray=new THREE.Raycaster(),rise=(OG-EG)/36;
const cores=[],rounded=[],treadMeshes=[];scene.traverse(o=>{if(o.isMesh){if(o.name==='Roissy_Treppenuntersicht_Aus_Kalkstein')cores.push(o);if(/^Roissy_Antrittstufe_Rund_\d$/.test(o.name))rounded.push(o);if(o.name.includes('intStairStone')||o.name.includes('intStairMolding'))treadMeshes.push(o);}});
check(cores.length===2&&rounded.length===3,'continuous cores and three rounded treads');
let topRays=0,roundedRays=0,coreRays=0;
for(const [f,offset] of [[S.first,0],[S.second,18]])for(let i=0;i<18;i++){
 const z=f.startZ+f.direction*(i+.5)*f.length/18,top=EG+(offset+i+1)*rise;
 for(const dx of [-.7,0,.7]){
 ray.set(new THREE.Vector3(f.x+dx,top+.09,z),new THREE.Vector3(0,-1,0));ray.far=.17;
 const hit=ray.intersectObjects([...rounded,...cores,...treadMeshes],false)[0];check(hit&&Math.abs(hit.point.y-top)<.012,'actual tread top '+[offset,i,dx,hit?.point.y,top]);check(Math.abs(surfaceHeight(f.x+dx,z,top)-top)<.001,'navigation height');topRays++;
 }
 // Core underside is a continuous, physically closed inclined surface.
 const base=EG+offset*rise,b0=Math.max(EG-.01,base+rise-.43),b1=base+18*rise-.43;
 const under=b0+(b1-b0)*(i+.5)/18;
 ray.set(new THREE.Vector3(f.x,under-.10,z),new THREE.Vector3(0,1,0));ray.far=.20;
 const hit=ray.intersectObject(cores[offset===0?0:1],false)[0];check(hit&&Math.abs(hit.point.y-under)<.002,'core underside '+[offset,i,hit?.point.y,under]);coreRays++;
}
for(let i=0;i<3;i++){
 const o=rounded[i],z=S.first.startZ-(i+.5)*S.first.length/18,y=EG+(i+1)*rise,w=S.first.width+S.starterWidening[i]*2;
 const bb=new THREE.Box3().setFromObject(o);check(Math.abs(bb.max.x-bb.min.x-w)<.0001&&Math.abs(bb.max.y-y)<.0001,'rounded tread dimensions');
 for(const sign of [-1,1]){ray.set(new THREE.Vector3(S.first.x+sign*(w/2-.035),y+.10,z),new THREE.Vector3(0,-1,0));ray.far=.15;check(ray.intersectObject(o,false).length,'widened tread shoulder');roundedRays++;}
}
const fixtures=a.validations.interiorFinish.referenceFixtures.fixtures,lower=fixtures.find(f=>f.name.includes('UnterGalerie'));
check(lower&&lower.bottom-EG>2.1&&a.upperDeckRectangles.some(r=>lower.x>=r[0]&&lower.x<=r[1]&&lower.z>=r[2]&&lower.z<=r[3]),'lower chandelier attached below solid gallery');
check(audit.galleryFasciaRuns===6&&a.validations.surfaceCleanup.residualOverlap===0,'gallery profiles and static overlaps');
console.log(JSON.stringify({topRays,coreRays,roundedRays,starterWidths:audit.roundedStarterTreads.map(t=>t.width),closedCores:cores.length,lowerChandelierHeadroom:lower.bottom-EG,galleryFasciaRuns:audit.galleryFasciaRuns,staticOverlaps:a.validations.surfaceCleanup.residualOverlap},null,2));
