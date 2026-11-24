import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {collidesAt,surfaceHeight} from '../chateau/navigation.js';
import {EG,OG,CORNICE,FRONT_X_CUTS,CROSS_WALL_Z,HALF_D} from '../chateau/roissy-config.js';
const check=(x,m)=>{if(!x)throw Error(m);};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));
const v=a.validations,fin=v.interiorFinish;
const area=([x0,x1,z0,z1])=>(x1-x0)*(z1-z0);
const intersect=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[2],b[2]));
const hall=[FRONT_X_CUTS[3]+.155,FRONT_X_CUTS[4]-.155,CROSS_WALL_Z+.155,HALF_D-.23];
let areaTotal=0;
for(const [i,r] of fin.floorRects.entries()){
 check(area(r.rect)>0,'non-positive floor');areaTotal+=area(r.rect);
 check(intersect(r.rect,hall)<1e-6,'new floor overlaps existing vestibule');
 check(Math.abs(r.y-(r.floor==='eg'?EG:OG)-.009)<1e-8,'floor finish height');
 for(const q of fin.floorRects.slice(i+1))if(q.floor===r.floor)check(intersect(r.rect,q.rect)<1e-6,'overlapping floor finish');
 if(r.floor==='og')check(Math.abs(a.upperDeckRectangles.reduce((s,q)=>s+intersect(r.rect,q),0)-area(r.rect))<1e-6,'finish crosses upper floor void');
}
let triangles=0;scene.traverse(o=>{if(!o.name.startsWith('Roissy_Interiorboden_'))return;const normals=o.geometry.attributes.normal;for(let i=0;i<normals.count;i++){check(normals.getY(i)>.999,'upward face');triangles++;}});
// Every newly introduced wall finish must stay clear of the actual aperture core.
let clearanceChecks=0;
for(const d of a.interiorDoorways){
 const h=d.width/2-.04,box=d.axis==='x'?[d.at-h,d.at+h,d.fixed-.27,d.fixed+.27]:[d.fixed-.27,d.fixed+.27,d.at-h,d.at+h];
 for(const [key,records] of a.staticConstructionBoxes){if(!key.startsWith(d.floor+':int'))continue;
 for(const [x,y,z,w,hh,dd] of records){if(y+hh/2<=d.baseY+.02||y-hh/2>=d.baseY+2.78)continue;clearanceChecks++;check(intersect(box,[x-w/2,x+w/2,z-dd/2,z+dd/2])<.001,'new finish intrudes into door '+JSON.stringify(d));}}
}
for(const [x,z,y] of [[0,9.25,EG],[0,-3.65,EG],[-11.37,9.30,EG],[0,4.5,OG]]){check(!collidesAt(x,z,y,a),'shortcut spawn collision');check(Math.abs(surfaceHeight(x,z,y)-y)<1e-6,'shortcut spawn height');}
check(fin.doorCrowns===a.interiorDoorways.length,'door crown count');check(v.surfaceCleanup.residualOverlap===0,'static coplanar cleanup');
console.log(JSON.stringify({version:'3.15',wallFaces:fin.wallFaces,panelFields:fin.panelFields,doorCrowns:fin.doorCrowns,ceilingFields:fin.ceilingFields,fixtureCount:fin.fixtureCount,floorZones:fin.floorZones.length,floorRectangles:fin.floorRects.length,floorFinishAreaM2:Math.round(areaTotal),floorOverlap:0,floorVoidIntrusions:0,upwardFloorVertices:triangles,clearanceChecks,shortcutSpawns:4,staticSurfaceCleanup:v.surfaceCleanup,drawBatches:a.instancedDrawcalls},null,2));
