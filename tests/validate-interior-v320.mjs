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
 if(r.floor==='eg')check(intersect(r.rect,hall)<1e-6,'new floor overlaps existing vestibule');
 check(Math.abs(r.y-(r.floor==='eg'?EG:OG)-.009)<1e-8,'floor finish height');
 for(const q of fin.floorRects.slice(i+1))if(q.floor===r.floor)check(intersect(r.rect,q.rect)<1e-6,'overlapping floor finish');
 if(r.floor==='og')check(Math.abs(a.upperDeckRectangles.reduce((s,q)=>s+intersect(r.rect,q),0)-area(r.rect))<1e-6,'finish crosses upper floor void');
}
let triangles=0;scene.traverse(o=>{if(!o.name.startsWith('Roissy_Interiorboden_'))return;const normals=o.geometry.attributes.normal;for(let i=0;i<normals.count;i++){check(normals.getY(i)>.999,'upward face');triangles++;}});
// Every newly introduced wall finish must stay clear of the actual aperture core.
let clearanceChecks=0;
for(const d of a.interiorDoorways){
 const h=d.width/2-.04,box=d.axis==='x'?[d.at-h,d.at+h,d.fixed-.27,d.fixed+.27]:[d.fixed-.27,d.fixed+.27,d.at-h,d.at+h];
 for(const [key,records] of a.staticConstructionBoxes){if(!key.startsWith(d.floor+':int')||key.endsWith(':intStairStone'))continue;
 for(const [x,y,z,w,hh,dd] of records){if(y+hh/2<=d.baseY+.02||y-hh/2>=d.baseY+2.78)continue;clearanceChecks++;check(intersect(box,[x-w/2,x+w/2,z-dd/2,z+dd/2])<.001,'new finish intrudes into door '+JSON.stringify(d));}}
}
for(const [x,z,y] of [[0,9.25,EG],[0,-3.65,EG],[-11.37,9.30,EG],[0,4.5,OG]]){check(!collidesAt(x,z,y,a),'shortcut spawn collision');check(Math.abs(surfaceHeight(x,z,y)-y)<1e-6,'shortcut spawn height');}
check(fin.doorCrowns===a.interiorDoorways.length,'door crown count');check(v.surfaceCleanup.residualOverlap===0,'static coplanar cleanup');
check(fin.fixtureCount===0,'no interior fixtures');
check(fin.floorRects.some(r=>r.kind==='oakBorderX')&&fin.floorRects.some(r=>r.kind==='oakBorderZ'),'oak inlaid borders present');
check(fin.wallFaces>=511,'door heads finished');
check(fin.floorRects.some(r=>r.kind==='privateOak'),'private oak present');
check(fin.salonDoubleProfiles>0,'refined salon wall profiles');
check(fin.ceilingDesigns.some(d=>d.name==='Salon'&&d.layer==='og'&&d.style==='grand'),'double-height salon ceiling');
check(fin.ceilingDesigns.some(d=>d.name==='Grand escalier'&&d.layer==='og'),'stair roof soffit');
for(const r of fin.ceilingReliefRects){
 check(area(r.rect)>0&&r.thickness>0,'valid relief geometry');
 if(r.layer==='eg')check(Math.abs(a.upperDeckRectangles.reduce((n,d)=>n+intersect(r.rect,d),0)-area(r.rect))<1e-6,'relief crosses EG ceiling void');
 check(r.drop+r.thickness/2<=.10,'relief too deep');
}
let ovalMeshes=0,lights=0;scene.traverse(o=>{if(o.name==='Roissy_Stuck_Ovalrahmen'){ovalMeshes++;check(!o.material.emissiveIntensity||o.material.emissive.getHex()===0,'non-emissive stucco');}if(o.isLight)lights++;});
check(ovalMeshes===2*fin.ceilingMedallions&&lights===0,'medallions without lights');
console.log(JSON.stringify({ceilingDesigns:fin.ceilingDesigns.map(d=>({name:d.name,style:d.style,layer:d.layer})),ceilingMedallions:fin.ceilingMedallions,reliefBoxes:fin.ceilingReliefRects.length,salonDoubleProfiles:fin.salonDoubleProfiles,version:'3.20',wallFaces:fin.wallFaces,panelFields:fin.panelFields,doorCrowns:fin.doorCrowns,ceilingFields:fin.ceilingFields,fixtureCount:fin.fixtureCount,floorZones:fin.floorZones.length,floorRectangles:fin.floorRects.length,floorFinishAreaM2:Math.round(areaTotal),floorOverlap:0,floorVoidIntrusions:0,upwardFloorVertices:triangles,clearanceChecks,shortcutSpawns:4,staticSurfaceCleanup:v.surfaceCleanup,drawBatches:a.instancedDrawcalls},null,2));

const removedDoor=a.interiorDoorways.some(d=>d.floor==='eg'&&d.axis==='z'&&Math.abs(d.fixed+13.1623)<.2&&Math.abs(d.at-5.75)<.01);
check(!removedDoor,'west stair-side door still exists');
let domeMeshes=0;scene.traverse(o=>{if(o.name==='Roissy_Vestibule_Kuppel')domeMeshes++;});
check(v.interiorFinish.domeCount===1&&domeMeshes===1,'vestibule dome missing');
