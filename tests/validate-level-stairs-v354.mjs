import assert from 'node:assert/strict';
import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {EG,OG} from '../chateau/roissy-config.js';
import {CELLAR} from '../chateau/cellar.js';
import {ATTIC} from '../chateau/attic.js';
import {CELLAR_SHAFT,ATTIC_SHAFT} from '../chateau/level-stairs.js';
import {candidateStep,EYE_Y} from '../chateau/navigation.js';

const names=['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'];
const mats=Object.fromEntries(names.map(name=>[name,new T.MeshStandardMaterial({name})]));
const scene=new T.Scene(),castle=buildChateau(T,scene,null,mats,new T.MeshStandardMaterial());
scene.updateMatrixWorld(true);
const all=[];
scene.traverse(o=>{if(o.isMesh&&!o.material.transparent&&o.visible)all.push(o);});
const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0),up=new T.Vector3(0,1,0);
let samples=0,rays=0;
for(const [idx,rect,low,high] of [[0,CELLAR_SHAFT,CELLAR.floor,EG],[1,ATTIC_SHAFT,OG,ATTIC.floor]]){
  const [a,b,c,d]=rect,left=a+.82,right=b-.82,turn=c+.51,z=d+.46;
  let player={x:left,z,footY:low};
  const path=[[left,turn,null],[right,turn,null],[right,z,high],[right,turn,null],[left,turn,null],[left,z,low]];
  for(const [tx,tz,expected] of path){
    const from=player,n=Math.ceil(Math.hypot(tx-from.x,tz-from.z)/.045);
    for(let i=1;i<=n;i++){
      player=candidateStep(player,from.x+(tx-from.x)*i/n,from.z+(tz-from.z)*i/n,castle);
      assert(player,JSON.stringify({idx,tx,tz,i,from}));
      const {x,footY,z}=player;
      if(samples++%17!==0||!player.access)continue;
      const origin=new T.Vector3(x,footY+EYE_Y,z);
      ray.set(origin,down);
      const tread=ray.intersectObjects(all,false)[0];
      assert(tread&&Math.abs(tread.point.y-footY)<.20,JSON.stringify({idx,x,z,footY,tread:tread?.point.y,mesh:tread?.object.name,parent:tread?.object.parent.name,material:tread?.object.material.name}));
      ray.set(new T.Vector3(x,footY+.03,z),up);
      const obstruction=ray.intersectObjects(all,false)[0];
      assert(!obstruction||obstruction.distance>2.07,JSON.stringify({idx,x,z,footY,ceiling:obstruction?.point.y,mesh:obstruction?.object.name,parent:obstruction?.object.parent.name}));
      rays+=2;
    }
    if(expected!==null)assert.equal(player.footY,expected);
  }
  assert.equal(player.access,undefined);
  assert.equal(candidateStep({x:a-.38,z:c+2,footY:high},a-.29,c+2,castle),null,'guard at upper void');
}
for(const [f,y,z,fromX,toX] of [['eg',EG,10.68,-11.37,-18.85],['og',OG,9.72,-8.55,-18.85]]){
  let player={x:fromX,z,footY:y};
  for(let i=1;i<=220;i++){
    player=candidateStep(player,fromX+(toX-fromX)*i/220,z,castle);
    assert(player,'existing Grand Escalier connects on '+f+' step '+i);
  }
}
console.log({samples,rays,roundTrips:2,doorApproaches:2});
