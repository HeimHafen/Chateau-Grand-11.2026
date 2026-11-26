import assert from 'node:assert/strict';
import * as T from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';
import {CORNICE,HALF_D} from '../chateau/roissy-config.js';

const names=['facadeWall','dressedStone','trim','windowStone','shade','paintedSash','roof','porticoPaving','columnFinish','brass'];
const mats=Object.fromEntries(names.map(name=>[name,new T.MeshStandardMaterial({name})]));
const scene=new T.Scene();
buildChateau(T,scene,null,mats,new T.MeshStandardMaterial());
scene.updateMatrixWorld(true);
const panes=[],solids=[];

scene.traverse(o=>{
  if(!o.isMesh)return;
  if(o.name==='Roissy_Dachfenster_Gaubenstein'){
    const vertices=o.geometry.attributes.position;
    const eaves=CORNICE+.18;
    for(let i=0;i<vertices.count;i++){
      const roof=eaves+(HALF_D-Math.abs(vertices.getZ(i)))*(15.4-eaves)/2.7;
      assert(vertices.getY(i)>=roof-.028,'dormer stone crosses into attic lining');
    }
  }
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
  for(const u of [-.24,.24])for(const v of [.24,.69])for(const angleOffset of [0,-.28,.28]){
    const destination=new T.Vector3(at+u*width,y+height*v,pane.userData.windowOpening.fixed);
    const origin=new T.Vector3(destination.x+angleOffset,destination.y,normal*8.1);
    ray.set(origin,destination.clone().sub(origin).normalize());
    const target=ray.intersectObject(pane)[0];
    assert(target,'roof glazing present');
    const hit=ray.intersectObjects(solids,false)[0];
    assert(!hit||hit.distance>target.distance-.012,
      JSON.stringify({at,y,normal,u,v,hit:hit?.object.name,point:hit?.point.toArray()}));
    clear++;
  }
}
console.log({skylightOpenings:panes.length,clearViews:clear});
