import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {candidateStep,WALK_RADIUS} from '../chateau/navigation.js';
import {EG,OG,GRAND_STAIR as S} from '../chateau/roissy-config.js';
import {readFileSync} from 'node:fs';
const assert=(b,m)=>{if(!b)throw Error(m)};
const mat=new T.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new T.Scene(),a=buildChateau(T,scene,null,mats,new T.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const carpet=a.front.getObjectByName('Roissy_Mobiliar_Savonnerie_Teppich');assert(carpet,'rug present');
const meshes=[];a.front.traverse(o=>{if(o.isMesh&&/^Roissy_Interiorboden_eg:stair(Stone|Border)$/.test(o.name))meshes.push(o)});
assert(meshes.length===2,'two opaque actual marble materials');
for(const m of meshes)assert(!m.material.transparent&&m.material.depthWrite&&!m.material.polygonOffset,'physical depth, no bias');
carpet.traverse(o=>{if(o.isMesh)assert(!o.material.transparent&&o.material.depthWrite&&o.material.depthTest,'opaque rug');});
const ray=new T.Raycaster();let hits=0;for(const d of [0,3,6,9,12])for(const x of [-15.8,-14.85,-13.9])for(const z of [3,4,5]){
 const target=new T.Vector3(x,EG+.024,z), origin=new T.Vector3(x,EG+1.69,z+d);
 ray.set(origin,target.clone().sub(origin).normalize());const hit=ray.intersectObjects([...meshes,carpet],true);assert(hit.length>1&&hit[0].object.name.startsWith('Savonnerie_Teppich'),'rug occludes marble from distance '+d);hits++;
}
const source=readFileSync(new URL('../chateau/main.js',import.meta.url),'utf8');assert(!source.includes('installStairReflection')&&!source.includes('stairReflection?.update'),'no separate mirror pass in active runtime');
const backZ=S.landing.z-S.landing.depth/2+.12,mid=(EG+OG)/2;
assert(candidateStep({x:S.landing.x,z:S.landing.z,footY:mid},S.landing.x,backZ+.1,a,[])===null,'middle landing guard blocks contact');
assert(candidateStep({x:S.landing.x,z:S.landing.z,footY:mid},S.landing.x+.05,S.landing.z,a,[]),'landing transfer remains open');
console.log(JSON.stringify({rugDepthRays:hits,opaqueFloorMeshes:meshes.length,mirrorPassRemoved:true,landingGuard:true,limitations:'CPU ray intersection and material state only; no GPU visual render.'},null,2));
