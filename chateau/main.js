import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {createExteriorMaterialLibrary,applyProceduralFinish} from '../wohnzimmer/exterior-materials-portikus-kalkstein.js';
import {createRealisticExteriorGlass} from '../wohnzimmer/window-glass.js';
import {buildSky} from '../wohnzimmer/sky-atmosphere.js';
import {buildChateau} from './architecture.js';

const canvas=document.getElementById('world');
const splash=document.getElementById('splash');
const start=document.getElementById('start');
const status=document.getElementById('status');
const hint=document.getElementById('controlHint');
const mobile=matchMedia('(pointer:coarse)').matches;
let renderer,scene,camera,orbit={theta:.43,phi:.52,d:355,target:new THREE.Vector3(0,17,-72)},mode='orbit';
let player={x:0,y:1.68,z:125,yaw:0,pitch:0};
let walkTouch=null,lookTouch=null,forward=0,strafe=0,lookPointer=null;
let last=0;
let atmospheric;
let floorChoice=null, activeWalkingFloor=null, historicalChateau=null, clippedMode=false;

async function run(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.87;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x8293a4);scene.fog=new THREE.FogExp2(0x8293a4,.00048);
  camera=new THREE.PerspectiveCamera(61,1,.08,1600);camera.rotation.order='YXZ';
  atmospheric=buildSky(THREE,scene,camera);
  scene.add(new THREE.HemisphereLight(0xcce1f1,0x807262,1.13));
  const sun=new THREE.DirectionalLight(0xffe8ca,2.05);
  sun.position.set(-135,210,168);sun.castShadow=true;
  const s=mobile?1024:2048;sun.shadow.mapSize.set(s,s);
  Object.assign(sun.shadow.camera,{left:-270,right:270,top:270,bottom:-270,near:1,far:580});
  sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00022;sun.shadow.normalBias=.027;
  scene.add(sun);
  const mats=createExteriorMaterialLibrary(THREE);
  const glass=createRealisticExteriorGlass(THREE,renderer);
  buildLandscape(mats);
  const loader=new GLTFLoader();
  const {scene:donor}=await loader.loadAsync('./assets/white-house-structure.glb');
  const chateau=buildChateau(THREE,scene,donor,mats,glass);
  historicalChateau=chateau;
  for(const floor of ['eg','og'])chateau.historicalLayers[floor].traverse(obj=>{
    if(obj.userData.floorPlanLabel)obj.visible=false;
  });
  // Low-absorption glass allows viewing out of rooms in both directions.
  glass.side=THREE.DoubleSide;glass.transparent=true;glass.opacity=.18;glass.depthWrite=false;
  glass.needsUpdate=true;
  // Verify that we really used donor assets, not a recreated imitation.
  if(chateau.originalPortico.children.length<17)throw Error('Originalportikus aus MaxGame wurde unvollständig übernommen.');
  window.__CHATEAU_MAXGAME={engine:'Three.js',donorAsset:'assets/white-house-structure.glb',porticoChildren:chateau.originalPortico.children.length,scene,version:'2.3',dimensions:chateau.palaceDimensions,instances:chateau.instancedElements,drawcalls:chateau.instancedDrawcalls};
  document.getElementById('version').textContent='MAXGAME-PALAST · 2.3';
  start.disabled=false;start.textContent='Château erkunden';
  status.textContent='Château geladen · Roissy-Grundrisse nach hochauflösender Vorlage nachgearbeitet · durchsichtige Fenster.';
  resize();view('angle');
  start.addEventListener('click',()=>{splash.hidden=true;renderer.shadowMap.needsUpdate=true;}, {once:true});
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
  const grass=new THREE.MeshStandardMaterial({name:'MaxGame_PBR_Gras',map:texture[0],normalMap:texture[1],roughnessMap:texture[2],roughness:.97,color:0xc7d6b6,normalScale:new THREE.Vector2(.25,.25)});
  applyProceduralFinish(THREE,grass,'grassBreakup');
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),grass);floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
  const paving=new THREE.MeshStandardMaterial({color:0xe0d2c0,roughness:.95});
  const pavement=new THREE.Mesh(new THREE.BoxGeometry(17,.08,205),mats.porticoPaving);
  pavement.position.set(0,-.02,145);pavement.receiveShadow=true;scene.add(pavement);
  for(let x of [-23,23]){
    for(let z of [95,145]){
      const patch=new THREE.Mesh(new THREE.BoxGeometry(30,.035,22),grass);
      patch.position.set(x,-.027,z);patch.receiveShadow=true;scene.add(patch);
    }
  }
}
function setCutaway(floor){
  // Clipping takes away the upper shell for a real top-down view of constructed rooms.
  clippedMode=!!floor;
  renderer.clippingPlanes=floor?[new THREE.Plane(new THREE.Vector3(0,-1,0),floor==='eg'?10.77:17.18)]:[];
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
  floorChoice=which==='eg'||which==='og'?which:null;
  const views={
    front:{theta:0,phi:.10,d:390,target:[0,18,-65]},
    angle:{theta:.44,phi:.46,d:356,target:[0,18,-65]},
    above:{theta:.35,phi:1.02,d:339,target:[0,18,-65]},
    entrance:{theta:0,phi:.065,d:84,target:[0,13,26]},
    stairSide:{theta:1.04,phi:.16,d:77,target:[0,7,39]},
    eg:{theta:.24,phi:1.32,d:167,target:[0,6.7,0]},
    og:{theta:.24,phi:1.32,d:167,target:[0,13.3,0]}
  };
  const selected=views[which]||views.angle;
  Object.assign(orbit,{theta:selected.theta,phi:selected.phi,d:selected.d});
  orbit.target.set(...selected.target);
  setCutaway(floorChoice);
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===which));
  document.getElementById('walk').classList.remove('selected');
  hint.textContent=floorChoice?'Historischer Grundriss: drehen / zoomen · „'+(floorChoice==='eg'?'EG':'1. OG')+' betreten“ für Rundgang':'Ansicht: ziehen zum Drehen · mit zwei Fingern zoomen';
}
function setWalk(){
  mode='walk';activeWalkingFloor=floorChoice;
  setCutaway(null); // Ceiling/floors visible during walk inside rooms.
  if(activeWalkingFloor){
    player.x=0;player.y=(activeWalkingFloor==='eg'?4.72:11.05)+1.72;
    player.z=13.0;player.yaw=0;player.pitch=.025;
  }else{
    player.x=0;player.y=1.68;player.z=145;player.yaw=0;player.pitch=.025;
  }
  document.getElementById('walk').classList.add('selected');
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('selected'));
  hint.textContent=activeWalkingFloor?'Links ziehen: durch Räume gehen · rechts umsehen · Fenster von innen und außen durchsichtig':'Links ziehen: laufen · rechts wischen: umsehen · Zurücksetzen: Außenansicht';
}
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>view(b.dataset.view));
document.getElementById('walk').addEventListener('click',setWalk);
document.getElementById('reset').addEventListener('click',()=>view('angle'));
const activePointers=new Map();
canvas.addEventListener('pointerdown',e=>{
  canvas.setPointerCapture(e.pointerId);
  const p={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};
  activePointers.set(e.pointerId,p);
  if(mode==='walk'&&e.pointerType==='touch'){
    if(e.clientX<innerWidth*.5&&!walkTouch)walkTouch=e.pointerId;
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
    if(e.pointerId===walkTouch){const vx=e.clientX-p.startX,vy=e.clientY-p.startY;strafe=THREE.MathUtils.clamp(vx/55,-1,1);forward=THREE.MathUtils.clamp(-vy/55,-1,1);}
    else if(e.pointerId===lookTouch||e.pointerType==='mouse'){player.yaw-=dx*.005;player.pitch=THREE.MathUtils.clamp(player.pitch-dy*.004,-1.25,1.25);}
  }
});
function release(e){activePointers.delete(e.pointerId);window.__pinchDist=0;if(e.pointerId===walkTouch){walkTouch=null;forward=strafe=0;}if(e.pointerId===lookTouch)lookTouch=null;}
for(const t of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(t,release);
canvas.addEventListener('wheel',e=>{if(mode==='orbit'){orbit.d=THREE.MathUtils.clamp(orbit.d*Math.exp(e.deltaY*.001),30,650);e.preventDefault();}},{passive:false});
const keys=new Set();addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown'].includes(e.key.toLowerCase()))e.preventDefault();});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function resize(){const w=innerWidth,h=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.30:1.85));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobile?72:60;camera.updateProjectionMatrix();}
addEventListener('resize',()=>{if(renderer)resize();});
function frame(ms){
  const dt=Math.min(.040,(ms-last)/1000||0);last=ms;
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
    const wallHit=(x,z)=>{
      if(!activeWalkingFloor||!historicalChateau)return false;
      const rad=.34;
      const walls=historicalChateau.interiorCollision[activeWalkingFloor];
      for(const wall of walls){
        if(x+rad>wall.x0&&x-rad<wall.x1&&z+rad>wall.z0&&z-rad<wall.z1)return true;
      }
      // Guard actual first-floor open voids: the player cannot walk over air.
      if(activeWalkingFloor==='og'){
        if(x>-24.4&&x<24.4&&z>-19.5&&z<-4.3)return true;
        if(x>-54.0&&x<-29.0&&z>-4.3&&z<15.6)return true;
      }
      // Keep interior-mode navigation in the historically planned corps de logis.
      return x<-111.6||x>111.6||z<-20.6||z>20.6;
    };
    if(!wallHit(player.x+dx,player.z))player.x+=dx;
    if(!wallHit(player.x,player.z+dz))player.z+=dz;
    player.x=THREE.MathUtils.clamp(player.x,-320,320);
    player.z=THREE.MathUtils.clamp(player.z,-197,325);
    camera.position.set(player.x,player.y,player.z);
    camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  }
  atmospheric.update();renderer.render(scene,camera);requestAnimationFrame(frame);
}
run().catch(error=>{console.error(error);status.textContent='3D-Startfehler: '+(error.message||'Unbekannter Fehler');start.disabled=true;start.textContent='3D konnte nicht starten';});
