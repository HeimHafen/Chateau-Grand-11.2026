import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
// Real, local self-contained glTF binary only. No remote runtime URLs or silent replacements.
export const slots={sofa:{names:['Salonbank_Louis_XV'],size:[2.065,1.36,.75],limit:750000},table:{names:['Beistelltisch_West','Beistelltisch_Ost'],size:[.546,.76,.546],limit:100000}};
export function inspectGLB(buffer){
 const v=new DataView(buffer);if(v.byteLength<20||v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==v.byteLength)throw Error('Keine gültige GLB-2-Datei.');
 const n=v.getUint32(12,true);if(v.getUint32(16,true)!==0x4e4f534a||n>v.byteLength-20)throw Error('GLB-JSON fehlt.');
 const j=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,n)));
 for(const a of [...(j.buffers||[]),...(j.images||[])])if(a.uri&&!a.uri.startsWith('data:'))throw Error('GLB muss alle Texturen und Daten enthalten.');
 const bad=(j.extensionsRequired||[]).filter(x=>['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'].includes(x));if(bad.length)throw Error('Bitte unkomprimierte GLB exportieren: '+bad.join(', '));
 return j;
}
export function fitModel(T,source,maxSize){
 const wrapper=new T.Group();wrapper.add(source);wrapper.updateMatrixWorld(true);let box=new T.Box3().setFromObject(wrapper,true),size=box.getSize(new T.Vector3());
 if(![size.x,size.y,size.z].every(x=>Number.isFinite(x)&&x>1e-5))throw Error('Ungültige Modellabmessungen.');
 // The provided model must be Y-up, with its front facing +Z. Keep all proportions.
 const scale=Math.min(maxSize[0]/size.x,maxSize[1]/size.y,maxSize[2]/size.z);wrapper.scale.setScalar(scale);wrapper.updateMatrixWorld(true);box=new T.Box3().setFromObject(wrapper,true);const c=box.getCenter(new T.Vector3());wrapper.position.set(-c.x,-box.min.y,-c.z);wrapper.updateMatrixWorld(true);return {wrapper,height:size.y*scale,scale};
}
export async function replaceSeating(T,root,slot,buffer){
 const spec=slots[slot];if(!spec)throw Error('Unbekannter Möbelplatz.');inspectGLB(buffer);
 const gltf=await new GLTFLoader().parseAsync(buffer,'');let triangles=0;gltf.scene.traverse(o=>{if(o.isMesh){const g=o.geometry;triangles+=(g.index?.count||g.attributes.position?.count||0)/3;}});
 if(!triangles||triangles>spec.limit)throw Error('Modell hat '+Math.round(triangles)+' Dreiecke; Grenzwert '+spec.limit+'. Bitte optimieren.');
 const targets=spec.names.map(n=>root.getObjectByName('Roissy_Mobiliar_'+n));if(targets.some(x=>!x))throw Error('Möbelposition nicht gefunden.');
 const prepared=targets.map(()=>fitModel(T,gltf.scene.clone(true),spec.size));
 targets.forEach((target,i)=>{const old=target.getObjectByName('OriginalGLB_'+slot);if(old)target.remove(old);for(const o of target.children)o.visible=false;const {wrapper,height}=prepared[i];wrapper.name='OriginalGLB_'+slot;wrapper.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});target.add(wrapper);
  // Lamp remains independent of table, moved onto its new top, not scaled.
  if(slot==='table'){const lamp=root.getObjectByName(target.name+'_Lampe');if(lamp){lamp.userData.originalY??=lamp.position.y;lamp.position.y=lamp.userData.originalY+height-.76;}}
 });return {triangles,instances:targets.length,height:prepared[0].height};
}
export function setupModelImport(T,chateau,scene,renderer){
 const panel=document.getElementById('modelImport'),status=document.getElementById('importStatus');panel.hidden=false;const loaded={};let busy=false;
 async function apply(slot,buffer){const result=await replaceSeating(T,chateau.front,slot,buffer);loaded[slot]=result;
  if(slot==='table')for(const f of chateau.validations.interiorFinish.furnishings.lights){const light=scene.getObjectByName(f.name+'_Licht');if(light){light.userData.baseY??=light.position.y;light.position.y=light.userData.baseY+result.height-.76;}}
  renderer.shadowMap.needsUpdate=true;status.textContent=Object.entries(loaded).map(([k,v])=>(k==='sofa'?'Sofa':'Beistelltische')+': Originaldatei geladen ('+Math.round(v.triangles).toLocaleString('de-DE')+' Dreiecke)').join(' · ');return result;}
 for(const [slot,id] of [['sofa','sofaFile'],['table','tableFile']]){const el=document.getElementById(id);el.addEventListener('change',async()=>{const f=el.files[0];if(!f||busy)return;busy=true;try{if(f.size>60*1024*1024)throw Error('Datei größer als 60 MB. Bitte optimieren.');await apply(slot,await f.arrayBuffer());}catch(e){status.textContent='Import nicht durchgeführt: '+e.message;}finally{busy=false;el.value='';}});}
 // Only try packaged files when requested. Without originals, normal V3.47 furniture remains.
 if(new URLSearchParams(location.search).get('models')==='1'){(async()=>{busy=true;for(const slot of Object.keys(slots)){try{const r=await fetch('./assets/models/seating/'+slot+'.glb');if(!r.ok)throw Error('Datei fehlt');const bytes=await r.arrayBuffer();if(bytes.byteLength>60*1024*1024)throw Error('Datei zu groß');await apply(slot,bytes);}catch(e){status.textContent+=(status.textContent?' · ':'')+slot+': '+e.message;}}busy=false;})();}
 return loaded;
}
