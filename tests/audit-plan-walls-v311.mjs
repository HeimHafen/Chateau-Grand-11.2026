/** V3.11: historical ROOMDATA boundaries vs real partition register.
 * Uses same lightweight donor GLB stand-in as previous automated tests.
 * All dimensions are drawing estimates; this is an internal consistency audit.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {ROOMDATA,REAR_X_CUTS,REAR_X_CUTS_OG,FRONT_X_CUTS,CROSS_WALL_Z,
        SECONDARY_ROOM_WALLS,HALF_W,HALF_D} from '../chateau/roissy-config.js';
const M=new THREE.MeshStandardMaterial({color:0xc9c1b5});
const mats={facadeWall:M,dressedStone:M,trim:M,windowStone:M,shade:M,paintedSash:M,
            porticoPaving:M,columnFinish:M,brass:M};
const donor=new THREE.Group();
for(const name of ['Giebel','Cube431','Cube432','Cube439','Cube440',
  'Cone001','Cone007','Cone010','Cone013','Cube419','Cube423','Cube425','Cube427',
  'Cube420','Cube424','Cube426','Cube428']){
  const ob=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),M);
  ob.name=name;ob.position.set(0,3,name==='Giebel'?16:15);donor.add(ob);
}
const model=buildChateau(THREE,new THREE.Scene(),donor,mats,M);
const walls=model.planPartitions;
if(!walls?.length)throw Error('Missing structural partition registry');
const intervals=(r,axis)=>axis==='x'?[r.x-r.w/2,r.x+r.w/2]:[r.z-r.d/2,r.z+r.d/2];
const overlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
const inspections=[];
for(const f of ['eg','og'])for(let i=0;i<ROOMDATA[f].length;i++)
  for(let j=i+1;j<ROOMDATA[f].length;j++){
    const a=ROOMDATA[f][i],b=ROOMDATA[f][j];
    const xa=intervals(a,'x'),xb=intervals(b,'x'),za=intervals(a,'z'),zb=intervals(b,'z');
    const xGap=Math.max(0,Math.max(xa[0],xb[0])-Math.min(xa[1],xb[1]));
    const zGap=Math.max(0,Math.max(za[0],zb[0])-Math.min(za[1],zb[1]));
    let orientation,coord,span;
    if(overlap(za,zb)>1.0 && xGap>.25 && xGap<1.2){
      orientation='z';coord=+(0.5*(xa[1]<xb[0]?xa[1]+xb[0]:xb[1]+xa[0])).toFixed(4);
      span=[Math.max(za[0],zb[0]),Math.min(za[1],zb[1])];
    }else if(overlap(xa,xb)>1.0 && zGap>.25 && zGap<1.2){
      orientation='x';coord=+(0.5*(za[1]<zb[0]?za[1]+zb[0]:zb[1]+za[0])).toFixed(4);
      span=[Math.max(xa[0],xb[0]),Math.min(xa[1],xb[1])];
    }else continue;
    const matches=walls.filter(w=>w.floor===f&&w.axis===orientation&&Math.abs(w.fixed-coord)<.19&&
      overlap([w.from,w.to],span)>Math.min(.75,(span[1]-span[0])*.24));
    const intentional=orientation==='x'&&Math.abs(coord-CROSS_WALL_Z)<.19&&
      /Grand escalier/.test(a.name+' '+b.name);
    inspections.push({floor:f,between:[a.name,b.name],axis:orientation,coord,
                      status:matches.length?'modelled':intentional?'intentional-stair-opening':'MISSING'});
  }
const missing=inspections.filter(i=>i.status==='MISSING');
if(missing.length)throw Error('Plan pair boundaries missing: '+JSON.stringify(missing));
const numbers={
  planRoomZones:{eg:ROOMDATA.eg.length,og:ROOMDATA.og.length},
  axes:{rear:REAR_X_CUTS,rearOG:REAR_X_CUTS_OG,front:FRONT_X_CUTS,cross:CROSS_WALL_Z},
  verifiedAdjacentRoomInterfaces:inspections.length,
  modelledRoomBoundaries:inspections.filter(i=>i.status==='modelled').length,
  intentionalStairOpeningInterfaces:inspections.filter(i=>i.status==='intentional-stair-opening').length,
  missingRoomPartitions:missing.length,
  secondaryPartitionLines:{ground:SECONDARY_ROOM_WALLS.eg.length,first:SECONDARY_ROOM_WALLS.og.length},
  wallJunctionsTested:model.validations.checkedMasonryJoins,
  doorways:model.interiorDoorways.length,
  heightAccuracy:'Not an original 1708 architectural measured survey',
  safariRender:'Not tested in real Safari'
};
if(model.validations.wallJoinConflicts)throw Error('Wall T-junctions not closed');
if(model.validations.fullDoorwayCoreCollisions)throw Error('Doors obstructed');
console.log(JSON.stringify(numbers,null,2));
