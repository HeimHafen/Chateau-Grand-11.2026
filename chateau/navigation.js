/** Château Grand V3.4 – walkable ground floor and Premier Étage, shared plan metres. */
import {HALF_W,HALF_D,EG,OG,ROOMDATA,FRONT_DOORS,GRAND_STAIR,PERRON,EXTERIOR,FACADE_SEGMENTS,frontAt,rearAt} from './roissy-config.js?v=roissy345';
export const EG_Y=EG,OG_Y=OG,EYE_Y=1.69;
export const WALK_RADIUS=.30;
const H=(OG-EG)*.5;
const between=(x,a,b)=>x>=a&&x<=b;
const inside=(x,z)=>between(x,-HALF_W+.35,HALF_W-.35)&&between(z,rearAt(x)+.34,frontAt(x)-.34);
const onSteps=(x,z)=>Math.abs(x)<PERRON.width/2-.10&&
  between(z,PERRON.firstCentreZ-PERRON.treadDepth*.5,
    PERRON.firstCentreZ+(PERRON.steps-.5)*PERRON.treadDepth);
const terrace=(x,z)=>Math.abs(x)<EXTERIOR.terraceHalf&&between(z,HALF_D-.75,PERRON.terraceEndZ);
const S=GRAND_STAIR, STEPS=S.stepsPerFlight;
const stepDepth=f=>f.length/STEPS;
const first=(x,z)=>{
  if(!between(z,S.first.startZ-S.first.length-.01,S.first.startZ+.012))return false;
  const t=Math.max(0,S.first.startZ-z),i=Math.floor(t/stepDepth(S.first)),extra=S.starterWidening[i]||0;
  // Conservative support boundary: excludes the curved outer 12cm corners.
  const half=S.first.width/2+Math.max(0,extra-.12)-.04;
  return Math.abs(x-S.first.x)<=half;
};
const second=(x,z)=>between(x,S.second.x-S.second.width/2+.04,S.second.x+S.second.width/2-.04)&&
  between(z,S.second.startZ-.012,S.second.startZ+S.second.length+.012);
const landing=(x,z)=>between(x,S.landing.x-S.landing.width/2+.04,S.landing.x+S.landing.width/2-.04)&&
  between(z,S.landing.z-S.landing.depth/2+.01,S.landing.z+S.landing.depth/2-.01);
