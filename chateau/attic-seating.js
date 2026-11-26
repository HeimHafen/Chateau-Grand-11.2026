import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {fitModel} from './model-import-v348.js?v=roissy360';
import {ATTIC} from './attic.js?v=roissy360';

const placements=[
  {file:'polstersessel',name:'Antiker Polstersessel',x:20.20,z:2.45,yaw:-1.28,max:[1.04,1.10,.90]},
  {file:'beistelltisch',name:'Kleiner antiker Beistelltisch',x:19.92,z:1.32,yaw:.12,max:[.66,.64,.66]}
];

export function placeAtticFurniture(THREE,parent,source,spec){
  const {wrapper}=fitModel(THREE,source,spec.max);
  const mount=new THREE.Group();
  mount.name=spec.name;
  mount.position.set(spec.x,ATTIC.floor,spec.z);
  mount.rotation.y=spec.yaw;
  mount.add(wrapper);
  mount.traverse(object=>{
    if(object.isMesh){
      object.castShadow=true;
      object.receiveShadow=true;
    }
  });
  parent.add(mount);
  mount.updateWorldMatrix(true,true);
  const {min,max}=new THREE.Box3().setFromObject(mount,true);
  return {x0:min.x,x1:max.x,z0:min.z,z1:max.z};
}

export async function loadAtticSeating(THREE,attic,refreshShadows){
  const loader=new GLTFLoader(new THREE.LoadingManager());
  for(const spec of placements){
    try{
      const url=new URL('../assets/models/mansarde/'+spec.file+'.glb',import.meta.url);
      const {scene}=await loader.loadAsync(url.href);
      attic.furnitureBounds.push(placeAtticFurniture(THREE,attic.group,scene,spec));
      refreshShadows();
    }catch(error){
      console.warn('Mansardenmodell konnte nicht geladen werden:',spec.name,error);
    }
  }
}
