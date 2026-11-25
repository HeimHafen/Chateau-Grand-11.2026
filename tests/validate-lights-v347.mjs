import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG,GRAND_STAIR as S,CORNICE} from '../chateau/roissy-config.js';
const mat=new T.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new T.Scene(),a=buildChateau(T,scene,null,mats,new T.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const audit=a.validations.interiorFinish.referenceFixtures,check=(x,m)=>{if(!x)throw Error(m);};
const names=[...audit.fixtures,...audit.sconceDetails].map(f=>f.name);const staticMeshes=[];a.front.traverse(o=>{if(o.isMesh&&!names.includes(o.parent.name)&&!o.material.transparent)staticMeshes.push(o);});
const ray=new T.Raycaster();let wallMounts=0,ceilingMounts=0,clearance=0;
// Actual solid wall within 8cm of the rear plate, not merely a room assignment.
for(const f of audit.sconceDetails){const normal=new T.Vector3(...f.normal),pos=new T.Vector3(...f.anchor);ray.set(pos.clone().addScaledVector(normal,.10),normal.clone().negate());ray.far=.18;const hits=ray.intersectObjects(staticMeshes,false);check(hits.length>0,'wall mount unsupported '+f.name);wallMounts++;
 const [lo,hi]=f.bounds;check(hi[1]<f.wall[3]&&lo[1]>f.wall[2],'wall vertical extent');const along=f.axis==='x'?0:2;check(lo[along]>f.wall[0]&&hi[along]<f.wall[1],'wall horizontal extent');
}
for(const f of audit.fixtures){ray.set(new T.Vector3(f.x,f.ceiling-.10,f.z),new T.Vector3(0,1,0));ray.far=.30;const hits=ray.intersectObjects(staticMeshes,false);check(hits.length>0,'ceiling mount unsupported '+f.name);ceilingMounts++;check(f.bottom>(f.name.includes('UnterGalerie')?EG:OG)+2.1,'headroom');}
// Sample actual stair treads and central walking lane with a 30cm body radius and 2.10m head envelope.
for(const [flight,offset] of [[S.first,0],[S.second,18]])for(let i=0;i<18;i++)for(const side of [-.65,0,.65]){
 const x=flight.x+side,z=flight.startZ+flight.direction*(i+.5)*flight.length/18,y=EG+(offset+i+1)*(OG-EG)/36;
 for(const f of [...audit.fixtures,...audit.sconceDetails]){const [lo,hi]=f.bounds;const dx=Math.max(lo[0]-x,0,x-hi[0]),dz=Math.max(lo[2]-z,0,z-hi[2]);check(Math.hypot(dx,dz)>=.30||lo[1]>=y+2.10||hi[1]<y,'stair clearance '+f.name);clearance++;}
}
check(audit.fixtures.length===2&&audit.sconces===7&&audit.lights.length===9,'fixture counts');check(audit.fixtures[1].x===(-15.00-7.20)/2&&audit.fixtures[1].z===(-1.60+8.20)/2,'upper rose axis');
console.log(JSON.stringify({wallMounts,ceilingMounts,clearance,fixtures:audit.count,candles:[...audit.fixtures,...audit.sconceDetails].reduce((n,f)=>n+f.candles,0),triangles:[...audit.fixtures,...audit.sconceDetails].reduce((n,f)=>n+f.triangles,0),lights:audit.lights.length},null,2));
