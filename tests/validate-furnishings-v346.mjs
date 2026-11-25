import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG} from '../chateau/roissy-config.js';
const mat=new T.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));const scene=new T.Scene(),a=buildChateau(T,scene,null,mats,new T.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const f=a.validations.interiorFinish.furnishings,check=(b,m)=>{if(!b)throw Error(m)};let solid=0,wall=0,deck=0;const issues=[];
for(const e of f.entries){const [lo,hi]=e.bounds;check([...lo,...hi].every(Number.isFinite),'invalid bounds');const y=e.floor==='eg'?EG:OG;if(!e.solid)continue;solid++;check(Math.abs(lo[1]-y)<.055,'unsupported '+e.name);const coll=a.interiorCollision[e.floor];check(coll.some(w=>w.furniture===e.name),'collider absent '+e.name);
 for(const w of coll.filter(w=>!w.furniture)){const dx=Math.min(hi[0],w.x1)-Math.max(lo[0],w.x0),dz=Math.min(hi[2],w.z1)-Math.max(lo[2],w.z0);if(dx>.015&&dz>.015)issues.push({name:e.name,dx,dz,wall:w});wall++;}
 if(e.floor==='og'){for(const x of [lo[0],hi[0]])for(const z of [lo[2],hi[2]]){check(a.upperDeckRectangles.some(r=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3]),'furniture above void '+e.name);deck++;}}
}
console.log(JSON.stringify({total:f.entries.length,solid,wall,deck,triangles:f.totalTriangles,lights:f.lights.length,issues,entries:f.entries},null,2));check(!issues.length,'furniture intersects masonry');