export function isInsidePalace(x,z){return inside(x,z);}
export function onMonumentalStair(x,z){return onSteps(x,z);}
export function onTerrace(x,z){return terrace(x,z);}
function stairHeight(x,z,prior){
  // Same discrete top-of-tread heights as the geometry. Stair traversal does
  // not pretend a solid continuous ramp exists inside the visible stair.
  const rise=(OG-EG)/(2*STEPS);
  if(landing(x,z)&&prior>=EG+H-.65&&prior<=EG+H+.70)return EG+H;
  if(first(x,z)&&prior<EG+H+.55){
    const i=Math.max(0,Math.min(STEPS-1,Math.floor((S.first.startZ-z)/stepDepth(S.first))));
    return EG+(i+1)*rise;
  }
  if(second(x,z)&&prior>EG+H-.45){
    const i=Math.max(0,Math.min(STEPS-1,Math.floor((z-S.second.startZ)/stepDepth(S.second))));
    return EG+(STEPS+i+1)*rise;
  }
  return null;
}
export function surfaceHeight(x,z,prev=0){
  if(onSteps(x,z)){
    // The support height is that of the ACTUAL tread under the player, not a
    // continuous virtual ramp drawn through the discrete stone staircase.
    const i=Math.max(0,Math.min(PERRON.steps-1,
      Math.floor((z-(PERRON.firstCentreZ-PERRON.treadDepth*.5))/PERRON.treadDepth)));
    return PERRON.landingHeight*(PERRON.steps-i)/PERRON.steps;
  }
  if(terrace(x,z)&&(!inside(x,z)||prev<(EG+OG)/2))return EG;
  if(!inside(x,z))return 0;
  const on=stairHeight(x,z,prev);
  if(on!==null)return on;
  return prev>=(EG+OG)*.5+.12?OG:EG;
}
const near=(x,centers,width)=>centers.some(c=>Math.abs(x-c)<width/2-WALK_RADIUS*.53);
function touches(x,z,w,r=WALK_RADIUS){return x+r>w.x0&&x-r<w.x1&&z+r>w.z0&&z-r<w.z1;}
export function collidesAt(x,z,foot,architecture,doors=[]){
  const r=WALK_RADIUS,og=foot>(EG+OG)/2+.18;
  for(const s of FACADE_SEGMENTS){
    const along=s.axis==='x'?x:z,across=s.axis==='x'?z:x;
    if(between(along,s.a-r,s.b+r)&&Math.abs(across-s.fixed)<.23+r){
      if(!s.entrance||og||!near(x,FRONT_DOORS,1.52))return true;
    }
  }
  if(Math.abs(z-PERRON.terraceEndZ)<r+.17&&Math.abs(x)>PERRON.width/2-r&&Math.abs(x)<EXTERIOR.terraceHalf+r&&foot>.5)return true;
  for(const d of doors){if(d.door.blocks(x,z,r,foot))return true;}
  if(inside(x,z)&&architecture?.interiorCollision){
    for(const w of architecture.interiorCollision[og?'og':'eg']||[]){if(touches(x,z,w))return true;}
    // No walkable floor over the double-height Salon or stairwell except on the U flights.
    if(og){
      if(between(x,-6.65,6.65)&&between(z,EXTERIOR.parkBack+.34,-2.34))return true;
      const rect=(q)=>between(x,q.x-q.width/2,q.x+q.width/2)&&between(z,q.z-q.depth/2,q.z+q.depth/2);
      const solidDeck=architecture.upperDeckRectangles?.some(([x0,x1,z0,z1])=>between(x,x0,x1)&&between(z,z0,z1));
      if(architecture.upperDeckRectangles&&!solidDeck&&!second(x,z)&&!rect(S.upperLanding)&&!rect(S.passage))return true;
    }
  }
  return false;
}
export function candidateStep(from,x,z,arch,doors=[]){
  const foot=surfaceHeight(x,z,from.footY);
  if(foot-from.footY>.37||from.footY-foot>.75)return null;
  if(collidesAt(x,z,foot,arch,doors))return null;
  // Prevent sideways escape through the actual inner and outer stair rails.
  const rise=(OG-EG)/(2*STEPS);
  for(const [f,offset] of [[S.first,0],[S.second,STEPS]]){
    const t=(z-f.startZ)*f.direction;
    if(t<.15||t>f.length-.15)continue;
    const idx=Math.min(STEPS-1,Math.floor(t/stepDepth(f))), tread=EG+(offset+idx+1)*rise;
    if(Math.abs(foot-tread)>.37)continue;
    for(const side of [-1,1]){
      const railX=f.x+side*(f.width/2-.10);
      if(Math.abs(x-railX)<WALK_RADIUS+.04)return null;
    }
  }
  return {x,z,footY:foot};
}
export function describePlace(x,z,foot,architecture){
  if(onSteps(x,z))return 'Perron · Eingangsstufen';
  if(terrace(x,z)&&!inside(x,z))return 'Historische Eingangs-Terrasse';
  if(inside(x,z)){
    const key=foot>(EG+OG)*.5+.2?'og':'eg',pre=key==='eg'?'Erdgeschoss':'1. Obergeschoss';
    const room=architecture?.roomAt?.(key,x,z)||(architecture?.historicalFloors?.[key]||ROOMDATA[key]).find(r=>Math.abs(x-r.x)<r.w*.5&&Math.abs(z-r.z)<r.d*.5);
    return room?pre+' · '+room.name:pre;
  }
  return 'Schlosspark · Château de Roissy';
}
