import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG,ROOMDATA,FRONT_X_CUTS,REAR_X_CUTS,REAR_X_CUTS_OG,STAIR_WEST} from '../chateau/roissy-config.js';
import {candidateStep,collidesAt} from '../chateau/navigation.js';
const mat=new T.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new T.Scene(),a=buildChateau(T,scene,null,mats,mat),check=(ok,s)=>{if(!ok)throw Error(s)};
check([FRONT_X_CUTS,REAR_X_CUTS,REAR_X_CUTS_OG].every(r=>Math.abs(r[2]-STAIR_WEST)<.001),'west partition mismatch');
const hall=ROOMDATA.eg[12],bay=ROOMDATA.eg[2];check(hall.w>10&&bay.w>10,'insufficient room width');
const deck=(x,z)=>a.upperDeckRectangles.some(r=>x>r[0]+1e-5&&x<r[1]-1e-5&&z>r[2]+1e-5&&z<r[3]-1e-5);
let voidChecks=0,railChecks=0,walkSteps=0;
for(let z=-1.85;z<8.5;z+=.2){check(!deck(-14.6,z),'upper deck remains in new opening');check(deck(-16.5,z),'missing gallery deck');check(collidesAt(-15.5,z,OG,a),'unprotected west void edge');voidChecks+=2;railChecks++;}
function walk(x,z,foot,endZ){let p={x,z,footY:foot};const dir=Math.sign(endZ-z);while(Math.abs(p.z-endZ)>.05){const q=candidateStep(p,x,p.z+.05*dir,a);check(q&&Math.abs(q.footY-foot)<.01,'blocked route '+JSON.stringify(p));p=q;walkSteps++;}}
walk(-15.6,9.15,EG,-8.6);walk(-16.45,-1.8,OG,8.65);
console.log(JSON.stringify({width:hall.w,frontRoomDepth:hall.d,rearRoomDepth:bay.d,voidChecks,railChecks,walkSteps,upperGalleryWidth:2.25,originalWidth:5.904,roomCount:ROOMDATA.eg.length+ROOMDATA.og.length},null,2));
