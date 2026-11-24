import * as THREE from '../vendor/three/build/three.module.js';
import {createExteriorMaterialLibrary,applyProceduralFinish} from '../wohnzimmer/exterior-materials-portikus-kalkstein.js';
import {createRealisticExteriorGlass} from '../wohnzimmer/window-glass.js';
import {buildSky} from '../wohnzimmer/sky-atmosphere.js';
import {buildChateau} from './architecture.js?v=roissy324';
import {candidateStep,describePlace,EG_Y,OG_Y,EYE_Y} from './navigation.js?v=roissy324';

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
let atmospheric;
let floorChoice=null, activeWalkingFloor=null, historicalChateau=null, clippedMode=false;
let lastLocation='';
async function run(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.96;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8293a4);scene.fog=new THREE.FogExp2(0x8293a4,.00048);
  camera=new THREE.PerspectiveCamera(61,1,.24,850);camera.rotation.order='YXZ';
  atmospheric=buildSky(THREE,scene,camera);
  scene.add(new THREE.HemisphereLight(0xcce1f1,0x9f8c77,1.20));
  // V3.24 uses only global daylight/ambient illumination. No added interior
  // point lights are created so the material judgement is not falsified by helper lighting.
  scene.add(new THREE.AmbientLight(0xffe9d0,.20));
  const sun=new THREE.DirectionalLight(0xffe8ca,2.05);
  sun.position.set(-135,210,168);sun.castShadow=true;
  const s=2048;sun.shadow.mapSize.set(s,s);
  Object.assign(sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:180,far:390});
  sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00035;sun.shadow.normalBias=.055;
  scene.add(sun);
  const mats=createExteriorMaterialLibrary(THREE);
  const glass=createRealisticExteriorGlass(THREE,renderer);
  buildLandscape(mats);
  const chateau=buildChateau(THREE,scene,null,mats,glass);
  historicalChateau=chateau;
  for(const floor of ['eg','og'])chateau.historicalLayers[floor].traverse(obj=>{
    if(obj.userData.floorPlanLabel)obj.visible=false;
  });
  // Clear, low-iron glazing keeps the whole facade readable and truly transparent.
  glass.side=THREE.DoubleSide;glass.transparent=true;glass.opacity=.12;glass.depthWrite=false;
  glass.needsUpdate=true;
  // Expose the actual reconstruction and construction diagnostics for testing.
  window.__CHATEAU_MAXGAME={engine:'Three.js',scene,version:'3.24',dimensions:chateau.palaceDimensions,instances:chateau.instancedElements,drawcalls:chateau.instancedDrawcalls,automaticDoors:chateau.entranceDoors.length+chateau.interiorDoors.length,constructionQA:chateau.validations};
  document.getElementById('version').textContent='ROISSY · V3.24';
  start.disabled=false;start.textContent='Château erkunden';
  status.textContent='54 × 28,85 Meter (Rekonstruktionsmaß) · EG und 1. OG nach dem Roissy-Plan · Eingang und Haupttreppe begehbar.';
  resize();view('angle');
  start.addEventListener('click',()=>{splash.hidden=true;renderer.shadowMap.needsUpdate=true;setWalk();}, {once:true});
  requestAnimationFrame(frame);
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
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),grass);floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
  const paving=new THREE.MeshStandardMaterial({color:0xe0d2c0,roughness:.95});
  const pavement=new THREE.Mesh(new THREE.BoxGeometry(9,.08,105),mats.porticoPaving);
  pavement.position.set(0,-.02,70);pavement.receiveShadow=true;scene.add(pavement);
  // One continuous grass surface; no redundant near-parallel lawn overlays.
}
function setCutaway(floor){
  // Clipping takes away the upper shell for a real top-down view of constructed rooms.
  clippedMode=!!floor;
  renderer.clippingPlanes=floor?[new THREE.Plane(new THREE.Vector3(0,-1,0),floor==='eg'?6.69:12.17)]:[];
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
  renderer.shadowMap.needsUpdate=true;
}
function view(which){
  mode='orbit';activeWalkingFloor=null;
  document.body.classList.remove('walking');
  floorChoice=which==='eg'||which==='og'?which:null;
  const views={
    front:{theta:0,phi:.06,d:92,target:[0,9.0,1]},
    park:{theta:Math.PI,phi:.06,d:92,target:[0,9.0,0]},
    angle:{theta:.46,phi:.38,d:99,target:[0,10.5,0]},
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
  mode='walk';activeWalkingFloor=floorChoice;
  document.body.classList.add('walking');
  setCutaway(null); // Floor plates/ceilings restored for physical exploration.
  if(typeof entry==='string'){
    const starts={hall:[0,9.25,EG_Y,0],salon:[0,-3.65,EG_Y,0],stair:[-11.37,9.30,EG_Y,0],gallery:[0,4.5,OG_Y,0]};
    const [x,z,foot,yaw]=starts[entry]||starts.hall;
    Object.assign(player,{x,z,footY:foot});activeWalkingFloor=foot===OG_Y?'og':'eg';
  }else if(activeWalkingFloor){
    // Optional shortcut for testing the two plans; normal exploration never
    // teleports: approach stairs and walk through the automatic entrance doors.
    player.x=0;player.footY=(activeWalkingFloor==='eg'?EG_Y:OG_Y);
    player.z=7.0;
  }else{
    player.x=0;player.footY=0;player.z=31;
  }
  player.y=player.footY+EYE_Y;
  player.yaw=0;player.pitch=.025;
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
  const label=describePlace(player.x,player.z,player.footY,historicalChateau);
  if(label!==lastLocation){lastLocation=label;ui.textContent=label;}
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
    if(e.pointerId===walkTouch){const vx=e.clientX-p.startX,vy=e.clientY-p.startY;strafe=THREE.MathUtils.clamp(vx/55,-1,1);forward=THREE.MathUtils.clamp(-vy/55,-1,1);const knob=document.getElementById('stickKnob');if(knob)knob.style.transform=`translate(${strafe*26}px, ${-forward*26}px)`;}
    else if(e.pointerId===lookTouch||e.pointerType==='mouse'){player.yaw-=dx*.005;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*.004,-1.25,1.25);}
  }
});
function release(e){activePointers.delete(e.pointerId);window.__pinchDist=0;if(e.pointerId===walkTouch){walkTouch=null;forward=strafe=0;const stick=document.getElementById('walkStick');if(stick)stick.hidden=true;const knob=document.getElementById('stickKnob');if(knob)knob.style.transform='translate(0,0)';}if(e.pointerId===lookTouch)lookTouch=null;}
for(const t of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(t,release);
canvas.addEventListener('wheel',e=>{if(mode==='orbit'){orbit.d=THREE.MathUtils.clamp(orbit.d*Math.exp(e.deltaY*.001),30,650);e.preventDefault();}},{passive:false});
const keys=new Set();addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown'].includes(e.key.toLowerCase()))e.preventDefault();});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.35:1.85));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobile?72:60;camera.updateProjectionMatrix();}
addEventListener('resize',()=>{if(renderer)resize();});
function frame(ms){
  const dt=Math.min(.040,(ms-last)/1000||0);last=ms;
  const near=mode==='orbit'?Math.max(.5,orbit.d*.014):.24;
  if(Math.abs(camera.near-near)>.001){camera.near=near;camera.updateProjectionMatrix();}
  if(mode==='orbit'){
    const p=orbit.phi,t=orbit.theta;
    const cp=Math.cos(p);camera.position.set(orbit.target.x+Math.sin(t)*orbit.d*cp,orbit.target.y+Math.sin(p)*orbit.d,orbit.target.z+Math.cos(t)*orbit.d*cp);
    camera.lookAt(orbit.target);
  }else{
    let f=forward+(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
    let st=strafe+(keys.has('d')?1:0)-(keys.has('a')?1:0);
    let mag=Math.max(1,Math.hypot(f,st));f/=mag;st/=mag;
    const speed=dt*6.1;
    const dx=(-Math.sin(player.yaw)*f+Math.cos(player.yaw)*st)*speed;
    const dz=(-Math.cos(player.yaw)*f-Math.sin(player.yaw)*st)*speed;
    // Real staircase heights (7 outside steps + 36 risers in two U-shaped flights),
    // real masonry collision and genuine oak doors. Never teleport on a threshold.
    const doors=[...(historicalChateau?.entranceDoors||[]),...(historicalChateau?.interiorDoors||[])];
    for(const d of doors)d.door.update(dt,player.x,player.z,player.footY);
    let candidate=candidateStep(player,player.x+dx,player.z,historicalChateau,doors);
    if(candidate){player.x=candidate.x;player.footY=candidate.footY;}
    candidate=candidateStep(player,player.x,player.z+dz,historicalChateau,doors);
    if(candidate){player.z=candidate.z;player.footY=candidate.footY;}
    // Keep the eye-height human-sized; damp out the discrete stair risers.
    player.y=THREE.MathUtils.damp(player.y,player.footY+EYE_Y,11,dt);
    player.x=THREE.MathUtils.clamp(player.x,-85,85);
    player.z=THREE.MathUtils.clamp(player.z,-85,125);
    activeWalkingFloor=player.footY>=(EG_Y+OG_Y)/2+.15?'og':player.footY>=EG_Y-.14?'eg':null;
    showWalkLocation();
    camera.position.set(player.x,player.y,player.z);
    camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  }
  atmospheric.update();renderer.render(scene,camera);requestAnimationFrame(frame);
}
run().catch(error=>{console.error(error);status.textContent='3D-Startfehler: '+(error.message||'Unbekannter Fehler');start.disabled=true;start.textContent='3D konnte nicht starten';});
