import assert from 'node:assert/strict';
import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {CELLAR,cellarBlocks} from '../chateau/cellar.js';
import {candidateStep,describePlace,EYE_Y,WALK_RADIUS} from '../chateau/navigation.js';

const names=['facadeWall','dressedStone','trim','windowStone','shade',
  'paintedSash','roof','porticoPaving','columnFinish','brass'];
const mats=Object.fromEntries(names.map(name=>[name,new T.MeshStandardMaterial({name})]));
const scene=new T.Scene();
const castle=buildChateau(T,scene,null,mats,new T.MeshStandardMaterial());
const {root,updateLights,lanternCount}=castle.cellar;
assert.equal(root.visible,false,'cellar must not contribute surface lighting');
root.visible=true;
scene.updateMatrixWorld(true);
const meshes=root.children.filter(object=>object.isMesh);
const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),up=new T.Vector3(0,1,0);
let player={...CELLAR.entry,footY:CELLAR.floor},steps=0,rays=0;
for(const [x,z] of [[22,0],[22,8],[22,10],[22.525,10],[22.525,15.6],[22.525,10],
  [22,10],[22,0],[-22,0],[-22,9],[-22.525,9],[-22.525,15.6],[-22.525,9],
  [-22,9],[-22,0],[0,0],[0,-11.72],[0,0],[0,8]]){
  const from=player,n=Math.ceil(Math.hypot(x-from.x,z-from.z)/.048);
  for(let i=1;i<=n;i++){
    player=candidateStep(player,from.x+(x-from.x)*i/n,from.z+(z-from.z)*i/n,castle);
    assert(player&&player.footY===CELLAR.floor,'blocked route at '+[x,z,i]);
    if(steps++%35&&i!==n)continue;
    const origin=new T.Vector3(player.x,CELLAR.floor+EYE_Y,player.z);
    ray.set(origin,down);
    const floor=ray.intersectObjects(meshes,false)[0];
    assert(floor&&Math.abs(floor.point.y-CELLAR.floor)<.08,'visible floor under '+[player.x,player.z]);
    ray.set(origin,up);
    const vault=ray.intersectObjects(meshes,false)[0];
    assert(vault&&vault.distance>.19,'visible ceiling over '+[player.x,player.z]);
    rays+=2;
  }
}
for(const [x,z] of [[0,13],[23,16.5],[27,0],[7,-11.6],[3,3.82],[-25.9,0]]){
  assert(cellarBlocks(x,z,WALK_RADIUS),'wall at '+[x,z]);
}
for(const [x,z,name] of [[-22.525,15,'Westliches'],[22.525,15,'Östliches'],[0,-11.72,'Parkgewölbe']]){
  assert(describePlace(x,z,CELLAR.floor,castle).includes(name));
  updateLights(x,z);
  assert.equal(castle.cellar.lighting.children.filter(o=>o.isPointLight&&o.intensity>0).length,8);
}
assert.equal(lanternCount,20);
console.log({steps,rays,footprint: CELLAR.footprint.length,lanterns:lanternCount,activeLights:8,batches:meshes.length});
