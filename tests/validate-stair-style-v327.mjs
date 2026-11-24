import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {GRAND_STAIR,EG,OG,CORNICE} from '../chateau/roissy-config.js';
const check=(x,m)=>{if(!x)throw Error(m);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),s=a.validations.grandEscalierConstruction;
check(s.innerMedallions===34&&s.landingScrolls===20&&s.landingMedallions===10&&s.upperScrolls>0&&s.upperMedallions>0,'new ornament count');
const S=GRAND_STAIR,mid=(EG+OG)/2,z=S.landing.z-S.landing.depth/2+.12;
let vertices=0;
for(const layer of ['shell','og']){
 const mesh=scene.getObjectByName('Roissy_Treppenhaus_Ornament_'+layer+':stairScroll');check(mesh,'missing landing scrollwork');const p=mesh.geometry.attributes.position;
 for(let i=0;i<p.count;i++){
   const y=p.getY(i),zz=p.getZ(i),x=p.getX(i);
   if(layer==='shell'){check(Math.abs(zz-z)<.014&&y>=mid+.035&&y<=mid+1.04&&x>S.landing.x-S.landing.width/2&&x<S.landing.x+S.landing.width/2,'mid landing ornamental extent');}
   else {check(Math.min(Math.abs(zz-8.8),Math.abs(zz+2.22))<.014&&y>=OG+.005&&y<=OG+1.03&&x>=-13.10&&x<=-6.65,'upper guard ornamental extent');}
   vertices++;
 }
}
const r=scene.getObjectByName('Roissy_Treppenhaus_Stuckrosette');r.geometry.computeBoundingBox();const bb=r.geometry.boundingBox;check(bb.max.x-bb.min.x>1.85&&bb.min.y>CORNICE-.383,'extended ceiling rosette');
check(a.validations.surfaceCleanup.residualOverlap===0,'coplanar static overlap');
console.log(JSON.stringify({version:'3.27',...s,landingOrnamentVertices:vertices,rosetteWidth:bb.max.x-bb.min.x,stairDoubleProfiles:a.validations.interiorFinish.stairDoubleProfiles},null,2));
