import assert from 'node:assert/strict';
import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';

const names=['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'];
const mats=Object.fromEntries(names.map(name=>[name,new T.MeshStandardMaterial({name})]));
const scene=new T.Scene();
buildChateau(T,scene,null,mats,new T.MeshStandardMaterial());
scene.updateMatrixWorld(true);
const panes=[],solids=[];
scene.traverse(o=>{
  if(!o.isMesh)return;
  if(['Roissy_Klarglas_attic','Roissy_Klarglas_dormer'].includes(o.name))panes.push(o);
  if(/^(Schiefer_|Gaubendach|Mittelrisalit_Dach|Pavillon_Querdach|Roissy_Dachfenster_|Roissy_Dachgeschoss_Mansarde · heller Kalkputz)/.test(o.name))solids.push(o);
});
assert.equal(panes.length,20);
assert(!scene.getObjectByName('Roissy_Vestibule_Kuppel'));
const ray=new T.Raycaster();
let clear=0;
for(const pane of panes){
  const {y,height,at,width,normal}=pane.userData.windowOpening;
  assert(pane.userData.windowDetail.hardware&&pane.userData.windowDetail.sill);
  for(const u of [-.24,.24])for(const v of [.24,.69]){
    ray.set(new T.Vector3(at+u*width,y+height*v,normal*8.1),new T.Vector3(0,0,normal));
    const target=ray.intersectObject(pane)[0];
    assert(target,'roof glazing present');
    const hit=ray.intersectObjects(solids,false)[0];
    assert(!hit||hit.distance>target.distance-.012,
      JSON.stringify({at,y,normal,u,v,hit:hit?.object.name,point:hit?.point.toArray()}));
    clear++;
  }
}
console.log({skylightOpenings:panes.length,clearViews:clear});
