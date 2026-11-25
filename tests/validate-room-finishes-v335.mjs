import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {ROOMDATA} from '../chateau/roissy-config.js';
const check=(v,m)=>{if(!v)throw Error(m)};
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,mat),f=a.validations.interiorFinish;
const expected={salon:'intSalonPanel',parade:'intRoomParade',dining:'intRoomDining',assembly:'intRoomAssembly',music:'intRoomMusic',bedroom:'intPrivatePanel',cabinet:'intRoomCabinet',passage:'intPassagePanel',hall:'intHallPanel',service:'intPanel'};
const counts={},rooms=new Set();
for(const r of f.roomFinishAssignments){check(expected[r.scheme]===r.panel,'unexpected material '+JSON.stringify(r));check(ROOMDATA[r.floor].some(x=>x.name===r.room&&x.x===r.roomCentre[0]&&x.z===r.roomCentre[1]),'unregistered room');counts[r.scheme]=(counts[r.scheme]||0)+1;rooms.add([r.floor,...r.roomCentre].join(':'));}
for(const [k,m] of Object.entries(expected)){check(counts[k]>0,'missing scheme '+k);check([...a.staticConstructionBoxes].some(([key,rs])=>key.endsWith(':'+m)&&rs.length),'missing rendered panels '+m);}
const newMaterials=new Set();scene.traverse(o=>{if(o.isMesh&&/^Roissy_Boiserie_(Champagner|Salbei|Sandsteinfarbig|Rauchblau|Blaugrau)$/.test(o.material?.name))newMaterials.add(o.material.name);});check(newMaterials.size===5,'new materials not applied');
check(f.roomFinishAssignments.length===f.wallFaces,'unassigned wall face');check(a.validations.fullDoorwayCoreCollisions===0,'door conflict');check(a.validations.surfaceCleanup.residualOverlap===0,'coplanar overlap');
console.log(JSON.stringify({wallFaces:f.wallFaces,roomZones:rooms.size,totalPlanZones:ROOMDATA.eg.length+ROOMDATA.og.length,schemes:counts,newMaterials:[...newMaterials],drawBatches:a.instancedDrawcalls,doorways:a.interiorDoorways.length},null,2));
