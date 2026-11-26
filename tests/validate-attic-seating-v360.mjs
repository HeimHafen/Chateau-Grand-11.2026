import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {loadAtticSeating} from '../chateau/attic-seating.js';
import {ATTIC} from '../chateau/attic.js';
import {candidateStep,collidesAt} from '../chateau/navigation.js';

globalThis.self=globalThis;
// Node supplies inert image objects so that the real GLB geometry can be tested.
globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});
GLTFLoader.prototype.loadAsync=async function(url){
  const data=await readFile(new URL(url));
  return this.parseAsync(Uint8Array.from(data).buffer,'');
};
const attic={group:new T.Group(),furnitureBounds:[]};
const house={attic};
let redraws=0;
await loadAtticSeating(T,attic,()=>redraws++);
assert.equal(redraws,2);
assert.equal(attic.furnitureBounds.length,2);
for(const o of attic.group.children){
  const box=new T.Box3().setFromObject(o,true);
  assert(Math.abs(box.min.y-ATTIC.floor)<1e-6,'furniture stands on oak floor');
  assert(box.min.x>18&&box.max.x<ATTIC.halfWidth&&box.min.z>.75&&box.max.z<3.3);
  const center=box.getCenter(new T.Vector3());
  assert(collidesAt(center.x,center.z,ATTIC.floor,house));
  console.log(o.name,box.getSize(new T.Vector3()).toArray());
}
const [chair,table]=attic.furnitureBounds;
assert(chair.z0>table.z1,'table does not touch armchair');
let player={x:ATTIC.entry.x,z:0,footY:ATTIC.floor};
for(let i=0;i<880;i++){
  player=candidateStep(player,player.x+.045,player.z,house);
  assert(player,'gallery axis unobstructed');
}
assert(player.x>21);
