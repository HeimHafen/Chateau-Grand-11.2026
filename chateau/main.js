import {VESTIBULE_ENTRY, walkFieldOfView} from './vestibule-view.js?v=roissy374';
import {loadHallDecor} from './stair-portal.js?v=roissy377';
import {loadVestibuleColumn} from './vestibule-column.js?v=roissy375';
import {loadAtticSeating} from './attic-seating.js?v=roissy367';
import {CELLAR_SHAFT} from './level-stairs.js?v=roissy367';
import {CELLAR} from './cellar.js?v=roissy363';
import {ATTIC} from './attic.js?v=roissy367';
import {setupModelImport} from './model-import-v348.js?v=roissy363';
import * as THREE from '../vendor/three/build/three.module.js';
import {createExteriorMaterialLibrary,applyProceduralFinish} from '../wohnzimmer/exterior-materials-portikus-kalkstein.js?v=roissy363';
import {createRealisticExteriorGlass} from '../wohnzimmer/window-glass.js';
import {buildSky} from './daylight-v342.js?v=roissy363';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {loadGardenMaple} from '../wohnzimmer/garden-maple.js';
import {buildChateau} from './architecture.js?v=roissy377';
import {candidateStep,describePlace,EG_Y,OG_Y,EYE_Y} from './navigation.js?v=roissy367';
import {planSectionY} from './roissy-config.js?v=roissy363';

const canvas=document.getElementById('world');
const splash=document.getElementById('splash');
const start=document.getElementById('start');
const status=document.getElementById('status');
const hint=document.getElementById('controlHint');
const mobile=matchMedia('(pointer:coarse)').matches;
let renderer,scene,camera,orbit={theta:.43,phi:.52,d:100,target:new THREE.Vector3(0,10,0)},mode='orbit';
let player={x:0,y:EYE_Y,footY:0,z:31,yaw:0,pitch:0};
let walkTouch=null,lookTouch=null,forward=0,strafe=0,lookPointer=null;
let last=0;
let atmospheric, surfaceLighting;
let underground=false;
let floorChoice=null, activeWalkingFloor=null, historicalChateau=null, clippedMode=false;
let lastLocation='';
let sceneDoors=[],portalDoors=new Set(),shadowDirty=true,lastShadowRefresh=-Infinity;
let frameHandle=0,initialized=false,contextLost=false,qualityScale=1,qualityMode='auto',frameSamples=[],lastQualityChange=0;
const quality=document.getElementById('quality');
const qualityStatus=document.getElementById('qualityStatus');
function markShadowDirty(){shadowDirty=true;}
function pixelRatio(){return Math.max(.6,Math.min(devicePixelRatio,(mobile?1.35:1.85))*qualityScale);}
function setQuality(mode){qualityMode=mode;qualityScale=mode==='detail'?1:mode==='smooth'?.70:1;frameSamples=[];lastQualityChange=performance.now();if(renderer)resize();}
function monitorQuality(ms,elapsed){
  if(qualityMode!=='auto'||elapsed<5||elapsed>250||document.hidden)return;
  frameSamples.push(elapsed);if(frameSamples.length<75)return;
  const sorted=frameSamples.sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)];frameSamples=[];
  if(ms-lastQualityChange<4500)return;
  let next=qualityScale;if(median>29)next=Math.max(.60,qualityScale-.10);else if(median<18)next=Math.min(1,qualityScale+.05);
  if(Math.abs(next-qualityScale)>.005){qualityScale=next;lastQualityChange=ms;resize();}
}
function scheduleFrame(){if(initialized&&renderer&&historicalChateau&&atmospheric&&!frameHandle&&!contextLost&&!document.hidden)frameHandle=requestAnimationFrame(frame);}
quality.addEventListener('change',()=>setQuality(quality.value));
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frameHandle);frameHandle=0;clearWalkInput();document.getElementById('renderNotice').hidden=false;});
canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;document.getElementById('renderNotice').hidden=true;last=0;markShadowDirty();scheduleFrame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameHandle);frameHandle=0;}else{last=0;frameSamples=[];markShadowDirty();scheduleFrame();}});

