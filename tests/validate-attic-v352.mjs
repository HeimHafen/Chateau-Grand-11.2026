import assert from 'node:assert/strict';
import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {ATTIC} from '../chateau/attic.js';
import {candidateStep,describePlace,EYE_Y} from '../chateau/navigation.js';

const m=new T.MeshStandardMaterial();
const mats=Object.fromEntries(['facadeWall','dressedStone','trim','windowStone','shade',
  'paintedSash','roof','porticoPaving','columnFinish','brass'].map(key=>[key,m]));
const scene=new T.Scene();
const castle=buildChateau(T,scene,null,mats,new T.MeshStandardMaterial({transparent:true}));
scene.updateMatrixWorld(true);
const floor=castle.attic.group.children.find(mesh=>mesh.material.name.includes('Eichendielen'));
const ray=new T.Raycaster();
const down=new T.Vector3(0,-1,0);
const clear=(x,z)=>{
  ray.set(new T.Vector3(x,ATTIC.floor+EYE_Y,z),down);
  const hit=ray.intersectObject(floor)[0];
  assert(hit&&Math.abs(hit.point.y-ATTIC.floor)<.001,'wood floor supports '+[x,z]);
};
let player={...ATTIC.entry,footY:ATTIC.floor};
let steps=0;
for(const [x,z] of [[20,0],[20,9.25],[-22.15,9.25],[-22.15,-8],[20,-8]]){
  const old=player,n=Math.ceil(Math.hypot(x-old.x,z-old.z)/.05);
  for(let i=1;i<=n;i++){
    player=candidateStep(player,old.x+(x-old.x)*i/n,old.z+(z-old.z)*i/n,castle);
    assert(player&&player.footY===ATTIC.floor);
    clear(player.x,player.z);
    steps++;
  }
}
const pose={x:0,z:1.9,footY:ATTIC.floor};
assert.equal(candidateStep(pose,0,2.12,castle),null,'collision at dome enclosure');
assert.equal(candidateStep(player,ATTIC.halfWidth,0,castle),null,'hip wall collision');
assert.equal(candidateStep(player,0,-ATTIC.halfDepth,castle),null,'knee wall collision');
ray.set(new T.Vector3(0,ATTIC.floor+EYE_Y,4.3),down);
assert.equal(ray.intersectObject(floor).length,0,'original dome aperture remains unplanked');
assert.equal(castle.attic.lights.length,4);
assert.match(describePlace(player.x,player.z,player.footY,castle),/Mansardengalerie/);
console.log({steps,floorMeshes:1,atticBatches:castle.attic.group.children.length,lanterns:4});
