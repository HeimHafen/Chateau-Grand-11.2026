import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {buildChateau} from '../chateau/architecture.js';

const stone=new THREE.MeshStandardMaterial();
const mats=Object.fromEntries([
  'facadeWall','dressedStone','trim','windowStone','shade','paintedSash',
  'roof','porticoPaving','columnFinish','brass'
].map(name=>[name,stone]));
const scene=new THREE.Scene();
const chateau=buildChateau(THREE,scene,null,mats,new THREE.MeshStandardMaterial({transparent:true}));
const roofCoordinates=new Map();
let roofJoins=0,flues=0,paintedProfiles=0,woodFloors=0;
scene.traverse(object=>{
  if(!object.isMesh)return;
  if(object.name==='Schiefer_Mansardfläche'){
    const {position,normal,uv}=object.geometry.attributes;
    for(let i=0;i<position.count;i++){
      assert(normal.getY(i)>0,'roof faces upwards');
      const key=[position.getX(i),position.getY(i),position.getZ(i)].join(',');
      const pair=[uv.getX(i),uv.getY(i)];
      const previous=roofCoordinates.get(key);
      if(previous){
        assert(Math.hypot(pair[0]-previous[0],pair[1]-previous[1])<1e-5,'slate aligns across slope polygons');
        roofJoins++;
      }
      roofCoordinates.set(key,pair);
    }
  }
  if(object.name==='Roissy_Offener_Kaminzug'){
    assert(object.geometry.parameters.openEnded);
    flues++;
  }
  if(object.material?.name==='Roissy_Sockel_Profilabschluss'){
    assert(object.material.isMeshPhysicalMaterial && object.material.clearcoat>0);
    paintedProfiles++;
  }
  if(object.name.startsWith('Roissy_Interiorboden_')&&/Parquet|Dielen/.test(object.material?.name)){
    assert.equal(object.material.transparent,false);
    assert.equal(object.material.depthWrite,true);
    assert(object.material.clearcoat>=.18-1e-9);
    woodFloors++;
  }
});
assert(roofJoins>24,'joined roof points sampled');
assert.equal(flues,12);
assert(paintedProfiles>=2,'profile coating present on both floors');
assert(woodFloors>=6,'satin wood finishes present');
assert(chateau.staticConstructionBoxes.get('shell:stone').filter(box=>box[3]===.15&&box[4]===.095).length>100,'dentils across exterior');
console.log({roofJoins,flues,paintedProfiles,woodFloors});