async function run(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.07;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;
  scene=new THREE.Scene();scene.background=new THREE.Color(0xaac8e4);scene.fog=new THREE.FogExp2(0xc6d6df,.0009);
  camera=new THREE.PerspectiveCamera(61,1,.24,850);camera.rotation.order='YXZ';
  atmospheric=buildSky(THREE,scene,camera);
  const skyFill=new THREE.HemisphereLight(0xe6eeff,0xcbb895,1.16);
  // Daylight-focused reference look; no camera-attached light.
  const ambient=new THREE.AmbientLight(0xfff4e5,.23);
  const sun=new THREE.DirectionalLight(0xffeed8,2.95);
  sun.position.set(78,88,132);sun.castShadow=true;
  const s=mobile?2048:4096;sun.shadow.mapSize.set(s,s);
  Object.assign(sun.shadow.camera,{left:-36,right:36,top:36,bottom:-36,near:115,far:245});
  sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00035;sun.shadow.normalBias=.023;
  surfaceLighting=new THREE.Group();
  surfaceLighting.add(sun,skyFill,ambient);
  scene.add(surfaceLighting);

  // Register the texture load barrier before starting any asynchronous asset loads.
  const missingAssets=[];let resolveAssets;
  const [vestibuleColumn,hallDecor]=await Promise.all([
    loadVestibuleColumn(THREE),
    loadHallDecor(THREE,(url,error)=>{
      missingAssets.push(url);
      console.warn('Roissy Asset nicht geladen:',url,error);
    })
  ]);
  const assetsReady=new Promise(resolve=>{resolveAssets=resolve;});
  THREE.DefaultLoadingManager.onLoad=()=>resolveAssets();
  THREE.DefaultLoadingManager.onError=url=>{missingAssets.push(url);console.warn('Roissy Asset nicht geladen:',url);};
  const mats=createExteriorMaterialLibrary(THREE);
  const glass=createRealisticExteriorGlass(THREE,renderer);
  buildLandscape(mats);
  const chateau=buildChateau(THREE,scene,null,mats,glass,vestibuleColumn,hallDecor);
  historicalChateau=chateau;
  loadAtticSeating(THREE,chateau.attic,markShadowDirty);
  chateau.cellar.root.visible=true;
  sceneDoors=[...chateau.entranceDoors,...chateau.interiorDoors];portalDoors=new Set(chateau.entranceDoors);
  // A low-intensity filtered environment provides believable reflection on oak,
  // honed stone and metal without adding a screen-space reflection pass.
  new THREE.TextureLoader().load('./assets/glass/v342_daylight_env.jpg',t=>{t.colorSpace=THREE.SRGBColorSpace;t.mapping=THREE.EquirectangularReflectionMapping;scene.environment=t;scene.environmentIntensity=underground?.15:.47;},undefined,()=>{});
  // Physical fixture positions and short-range warm pools of light. No extra shadow passes.
  const fixtures=[...chateau.validations.interiorFinish.referenceFixtures.lights,
    ...chateau.validations.interiorFinish.furnishings.lights,...chateau.attic.lights,
    chateau.vestibuleLight,...chateau.vestibuleDaylight];
  for(const f of fixtures){
    const lamp=f.target
      ?new THREE.SpotLight(f.color,f.intensity,f.distance,f.angle,f.penumbra,2)
      :new THREE.PointLight(f.color,f.intensity,f.distance,2);
    lamp.name=f.name+'_Licht';
    lamp.position.set(...f.position);
    if(f.target){
      lamp.target.position.set(...f.target);
      surfaceLighting.add(lamp.target);
    }
    surfaceLighting.add(lamp);
  }
  // Reuse the locally packaged maple model; keep trees outside the palace and
  // all walkable paths. Shared geometry and materials via instancing.
  loadGardenMaple(THREE,new GLTFLoader()).then(tree=>{
    tree.updateMatrixWorld(true);const instances=[];
    const sites=[[-31,-25],[-19,-37],[-3,-45],[13,-40],[29,-32],[-42,-10],[43,-13],[-38,22],[39,22],[-24,34],[25,36]];
    tree.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);const inst=new THREE.InstancedMesh(g,o.material,sites.length);inst.customDepthMaterial=o.customDepthMaterial;inst.castShadow=false;inst.receiveShadow=true;const dummy=new THREE.Object3D();for(let i=0;i<sites.length;i++){const [x,z]=sites[i];dummy.position.set(x,0,z);dummy.rotation.y=i*2.39;dummy.scale.setScalar(.57+(i%4)*.11);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);}inst.instanceMatrix.needsUpdate=true;inst.computeBoundingSphere();scene.add(inst);instances.push(inst);});
  }).catch(e=>console.warn('Parkbaum optional:',e));
  for(const floor of ['eg','og'])chateau.historicalLayers[floor].traverse(obj=>{
    if(obj.userData.floorPlanLabel)obj.visible=false;
  });
  // Clear, low-iron glazing keeps the whole facade readable and truly transparent.
  glass.side=THREE.DoubleSide;glass.transparent=true;glass.opacity=.12;glass.depthWrite=false;
  glass.needsUpdate=true;
  // Expose the actual reconstruction and construction diagnostics for testing.
  window.__CHATEAU_MAXGAME={engine:'Three.js',scene,version:'3.77',dimensions:chateau.palaceDimensions,instances:chateau.instancedElements,drawcalls:chateau.instancedDrawcalls,automaticDoors:chateau.entranceDoors.length+chateau.interiorDoors.length,constructionQA:chateau.validations};
  document.getElementById('version').textContent='ROISSY · V3.77';
  window.__CHATEAU_MAXGAME.importedFurniture=setupModelImport(THREE,chateau,scene,renderer);
  resize();view('angle');
  status.textContent='Architektur aufgebaut. Materialien und Texturen werden geladen …';
  let timeoutId;const loaded=await Promise.race([assetsReady.then(()=>true),new Promise(resolve=>{timeoutId=setTimeout(()=>resolve(false),15000);})]);clearTimeout(timeoutId);
  markShadowDirty();
  start.disabled=false;start.textContent='Château erkunden';
  status.textContent=missingAssets.length?`${missingAssets.length} Ressource(n) nicht geladen. Rundgang mit verfügbaren Materialien möglich.`:loaded?'54 × 28,85 m · Keller, EG, 1. OG und Mansarde · Rundgang bereit.':'Rundgang bereit · einige Texturen laden möglicherweise noch.';
  THREE.DefaultLoadingManager.onLoad=()=>{markShadowDirty();};
  window.__CHATEAU_MAXGAME.missingAssets=missingAssets;
  window.__CHATEAU_MAXGAME.renderDiagnostics=()=>({pixelRatio:renderer.getPixelRatio(),qualityMode,qualityScale,reflectionMode:'physical-material-only',cameraNear:camera.near,cameraFar:camera.far,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,textures:renderer.info.memory.textures});
  start.addEventListener('click',()=>{splash.hidden=true;renderer.shadowMap.needsUpdate=true;setWalk();}, {once:true});
  initialized=true;scheduleFrame();
}
function buildLandscape(mats){
  const loader=new THREE.TextureLoader();
  const name=['albedo','normal','roughness'];
  const texture=name.map(n=>{
    const t=loader.load(`./assets/materials/grass_${n}.jpg`);
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(128,128);t.anisotropy=8;
    if(n==='albedo')t.colorSpace=THREE.SRGBColorSpace;
    return t;
  });
  const grass=new THREE.MeshStandardMaterial({name:'MaxGame_PBR_Gras',map:texture[0],normalMap:texture[1],roughnessMap:texture[2],roughness:.97,color:0xc7d6b6,normalScale:new THREE.Vector2(.15,.15)});
  applyProceduralFinish(THREE,grass,'grassBreakup');
  const [a,b,c,d]=CELLAR_SHAFT;
  for(const [x0,x1,z0,z1] of [[-600,a,-600,600],[b,600,-600,600],[a,b,-600,c],[a,b,d,600]]){
    const geo=new THREE.PlaneGeometry(x1-x0,z1-z0);
    geo.rotateX(-Math.PI/2);
    geo.translate((x0+x1)/2,-.08,(z0+z1)/2);
    const pos=geo.attributes.position,uv=geo.attributes.uv;
    for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+600)/1200,(600-pos.getZ(i))/1200);
    const floor=new THREE.Mesh(geo,grass);
    floor.receiveShadow=true;scene.add(floor);
  }
  const pavement=new THREE.Mesh(new THREE.BoxGeometry(9,.08,105),mats.porticoPaving);
  pavement.position.set(0,-.02,70);pavement.receiveShadow=true;scene.add(pavement);
  // One continuous grass surface; no redundant near-parallel lawn overlays.
}
function setUnderground(active){
  if(underground===active)return;
  underground=active;
  historicalChateau.cellar.lighting.visible=active;
  surfaceLighting.visible=!active;
  scene.environmentIntensity=active?.15:.47;
  markShadowDirty();
}
function setCutaway(floor){
  // Clipping takes away the upper shell for a real top-down view of constructed rooms.
  clippedMode=!!floor;
  renderer.clippingPlanes=floor?[new THREE.Plane(new THREE.Vector3(0,-1,0),planSectionY(floor))]:[];
  renderer.shadowMap.enabled=!floor;
  if(historicalChateau){
    for(const key of ['eg','og'])historicalChateau.historicalLayers[key].traverse(obj=>{
      if(obj.userData.floorPlanLabel)obj.visible=key===floor;
    });
  }
  const info=document.getElementById('floorInfo');
  if(floor){
    const rs=historicalChateau?.historicalFloors[floor]||[];
    info.hidden=false;
    info.textContent=(floor==='eg'?'ERDGESCHOSS':'1. OBERGESCHOSS')+' · Château de Roissy, 1776 · '+rs.length+' historische Raumzonen';
  } else info.hidden=true;
  document.getElementById('walk').textContent=floor?(floor==='eg'?'EG betreten':'1. OG betreten'):'Erkunden';
  markShadowDirty();
}
function view(which){
  clearWalkInput();
  mode='orbit';activeWalkingFloor=null;
  setUnderground(false);
  document.body.classList.remove('walking','attic-walk','vestibule-walk','antichambre-walk','escalier-walk');
  floorChoice=which==='eg'||which==='og'?which:null;
  const views={
    front:{theta:0,phi:.06,d:mobile?104:74,target:[0,9.0,1]},
    park:{theta:Math.PI,phi:.28,d:mobile?104:74,target:[0,8.0,-1]},
    west:{theta:-Math.PI/2,phi:.13,d:mobile?76:58,target:[0,8.6,2]},
    east:{theta:Math.PI/2,phi:.13,d:mobile?76:58,target:[0,8.6,2]},
    angle:{theta:.46,phi:.30,d:mobile?105:77,target:[0,8.9,0]},
    above:{theta:.45,phi:1.16,d:89,target:[0,8,0]},
    entrance:{theta:0,phi:.08,d:39,target:[0,5,12]},
    stairSide:{theta:1.10,phi:.22,d:35,target:[0,3,17]},
    eg:{theta:.14,phi:1.38,d:53,target:[0,3.3,0]},
    og:{theta:.14,phi:1.38,d:53,target:[0,9.3,0]}
  };
  const selected=views[which]||views.angle;
  Object.assign(orbit,{theta:selected.theta,phi:selected.phi,d:selected.d});
  orbit.target.set(...selected.target);
  setCutaway(floorChoice);
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===which));
  document.getElementById('walk').classList.remove('selected');
  hint.textContent=floorChoice?'Historischer Grundriss: drehen / zoomen · „'+(floorChoice==='eg'?'EG':'1. OG')+' betreten“ als Schnellstart':'Ansicht: ziehen zum Drehen · mit zwei Fingern zoomen';
  const locationPanel=document.getElementById('locationStatus');
  if(locationPanel)locationPanel.hidden=true;
}
function setWalk(entry=null){
  clearWalkInput();
  mode='walk';activeWalkingFloor=floorChoice;
  document.body.classList.add('walking');
  setCutaway(null); // Floor plates/ceilings restored for physical exploration.
  player.access=undefined;
  let entryYaw=0;
  if(typeof entry==='string'){
    const stairEntry=historicalChateau.validations.interiorFinish.stairPortal
      ?[-15.25,-8.90,EG_Y,-2.70]:[-15.65,9.15,EG_Y,0];
    const starts={hall:[VESTIBULE_ENTRY.x,VESTIBULE_ENTRY.z,EG_Y,0],antichambre:[-12.32,-8.90,EG_Y,-Math.PI/2],salon:[0,-3.65,EG_Y,0],stair:stairEntry,gallery:[0,4.5,OG_Y,0],attic:[ATTIC.entry.x,ATTIC.entry.z,ATTIC.floor,ATTIC.entry.yaw],cellar:[CELLAR.entry.x,CELLAR.entry.z,CELLAR.floor,CELLAR.entry.yaw]};
    const [x,z,foot,yaw]=starts[entry]||starts.hall;
    Object.assign(player,{x,z,footY:foot});
    entryYaw=yaw;
    activeWalkingFloor=foot===CELLAR.floor?'cellar':foot===ATTIC.floor?'attic':foot===OG_Y?'og':'eg';
  }else if(activeWalkingFloor){
    // Optional shortcut for testing the two plans; normal exploration never
    // teleports: approach stairs and walk through the automatic entrance doors.
    player.x=0;player.footY=(activeWalkingFloor==='eg'?EG_Y:OG_Y);
    player.z=7.0;
  }else{
    player.x=0;player.footY=0;player.z=31;
  }
  setUnderground(player.footY===CELLAR.floor);
  if(underground)historicalChateau.cellar.updateLights(player.x,player.z);
  player.y=player.footY+EYE_Y;
  player.yaw=entryYaw;player.pitch=entry==='stair' ? .16 : entry==='hall' ? VESTIBULE_ENTRY.pitch : .025;
  markShadowDirty();
  forward=strafe=0;
  document.getElementById('walk').textContent='Rundgang neu';
  document.getElementById('walk').classList.add('selected');
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('selected'));
  hint.textContent=activeWalkingFloor
    ? 'Links ziehen: gehen · rechts umsehen · Türen öffnen automatisch · zur Treppe laufen für Geschosswechsel'
    : 'Links ziehen: zur Treppe gehen · Eichentüren öffnen automatisch · rechts umsehen';
  showWalkLocation();
}
function showWalkLocation(){
  const ui=document.getElementById('locationStatus');
  if(!ui)return;
  if(mode!=='walk'){ui.hidden=true;return;}
  document.body.classList.toggle('attic-walk',player.footY===ATTIC.floor||player.access==='attic');
  const label=player.access==='cellar'?'Kellertreppe · Kalkstein':player.access==='attic'?
    'Mansardentreppe · Eiche':describePlace(player.x,player.z,player.footY,historicalChateau);
  const vestibule=player.footY===EG_Y&&label.endsWith('· Vestibule');
  document.body.classList.toggle('vestibule-walk',vestibule);
  const antichambre=player.footY===EG_Y&&label.endsWith('· Antichambre');
  document.body.classList.toggle('antichambre-walk',antichambre);
  const escalier=label.endsWith('· Grand escalier');
  document.body.classList.toggle('escalier-walk',escalier);
  if(label!==lastLocation){lastLocation=label;ui.textContent=label;hint.textContent=(player.footY===ATTIC.floor||vestibule||antichambre||escalier)?'Links gehen · rechts umsehen':underground?'Links gehen · rechts umsehen · Geschosswechsel über „Innenräume“':player.footY>=EG_Y-.14?'Links ziehen: gehen · rechts umsehen · Türen öffnen automatisch':'Links ziehen: gehen · rechts umsehen · Treppen und Türen begehbar';}
  ui.hidden=false;
}
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>view(b.dataset.view));
document.getElementById('walk').addEventListener('click',()=>setWalk());
const jump=document.getElementById('interiorJump');jump.addEventListener('change',()=>{if(jump.value){setWalk(jump.value);jump.value='';}});
document.getElementById('reset').addEventListener('click',()=>view('angle'));
const activePointers=new Map();
canvas.addEventListener('pointerdown',e=>{
  canvas.setPointerCapture(e.pointerId);
  const p={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};
  activePointers.set(e.pointerId,p);
  if(mode==='walk'&&e.pointerType==='touch'){
    if(e.clientX<innerWidth*.5&&!walkTouch){walkTouch=e.pointerId;const stick=document.getElementById('walkStick');if(stick)stick.hidden=false;}
    else if(!lookTouch)lookTouch=e.pointerId;
  }
});
canvas.addEventListener('pointermove',e=>{
  const p=activePointers.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(mode==='orbit'){
    if(activePointers.size===1){orbit.theta-=dx*.0065;orbit.phi=THREE.MathUtils.clamp(orbit.phi+dy*.0055,-.09,1.34);}
    else if(activePointers.size===2){const pair=[...activePointers.values()];const dist=Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y);if(window.__pinchDist){orbit.d=THREE.MathUtils.clamp(orbit.d*window.__pinchDist/Math.max(1,dist),30,650);}window.__pinchDist=dist;}
  }else{
    if(e.pointerId===walkTouch){const vx=e.clientX-p.startX,vy=e.clientY-p.startY;const len=Math.hypot(vx,vy),strength=THREE.MathUtils.clamp((len-6)/49,0,1);strafe=len?vx/len*strength:0;forward=len?-vy/len*strength:0;const knob=document.getElementById('stickKnob');if(knob)knob.style.transform=`translate(${strafe*26}px, ${-forward*26}px)`;}
    else if(e.pointerId===lookTouch||e.pointerType==='mouse'){player.yaw-=dx*.005;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*.004,-1.25,1.25);}
  }
});
function release(e){activePointers.delete(e.pointerId);window.__pinchDist=0;if(e.pointerId===walkTouch){walkTouch=null;forward=strafe=0;const stick=document.getElementById('walkStick');if(stick)stick.hidden=true;const knob=document.getElementById('stickKnob');if(knob)knob.style.transform='translate(0,0)';}if(e.pointerId===lookTouch)lookTouch=null;}
for(const t of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(t,release);
canvas.addEventListener('wheel',e=>{if(mode==='orbit'){orbit.d=THREE.MathUtils.clamp(orbit.d*Math.exp(e.deltaY*.001),30,650);e.preventDefault();}},{passive:false});
const keys=new Set();addEventListener('keydown',e=>{if(mode!=='walk'||/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.target?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){keys.add(key);e.preventDefault();}});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function clearWalkInput(){
  forward=strafe=0;walkTouch=lookTouch=lookPointer=null;activePointers.clear();keys.clear();window.__pinchDist=0;
  const stick=document.getElementById('walkStick'),knob=document.getElementById('stickKnob');if(stick)stick.hidden=true;if(knob)knob.style.transform='translate(0,0)';
}
addEventListener('blur',clearWalkInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearWalkInput();});
function currentFieldOfView() {
  return walkFieldOfView(mobile && camera.aspect < 1, camera.aspect, mode === 'walk' ? player : null);
}
function resize() {
  const w=innerWidth,h=innerHeight;
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.fov=currentFieldOfView();
  camera.updateProjectionMatrix();
  qualityStatus.textContent=Math.round(qualityScale*100)+' % Renderauflösung';
}
addEventListener('resize',()=>{if(renderer)resize();});
function frame(ms){
  frameHandle=0;if(contextLost||document.hidden)return;
  const elapsed=last?ms-last:16.67;const dt=Math.max(0,Math.min(.050,elapsed/1000));last=ms;monitorQuality(ms,elapsed);
  const near=mode==='orbit'?Math.max(.5,orbit.d*.014):.16;
  const far=mode==='orbit'?850:240;
  if(Math.abs(camera.near-near)>.001||camera.far!==far){camera.near=near;camera.far=far;camera.updateProjectionMatrix();}
  if(mode==='orbit'){
    const p=orbit.phi,t=orbit.theta;
    const cp=Math.cos(p);camera.position.set(orbit.target.x+Math.sin(t)*orbit.d*cp,orbit.target.y+Math.sin(p)*orbit.d,orbit.target.z+Math.cos(t)*orbit.d*cp);
    camera.lookAt(orbit.target);
    for(const d of sceneDoors)if(d.door.update(dt,1e4,1e4,-1e4)&&portalDoors.has(d))markShadowDirty();
  }else{
    let f=forward+(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    let st=strafe+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
    let mag=Math.max(1,Math.hypot(f,st));f/=mag;st/=mag;
    const speed=dt*(activeWalkingFloor?2.75:4.2);
    const dx=(-Math.sin(player.yaw)*f+Math.cos(player.yaw)*st)*speed;
    const dz=(-Math.cos(player.yaw)*f-Math.sin(player.yaw)*st)*speed;
    // Real staircase heights (7 outside steps + 36 risers in two U-shaped flights),
    // real masonry collision and genuine oak doors. Never teleport on a threshold.
    const doors=sceneDoors;
    for(const d of doors)if(d.door.update(dt,player.x,player.z,player.footY)&&portalDoors.has(d))markShadowDirty();
    // Bound each collision query to a short step, even during a slow frame.
    const substeps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.055));
    for(let i=0;i<substeps;i++){
      let candidate=candidateStep(player,player.x+dx/substeps,player.z,historicalChateau,doors);
      if(candidate){player.x=candidate.x;player.footY=candidate.footY;player.access=candidate.access;}
      candidate=candidateStep(player,player.x,player.z+dz/substeps,historicalChateau,doors);
      if(candidate){player.z=candidate.z;player.footY=candidate.footY;player.access=candidate.access;}
    }
    // Keep the eye-height human-sized; damp out the discrete stair risers.
    player.y=THREE.MathUtils.damp(player.y,player.footY+EYE_Y,11,dt);
    player.x=THREE.MathUtils.clamp(player.x,-85,85);
    player.z=THREE.MathUtils.clamp(player.z,-85,125);
    const below=player.footY<-.90;
    if(below&&(dx||dz||!underground))historicalChateau.cellar.updateLights(player.x,player.z);
    setUnderground(below);
    activeWalkingFloor=player.access|| (underground?'cellar':player.footY===ATTIC.floor?'attic':player.footY>=(EG_Y+OG_Y)/2+.15?'og':player.footY>=EG_Y-.14?'eg':null);
    showWalkLocation();
    camera.position.set(player.x,player.y,player.z);
    camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  }
  const fov=currentFieldOfView();
  if(Math.abs(camera.fov-fov)>.01){
    camera.fov=fov;
    camera.updateProjectionMatrix();
  }
  atmospheric.update();
  if(shadowDirty&&!clippedMode&&ms-lastShadowRefresh>(mobile?140:85)){renderer.shadowMap.needsUpdate=true;shadowDirty=false;lastShadowRefresh=ms;}
  renderer.render(scene,camera);scheduleFrame();
}
run().catch(error=>{console.error(error);status.textContent='3D-Startfehler: '+(error.message||'Unbekannter Fehler');start.disabled=true;start.textContent='3D konnte nicht starten';});
