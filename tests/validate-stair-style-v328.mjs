import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {CORNICE} from '../chateau/roissy-config.js';
const check=(x,m)=>{if(!x)throw Error(m);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),f=a.validations.interiorFinish;
check(f.stairWallCartouches.length>0&&f.stairCorniceRuns.length>0,'missing wall detail');
for(const d of f.stairWallCartouches){const [p,q,b,t]=d.panel,[x,y]=d.centre,r=d.radius;check(x-1.45*r>=p&&x+1.45*r<=q&&y-r>=b&&y+r<=t,'relief exceeds panel');}
let vertices=0;
for(const floor of ['eg','og']){const o=scene.getObjectByName('Roissy_Treppenhaus_Wandkartuschen_'+floor);if(!o)continue;const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);check(f.stairWallCartouches.some(d=>{if(d.floor!==floor)return false;const [c,h]=d.centre,u=d.axis==='x'?x:z,v=d.axis==='x'?z:x,dep=d.side*(v-d.fixed)-d.edge;return Math.abs(u-c)<d.radius*1.45&&Math.abs(y-h)<d.radius&&dep>0&&dep<.10;}),'relief not attached to assigned wall panel');vertices++;}}
const o=scene.getObjectByName('Roissy_Treppenhaus_Eckfleurons');check(o&&f.stairCeilingCorners===4,'ceiling corner motifs');const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){check(p.getX(i)>-12.65&&p.getX(i)<-7.20&&p.getZ(i)>-1.60&&p.getZ(i)<8.20&&p.getY(i)>CORNICE-.38&&p.getY(i)<CORNICE-.26,'ceiling motif extent');}
check(a.validations.surfaceCleanup.residualOverlap===0,'coplanar overlap');
console.log(JSON.stringify({version:'3.28',cartouches:f.stairWallCartouches.length,corniceRuns:f.stairCorniceRuns.length,ceilingCorners:f.stairCeilingCorners,wallReliefVertices:vertices,cornerVertices:p.count,doorways:a.interiorDoorways.length,overlap:a.validations.surfaceCleanup.residualOverlap},null,2));
