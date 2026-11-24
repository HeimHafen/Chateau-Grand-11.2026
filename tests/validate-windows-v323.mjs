import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {FACADE_SEGMENTS,FRONT_DOORS} from '../chateau/roissy-config.js';
const check=(b,m)=>{if(!b)throw Error(m)};
const mat=new THREE.MeshStandardMaterial(),glass=new THREE.MeshStandardMaterial({transparent:true,opacity:.12});
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,glass);
const panes=[];scene.traverse(o=>{if(o.userData.windowOpening)panes.push(o)});
const expected=FACADE_SEGMENTS.reduce((n,s)=>n+2*s.windows.length-(s.entrance?s.windows.filter(x=>FRONT_DOORS.includes(x)).length:0),0);
check(panes.filter(o=>o.userData.windowOpening.kind==='facade').length===expected,'facade count');
check(panes.length===expected+a.validations.roofPlaneCutouts+6,'total count');
check(new Set(panes.map(o=>JSON.stringify(o.userData.windowOpening))).size===panes.length,'duplicated window');
scene.updateMatrixWorld(true);
const ray=new THREE.Raycaster();let rayTests=0;const failures=[];
for(const pane of panes){
 const m=pane.material,d=pane.userData.windowOpening;check(m.transparent&&m.opacity<=.11&&!m.depthWrite&&m.side===THREE.DoubleSide&&!pane.castShadow,'glass settings');
 check(pane.geometry.attributes.position.array.every(Number.isFinite),'geometry finite');
 if(d.kind!=='facade')continue;
 // Test clear portions of the lower rectangular glass in both leaves. The local
 // ray traverses the full wall depth and checks visible opaque geometry, not just colliders.
 for(const sign of [-1,1]){
  const u=sign*d.width*.24,Y=d.y+.64;
  const origin=new THREE.Vector3(d.axis==='x'?d.at+u:d.fixed+d.normal*.62,Y,d.axis==='x'?d.fixed+d.normal*.62:d.at+u);
  const dir=new THREE.Vector3(d.axis==='x'?0:-d.normal,0,d.axis==='x'?-d.normal:0);
  ray.set(origin,dir);ray.far=1.22;
  const hits=ray.intersectObject(a.front,true);
  const hit=hits.find(h=>h.object===pane);check(hit,'missing glass ray '+JSON.stringify(d));
  const solid=hits.find(h=>h.object.isMesh&&!h.object.material.transparent);
  if(solid)failures.push({window:d,object:solid.object.name,distance:solid.distance});rayTests++;
 }
}
console.log(JSON.stringify({facadeWindows:expected,roofWindows:panes.length-expected,totalWindows:panes.length,clearPaneRays:rayTests,blockedRays:failures.length,failures:failures.slice(0,8),transparent:true,doorCount:a.entranceDoors.length},null,2));
check(failures.length===0,'opaque material in sampled clear pane');
