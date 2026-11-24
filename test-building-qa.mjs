import * as THREE from './vendor/three/build/three.module.js';
import {buildChateau} from './chateau/architecture.js';
import {collidesAt,surfaceHeight} from './chateau/navigation.js';
import {EG,OG,ROOMDATA,HALF_W,HALF_D,PERRON} from './chateau/roissy-config.js';
const donor=new THREE.Group();for(const [i,cx] of [-7.4,-2.47,2.47,7.4].entries()){let o=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,9.6,12));o.name=['Cone001','Cone007','Cone010','Cone013'][i];o.position.set(cx,6.1,18.1);donor.add(o);for(const [nm,y] of [[['Cube419','Cube423','Cube425','Cube427'][i],1],[['Cube420','Cube424','Cube426','Cube428'][i],11.3]]){o=new THREE.Mesh(new THREE.BoxGeometry(1.65,.4,1.65));o.name=nm;o.position.set(cx,y,18.1);donor.add(o)}} for(const nm of ['Giebel','Cube431','Cube432','Cube439','Cube440']){const o=new THREE.Mesh(new THREE.BoxGeometry(17,.3,8));o.name=nm;o.position.set(0,12,15);donor.add(o)}
const mat=new THREE.MeshStandardMaterial();const mats={facadeWall:mat,dressedStone:mat,trim:mat,windowStone:mat,shade:mat,paintedSash:mat,roof:mat,porticoPaving:mat,columnFinish:mat,brass:mat};const gl=new THREE.MeshStandardMaterial({transparent:true,opacity:.18,side:THREE.DoubleSide});const arch=buildChateau(THREE,new THREE.Scene(),donor,mats,gl);
for (const f of ['eg','og']){
 const foot=f==='eg'?EG:OG, inc=.25, x0=-26.5,z0=-10.9,nx=Math.floor(53/inc)+1,nz=Math.floor(22/inc)+1;
 const inGrid=(x,z)=>x>=0&&x<nx&&z>=0&&z<nz;
 const blocked=(i,j)=>collidesAt(x0+i*inc,z0+j*inc,foot,arch,[]);
 let [sx,sz]=f==='eg'?[0,5.3]:[-5.7,9.3];let si=Math.round((sx-x0)/inc),sj=Math.round((sz-z0)/inc);
 let queue=[[si,sj]], seen=new Set([sj*nx+si]);
 for(let head=0;head<queue.length;head++){
  let [i,j]=queue[head];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
    let ni=i+di,nj=j+dj;if(!inGrid(ni,nj))continue;let idx=nj*nx+ni;if(seen.has(idx)||blocked(ni,nj))continue;seen.add(idx);queue.push([ni,nj]);
  }
 }
 const result=[];
 for(const r of ROOMDATA[f]){
   const candidates=[];
   for(let i=0;i<nx;i++){const x=x0+i*inc;if(Math.abs(x-r.x)>r.w/2-.2)continue;for(let j=0;j<nz;j++){const z=z0+j*inc;if(Math.abs(z-r.z)>r.d/2-.2)continue;if(!blocked(i,j)){candidates.push([i,j])}}}
   let reach=candidates.some(([i,j])=>seen.has(j*nx+i));result.push({room:r.name,x:r.x,z:r.z,reach,walkable:candidates.length});
 }
 console.log(f,'sampled components',seen.size,'room accessibility',result.filter(r=>r.reach).length,'/',result.length);
 const unreachable=result.filter(r=>!r.reach);
 const expectedMissing=f==='og'?1:0;
 if(unreachable.length!==expectedMissing || (f==='og'&&!unreachable[0].room.startsWith('Vide sur le Salon')))
   throw Error(f+' unexpected unreachable room(s): '+JSON.stringify(unreachable));
 console.log('REACHABILITY PASS '+f+' '+(result.length-expectedMissing)+' real rooms accessible;'+
    (expectedMissing?' Salon void intentionally not walkable':''));
}

// The front seven physical stair treads and the walk surface are identical.
for(let i=0;i<PERRON.steps;i++){
  const z=PERRON.firstCentreZ+i*PERRON.treadDepth;
  const expected=PERRON.landingHeight*(PERRON.steps-i)/PERRON.steps;
  const actual=surfaceHeight(0,z,0);
  if(Math.abs(actual-expected)>1e-8)throw Error(`Perron tread ${i}: ${actual} vs ${expected}`);
}
console.log('PERRON PASS: seven visible treads equal physical walking heights');
if(arch.validations.orphanSideStairs!==0||arch.validations.roofHipAndRidgeCaps!==9||
   !arch.validations.facadeOpeningsChecked||!arch.validations.perronNavigationUsesStoneStepHeights)
  throw Error('Construction QA flags missing');
console.log('CONSTRUCTION FLAGS PASS: roof caps, window bays, room geometry');
