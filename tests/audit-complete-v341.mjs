import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {collidesAt,surfaceHeight,isInsidePalace,candidateStep} from '../chateau/navigation.js';
import {EG,OG,ROOMDATA,FRONT_X_CUTS,CROSS_WALL_Z,HALF_D,planSectionY} from '../chateau/roissy-config.js';
const mat=new THREE.MeshStandardMaterial(),mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'].map(k=>[k,mat]));
const scene=new THREE.Scene(),a=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));scene.updateMatrixWorld(true);
const area=r=>Math.max(0,r[1]-r[0])*Math.max(0,r[3]-r[2]);const overlap=(r,q)=>area([Math.max(r[0],q[0]),Math.min(r[1],q[1]),Math.max(r[2],q[2]),Math.min(r[3],q[3])]);
const f=a.validations.interiorFinish,rects=f.floorRects;const hall=[FRONT_X_CUTS[3]+.155,FRONT_X_CUTS[4]-.155,CROSS_WALL_Z+.155,HALF_D-.23];
let overlaps=[],voidIntrusions=[],hallOverlap=0;for(let i=0;i<rects.length;i++){const r=rects[i];if(r.floor==='eg')hallOverlap+=overlap(r.rect,hall);else if(Math.abs(a.upperDeckRectangles.reduce((s,q)=>s+overlap(r.rect,q),0)-area(r.rect))>1e-6)voidIntrusions.push(r);for(let j=i+1;j<rects.length;j++)if(r.floor===rects[j].floor&&overlap(r.rect,rects[j].rect)>1e-6)overlaps.push([r,rects[j]]);}
let meshes=0,invalid=0;const panes=[];scene.traverse(o=>{if(o.userData.windowOpening)panes.push(o);if(o.isMesh){meshes++;const p=o.geometry.attributes.position; if(!p.array.every(Number.isFinite))invalid++;}});
// Flood fill on a 10 cm grid with true collision envelopes, doors assumed open. Stair zones excluded from per-level flood.
const reachable={};for(const [key,y] of [['eg',EG],['og',OG]]){const step=.10,nx=550,nz=290,ox=-27.5,oz=-14.5;const to=(i,j)=>[ox+i*step,oz+j*step];const walkable=new Uint8Array(nx*nz),visited=new Uint8Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const [x,z]=to(i,j);if(isInsidePalace(x,z)&&!collidesAt(x,z,y,a)&&Math.abs(surfaceHeight(x,z,y)-y)<.01)walkable[j*nx+i]=1;}
const start=Math.round((0-ox)/step)+nx*Math.round((4.5-oz)/step),queue=[start];visited[start]=1;for(let k=0;k<queue.length;k++){const n=queue[k];for(const v of [n-1,n+1,n-nx,n+nx])if(walkable[v]&&!visited[v]){visited[v]=1;queue.push(v);}}
reachable[key]={reachableCells:queue.length,rooms:ROOMDATA[key].map(r=>{let free=0,connected=0;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const [x,z]=to(i,j);if(Math.abs(x-r.x)<r.w/2-.10&&Math.abs(z-r.z)<r.d/2-.10){free+=walkable[j*nx+i];connected+=walkable[j*nx+i]&&visited[j*nx+i]?1:0;}}return {name:r.name,x:r.x,z:r.z,free,connected};})};}
const ray=new THREE.Raycaster(),roof=[];for(const pane of panes.filter(p=>!process.argv.includes('--skip-roof')&&p.userData.windowOpening.kind!=='facade')){const d=pane.userData.windowOpening;let blocked=[];for(const u of [-.23,.23])for(const h of [.18,.36,.64,.82])for(const side of [-1,1]){ray.set(new THREE.Vector3(d.at+u*d.width,d.y+h*d.height,d.fixed+d.normal*side*.50),new THREE.Vector3(0,0,-d.normal*side));ray.far=1;const hits=ray.intersectObject(a.front,true);const bad=hits.find(h=>!h.object.material.transparent);if(!hits.some(h=>h.object===pane)||bad)blocked.push({u,h,side,object:bad?.object.name});}roof.push({kind:d.kind,x:d.at,z:d.fixed,blocked});}
// Sample the actual box solids and finish planes analytically, avoiding repeated
// traversal of high-poly ornamental meshes. Dome is checked separately by its ray test.
const roomRays=[];
const boxes=[...a.staticConstructionBoxes].filter(([k])=>!k.endsWith(':glass')&&!k.endsWith(':windowGlass')).flatMap(([key,rs])=>rs.map(r=>({key,r})));
for(const [key,y] of [['eg',EG],['og',OG]])for(const r of ROOMDATA[key]){
 if(r.name.startsWith('Vide sur'))continue;
 let samples=0,failures=[],minHead=Infinity;
 for(const u of [-.32,-.16,0,.16,.32])for(const v of [-.32,-.16,0,.16,.32]){
  const x=r.x+u*r.w,z=r.z+v*r.d;
  if(!isInsidePalace(x,z)||collidesAt(x,z,y,a)||Math.abs(surfaceHeight(x,z,y)-y)>.01)continue;
  const hits=boxes.filter(({r:[bx,by,bz,w,h,d]})=>Math.abs(x-bx)<=w/2+1e-7&&Math.abs(z-bz)<=d/2+1e-7);
  const tops=hits.map(({r:[bx,by,bz,w,h,d]})=>by+h/2).filter(t=>t<=y+.03&&t>=y-.03);
  const covered=rects.some(t=>t.floor===key&&x>=t.rect[0]&&x<=t.rect[1]&&z>=t.rect[2]&&z<=t.rect[3]);
  if(covered)tops.push(y+.009);
  if(key==='eg'&&x>=hall[0]&&x<=hall[1]&&z>=hall[2]&&z<=hall[3])tops.push(y+.008);
  let head=hits.reduce((h,{r:[bx,by,bz,w,hh,d]})=>{const bottom=by-hh/2,top=by+hh/2;return top>y+.06?Math.min(h,bottom>y+.03?bottom-y:0):h;},Infinity);
  const dome=f.domeGeometry;if(key==='og'&&Math.abs(x-dome.centre[0])<=dome.radii[0]&&Math.abs(z-dome.centre[1])<=dome.radii[1]){const v=1-((x-dome.centre[0])/dome.radii[0])**2-((z-dome.centre[1])/dome.radii[1])**2;if(v>=0)head=Math.min(head,dome.upper+dome.rise*Math.sqrt(v)-y);}
  if(Number.isFinite(head))minHead=Math.min(minHead,head);
  if(!tops.length||!Number.isFinite(head)||head<2.05)failures.push({x,z,floor:tops.length?Math.max(...tops):null,head:Number.isFinite(head)?head:null,blocking:hits.filter(({r:[bx,by,bz,w,h,d]})=>by+h/2>y+.06&&by-h/2<y+2.05).map(o=>o.key)});samples++;
 }
 roomRays.push({floor:key,name:r.name,x:r.x,z:r.z,samples,minHead:Number.isFinite(minHead)?minHead:null,failures});
}
console.log(JSON.stringify({roomRays,meshes,invalid,floorRects:rects.length,floorOverlap:overlaps.length,hallOverlap,voidIntrusions:voidIntrusions.length,reachable,roof},null,2));

const check=(b,m)=>{if(!b)throw Error(m)};
check(!invalid&&!overlaps.length&&!voidIntrusions.length&&hallOverlap<1e-7,'invalid floor geometry');
for(const [key,v] of Object.entries(reachable))for(const r of v.rooms){if(r.name.startsWith('Vide sur'))check(r.free===0,'salon void walkable');else check(r.free>0&&r.free===r.connected,'unreachable room '+key+' '+r.name);}
check(roomRays.length===38&&roomRays.every(r=>r.samples>0&&!r.failures.length),'floor or overhead clearance issue');
check(roomRays.every(r=>r.minHead>planSectionY(r.floor)-(r.floor==='eg'?EG:OG)),'plan section obscured by ceiling');
check(roof.every(r=>!r.blocked.length),'roof glazing blocked in tested near-field');
if(!process.argv.includes('--skip-roof'))check(roof.length===20,'roof window count');
