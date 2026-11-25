import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG,ROOMDATA,FRONT_DOORS,HALF_D,GRAND_STAIR} from '../chateau/roissy-config.js';
import {describePlace} from '../chateau/navigation.js';
const mat=new THREE.MeshStandardMaterial(),glass=new THREE.MeshStandardMaterial({transparent:true}),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,glass);scene.updateMatrixWorld(true);
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
const audit=a.validations.interiorFinish,ray=new THREE.Raycaster();let portalRays=0;
// Actual rendered static and direct meshes, not the virtual walking collider.
const relevant=[];a.front.traverse(o=>{if(!o.isMesh)return;if(o.name.startsWith('Historische_Bauteile_shell:')||o.name==='Roissy_Bogenarchivolte')relevant.push(o);});
// Unobstructed view through each opened facade door at multiple heights, including the former floating belt.
for(const x of FRONT_DOORS)for(const dx of [-.30,0,.30])for(const h of [.10,.20,.30,.38,.48,.70,1.0]){
 ray.set(new THREE.Vector3(x+dx,EG+h,HALF_D+.95),new THREE.Vector3(0,0,-1));ray.far=1.60;
 const hits=ray.intersectObjects(relevant,false).filter(o=>!o.object.material.transparent);check(!hits.length,'portal obstruction '+JSON.stringify({x,dx,h,name:hits[0]?.object.name,distance:hits[0]?.distance}));portalRays++;
}
const area=r=>Math.max(0,r[1]-r[0])*Math.max(0,r[3]-r[2]);const overlap=(r,q)=>area([Math.max(r[0],q[0]),Math.min(r[1],q[1]),Math.max(r[2],q[2]),Math.min(r[3],q[3])]);
let floorChecks=0;for(const f of ['eg','og'])for(const r of a.finishRegions[f]){if(r.room.name.startsWith('Vide sur'))continue;const y=f==='eg'?EG:OG;const expected=(/Grand escalier/.test(r.room.name)||(r.room.level===0&&r.room.name==='Antichambre'&&r.room.x<-9&&r.room.x>-11))?'stairStone':/Vestibule/.test(r.room.name)?'vestStone':r.room.name==='Salon'?'salonParquet':/Salle à manger/.test(r.room.name)?'diningParquet':/Grand Cabinet d’Assemblée|Cabinet de musique/.test(r.room.name)?'cabinetParquet':/Chambre de parade/.test(r.room.name)?'chamberParquet':/Antichambre|Passage/.test(r.room.name)?'passageParquet':/Cabinet|Chambre/.test(r.room.name)?'privateOak':'stone';
 for(const q of audit.floorRects.filter(q=>q.floor===f&&overlap(q.rect,r.rect)>1e-6)){check(q.kind===expected,'incorrect material in '+r.room.name+': '+q.kind+' vs '+expected);floorChecks++;}
}
let lighting=0;for(const f of audit.referenceFixtures.fixtures){const foot=f.bottom>OG?OG:EG;check(f.bottom-foot>2.10,'fixture headroom '+f.name);lighting++;}
check(audit.referenceFixtures.count>=2,'missing reference fixtures');check(a.validations.surfaceCleanup.residualOverlap===0,'coplanar overlaps');
const label=describePlace(0,HALF_D-.55,EG,a);check(label.includes('Vestibule'),'interior incorrectly labelled terrace: '+label);
console.log(JSON.stringify({portalRays,floorChecks,finishRegions:{eg:a.finishRegions.eg.length,og:a.finishRegions.og.length},floorRects:audit.floorRects.length,fixtures:audit.referenceFixtures,lighting,interiorLabel:label,overlaps:a.validations.surfaceCleanup.residualOverlap},null,2));
