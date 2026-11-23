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
  // Verify that we really used donor assets, not a recreated imitation.
  if(chateau.originalPortico.children.length<17)throw Error('Originalportikus aus MaxGame wurde unvollständig übernommen.');
  window.__CHATEAU_MAXGAME={engine:'Three.js',donorAsset:'assets/white-house-structure.glb',porticoChildren:chateau.originalPortico.children.length,scene,version:'2.0',dimensions:chateau.palaceDimensions,instances:chateau.instancedElements,drawcalls:chateau.instancedDrawcalls};
  document.getElementById('version').textContent='MAXGAME-PALAST · 2.0';
  start.disabled=false;start.textContent='Château erkunden';
  status.textContent='Monumentale Schlossanlage, Innenhof, Kuppel und MaxGame-Portikus geladen.';
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
function view(which){
  mode='orbit';
  const views={
    front:{theta:0,phi:.10,d:390},
    angle:{theta:.44,phi:.46,d:356},
    above:{theta:.35,phi:1.02,d:339}
  };
  Object.assign(orbit,views[which]||views.angle);orbit.target.set(0,18,-65);
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('selected',b.dataset.view===which));
  document.getElementById('walk').classList.remove('selected');
  hint.textContent='Ansicht: ziehen zum Drehen · mit zwei Fingern zoomen';
}
function setWalk(){mode='walk';player.x=0;player.y=1.68;player.z=145;player.yaw=0;player.pitch=.025;document.getElementById('walk').classList.add('selected');document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('selected'));hint.textContent='Links ziehen: laufen · rechts wischen: umsehen · Zurücksetzen: Außenansicht';}
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
    player.x+=(-Math.sin(player.yaw)*f+Math.cos(player.yaw)*st)*speed;
    player.z+=(-Math.cos(player.yaw)*f-Math.sin(player.yaw)*st)*speed;
    // First iteration lets the player inspect the full exterior; approach into inner spaces is later work.
    player.x=THREE.MathUtils.clamp(player.x,-320,320);player.z=THREE.MathUtils.clamp(player.z,22.2,325);
    camera.position.set(player.x,player.y,player.z);
    camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  }
  atmospheric.update();renderer.render(scene,camera);requestAnimationFrame(frame);
}
run().catch(error=>{console.error(error);status.textContent='3D-Startfehler: '+(error.message||'Unbekannter Fehler');start.disabled=true;start.textContent='3D konnte nicht starten';});
