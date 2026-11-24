import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {candidateStep,collidesAt,surfaceHeight} from '../chateau/navigation.js';
import {EG,OG,EXTERIOR,FACADE_SEGMENTS,FRONT_WINDOW_AXES,REAR_WINDOW_AXES} from '../chateau/roissy-config.js';
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),check=(v,s)=>{if(!v)throw Error(s);};
let n=0;scene.updateMatrixWorld(true);scene.traverse(o=>{check(o.matrixWorld.elements.every(Number.isFinite),'bad transform');if(o.isInstancedMesh)check(o.instanceMatrix.array.every(Number.isFinite),'bad instance');n++;});
check(!a.originalPortico&&a.validations.cupolaRemoved,'legacy exterior');check(FRONT_WINDOW_AXES.length===13&&REAR_WINDOW_AXES.length===13,'elevation bays');
for(const x of [-24,24])for(const y of [EG,OG]){
 check(surfaceHeight(x,15,y)===y,'extension floor height');check(!collidesAt(x,13.6,y,a),'phantom wall in wing');check(collidesAt(x,EXTERIOR.wingFront,y,a),'outer wall collision');
}
check(collidesAt(0,EXTERIOR.parkBack,EG,a),'park boundary');check(collidesAt(0,-11.8,OG,a),'salon void');
let p={x:0,z:21,footY:0},samples=0;while(p.z>8){const q=candidateStep(p,0,p.z-.05,a,[]);check(q,'entry route stopped at '+JSON.stringify(p));p=q;samples++;}check(p.footY===EG,'entry height');
console.log(JSON.stringify({version:'3.13',meshObjects:n,courtBays:13,parkBays:13,facadeSegments:FACADE_SEGMENTS.length,entrySamples:samples,wingFloorsAndCollision:true,noLegacyPortico:true,dimensions:a.palaceDimensions},null,2));
