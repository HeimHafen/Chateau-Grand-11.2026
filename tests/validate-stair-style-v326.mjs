import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {GRAND_STAIR,CORNICE} from '../chateau/roissy-config.js';
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),s=a.validations.grandEscalierConstruction;
const check=(x,m)=>{if(!x)throw Error(m);};
check(s.forgedCurves===136&&s.forgedMedallions===34&&s.newelFinials===10&&s.landingInlay===8,'ornament counts');
check(a.validations.interiorFinish.stairDoubleProfiles===21,'stair wall double profiles');
const r=scene.getObjectByName('Roissy_Treppenhaus_Stuckrosette');check(r,'rosette missing');r.geometry.computeBoundingBox();
check(r.geometry.boundingBox.min.y>CORNICE-.383&&r.geometry.boundingBox.max.y>CORNICE-.283,'rosette shallow and anchored');
let checked=0;scene.traverse(o=>{if(!o.name.startsWith('Roissy_Treppenhaus_Ornament_shell:stairForged'))return;
 const p=o.geometry.attributes.position,edges=[GRAND_STAIR.first.x-GRAND_STAIR.first.width/2+.12,GRAND_STAIR.first.x+GRAND_STAIR.first.width/2-.095,GRAND_STAIR.second.x-GRAND_STAIR.second.width/2+.095,GRAND_STAIR.second.x+GRAND_STAIR.second.width/2-.12];
 for(let i=0;i<p.count;i++){check(Math.min(...edges.map(x=>Math.abs(x-p.getX(i))))<.018,'ornament intrudes into flight lane');checked++;}
});check(checked>10000,'forged rail vertices');
console.log(JSON.stringify({version:'3.26',...s,stairDoubleProfiles:a.validations.interiorFinish.stairDoubleProfiles,ornamentVerticesOnRailPlane:checked,rosetteAnchored:true},null,2));
