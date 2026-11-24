import fs from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {buildChateau} from '../chateau/architecture.js';
import {candidateStep,collidesAt} from '../chateau/navigation.js';
import {EG,OG,CROSS_WALL_Z} from '../chateau/roissy-config.js';
const bytes=fs.readFileSync(new URL('../assets/white-house-structure.glb',import.meta.url));
const {scene:donor}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const m=new THREE.MeshStandardMaterial();
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,m]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,donor,mats,m);
const check=(b,msg)=>{if(!b)throw Error(msg);};
check(a.hallSupports.length===8,'four supports per floor');
for(const c of a.hallSupports)check(collidesAt(c.x,c.z,c.floor==='eg'?EG:OG,a),'column collision');
check(collidesAt(0,CROSS_WALL_Z+.12,OG,a),'gallery collision');
check(!collidesAt(0,4,EG,a),'central hall clear');
let p={x:-5.7,z:9.27,footY:OG};let n=0;
for(const [x,z] of [[-8.55,9.27],[-8.55,9.68],[-15,9.68]]){
 while(Math.hypot(x-p.x,z-p.z)>.00001){const d=Math.hypot(x-p.x,z-p.z),t=Math.min(1,.05/d);const q=candidateStep(p,p.x+(x-p.x)*t,p.z+(z-p.z)*t,a);check(q&&Math.abs(q.footY-OG)<.001,'western upper passage blocked at '+JSON.stringify(p));p=q;n++;}
}
check(a.originalPortico.children.length>=17,'original portico loaded');
let invalid=0;scene.updateMatrixWorld(true);scene.traverse(o=>{if(!o.matrixWorld.elements.every(Number.isFinite))invalid++;if(o.isInstancedMesh&& !o.instanceMatrix.array.every(Number.isFinite))invalid++;});check(invalid===0,'finite transforms');
console.log(JSON.stringify({version:'3.12',actualGLB:true,porticoParts:a.originalPortico.children.length,instances:a.instancedElements,drawcalls:a.instancedDrawcalls,hallSupports:a.hallSupports.length,westUpperPassageSteps:n,invalidTransforms:invalid,doorways:a.interiorDoorways.length,checks:a.validations},null,2));
