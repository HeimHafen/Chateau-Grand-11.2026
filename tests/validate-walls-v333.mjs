import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG} from '../chateau/roissy-config.js';
import {createHash} from 'node:crypto';
const check=(v,m)=>{if(!v)throw Error(m);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const a=buildChateau(THREE,new THREE.Scene(),null,mats,mat),v=a.validations,f=v.interiorFinish;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
check(f.baseboardRuns.length>100,'missing skirting');
check(f.baseboardRuns.some(r=>r.partial),'no under-window skirting');
let samples=0,clipped=0;
const records=Object.fromEntries(['eg','og'].map(f=>[f,[...a.staticConstructionBoxes].filter(([k])=>k.startsWith(f+':intBase')).flatMap(([,r])=>r)]));
for(const r of f.baseboardRuns){
 const base=r.floor==='eg'?EG:OG;
 check(r.to>r.from,'invalid span');
 for(const frac of [.03,.25,.5,.75,.97]){
  const at=r.from+(r.to-r.from)*frac,normal=r.fixed+r.side*(r.edge+.03),x=r.axis==='x'?at:normal,z=r.axis==='x'?normal:at;
  const door=a.interiorDoorways.some(d=>d.floor===r.floor&&(d.axis==='x'?Math.abs(x-d.at)<d.width/2-.04&&Math.abs(z-d.fixed)<.27:Math.abs(z-d.at)<d.width/2-.04&&Math.abs(x-d.fixed)<.27));
  if(door){clipped++;continue;}
  for(const dy of [.075,.164,.191,.224]){
   check(records[r.floor].some(([X,Y,Z,w,h,d])=>Math.abs(x-X)<=w/2+1e-6&&Math.abs(z-Z)<=d/2+1e-6&&Math.abs(base+dy-Y)<=h/2+1e-6),'missing profile '+JSON.stringify({r,at,dy}));samples++;
  }
 }
}
let checks=0;
for(const d of a.interiorDoorways){
 const half=d.width/2-.04;
 const [x0,x1,z0,z1]=d.axis==='x'?[d.at-half,d.at+half,d.fixed-.27,d.fixed+.27]:[d.fixed-.27,d.fixed+.27,d.at-half,d.at+half];
 for(const [x,y,z,w,h,dd] of records[d.floor]){const ox=Math.min(x1,x+w/2)-Math.max(x0,x-w/2),oz=Math.min(z1,z+dd/2)-Math.max(z0,z-dd/2);check(!(ox>1e-6&&oz>1e-6&&y+h/2>d.baseY+.001&&y-h/2<d.baseY+.25),'baseboard intrudes into doorway');checks++;}
}
check(v.surfaceCleanup.residualOverlap===0,'coplanar overlap');check(v.fullDoorwayCoreCollisions===0,'door obstruction');
const area=r=>(r[1]-r[0])*(r[3]-r[2]);const overlap=(r,s)=>Math.max(0,Math.min(r[1],s[1])-Math.max(r[0],s[0]))*Math.max(0,Math.min(r[3],s[3])-Math.max(r[2],s[2]));
for(const [i,r] of f.floorRects.entries()){for(const q of f.floorRects.slice(i+1))if(q.floor===r.floor)check(overlap(r.rect,q.rect)<1e-6,'floor overlap');if(r.floor==='og')check(Math.abs(a.upperDeckRectangles.reduce((n,q)=>n+overlap(r.rect,q),0)-area(r.rect))<1e-6,'floor extends into void');}
console.log(JSON.stringify({baseboardRuns:f.baseboardRuns.length,underWindowRuns:f.baseboardRuns.filter(r=>r.partial).length,wallFields:f.panelFields,wallFaces:f.wallFaces,dadoRuns:f.dadoRuns.length,profileSamples:samples,doorwayChecks:checks,clippedSamples:clipped,doorways:a.interiorDoorways.length,remainingCoplanarOverlap:v.surfaceCleanup.residualOverlap,floorHash:hash(f.floorRects),floorRects:f.floorRects.length},null,2));
