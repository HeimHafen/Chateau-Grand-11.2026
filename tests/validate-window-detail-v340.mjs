import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
const check=(b,m)=>{if(!b)throw Error(m)};
const mat=new THREE.MeshStandardMaterial();
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),model=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));
scene.updateMatrixWorld(true);
const panes=[];scene.traverse(o=>{if(o.userData.windowOpening)panes.push(o)});
const ray=new THREE.Raycaster(),failures=[];let rays=0,sillRays=0,profileCount=0,barProfiles=0,hardware=0;
const point=(d,u,v,offset)=>new THREE.Vector3(d.axis==='x'?d.at+u:d.fixed+d.normal*offset,d.y+v,d.axis==='x'?d.fixed+d.normal*offset:d.at+u);
const dir=(d,side)=>new THREE.Vector3(d.axis==='x'?0:d.normal*side,0,d.axis==='x'?d.normal*side:0);
for(const pane of panes){
 const d=pane.userData.windowOpening,t=pane.userData.windowDetail;
 check(t&&t.perimeterProfiles>0&&t.glazingBarProfiles>0,'missing profiles');
 profileCount+=t.perimeterProfiles;barProfiles+=t.glazingBarProfiles;
 check(pane.material.transparent&&!pane.material.depthWrite&&pane.material.opacity<=.10&&!pane.castShadow,'glazing settings');
 if(d.kind!=='facade')continue;
 check(t.hardware&&t.sill,'missing facade details');hardware++;
 const H=d.arched?d.height-d.width/2:d.height,f=.064;
 for(let row=0;row<4;row++)for(const q of [-1,1])for(const side of [-1,1]){
  const u=q*d.width*.24,Y=f+(H-2*f)*(row+.5)/4;
  ray.set(point(d,u,Y,side*.62),dir(d,-side));ray.far=1.24;
  const hits=ray.intersectObject(model.front,true);
  if(!hits.some(h=>h.object===pane)||hits.some(h=>h.object.isMesh&&!h.object.material.transparent))failures.push({d,row,q,side,opaque:hits.find(h=>h.object.isMesh&&!h.object.material.transparent)?.object.name});
  rays++;
 }
 // Vertical probe at the interior central sill, clear of the window's centre rod.
 ray.set(point(d,d.width*.23,.15,-.36),new THREE.Vector3(0,-1,0));ray.far=.20;
 const hits=ray.intersectObject(model.front,true);
 const sill=hits.find(h=>h.object.material?.name==='Roissy_Fensterbank_Geschliffener_Kalkstein_V340');
 check(sill&&Math.abs(sill.point.y-d.y)<.001,'sill top missing or raised '+JSON.stringify(d));sillRays++;
}
check(panes.length===93&&hardware===73,'window counts');
const g=scene.getObjectByName('Roissy_Fensterbeschlaege_V340');check(g?.geometry.attributes.position.array.every(Number.isFinite),'merged hardware');
console.log(JSON.stringify({windows:panes.length,facade:hardware,roof:panes.length-hardware,perimeterProfiles:profileCount,barProfiles,clearPaneRays:rays,blockedRays:failures.length,sillRays,hardwareVertices:g.geometry.attributes.position.count,failures:failures.slice(0,10)},null,2));
check(!failures.length,'blocked glass field');
