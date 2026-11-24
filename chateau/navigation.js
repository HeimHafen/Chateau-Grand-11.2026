/** Château Grand V3.4 – walkable ground floor and Premier Étage, shared plan metres. */
import {HALF_W,HALF_D,EG,OG,ROOMDATA,FRONT_DOORS,GRAND_STAIR} from './roissy-config.js';
export const EG_Y=EG,OG_Y=OG,EYE_Y=1.69;
export const WALK_RADIUS=.30;
const H=(OG-EG)*.5;
const between=(x,a,b)=>x>=a&&x<=b;
const inside=(x,z)=>between(x,-HALF_W+.35,HALF_W-.35)&&between(z,-HALF_D+.34,HALF_D-.34);
const onSteps=(x,z)=>Math.abs(x)<6.25&&between(z,17.3,20.31);
const terrace=(x,z)=>Math.abs(x)<7.35&&between(z,HALF_D-.75,17.43);
const S=GRAND_STAIR, STEPS=S.stepsPerFlight;
const stepDepth=f=>f.length/STEPS;
const first=(x,z)=>between(x,S.first.x-S.first.width/2+.04,S.first.x+S.first.width/2-.04)&&
  between(z,S.first.startZ-S.first.length-.01,S.first.startZ+.012);
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
  if(onSteps(x,z))return Math.max(0,Math.min(EG,(20.31-z)/(20.31-17.30)*EG));
  if(terrace(x,z))return EG;
  if(!inside(x,z))return 0;
  const on=stairHeight(x,z,prev);
  if(on!==null)return on;
  return prev>=(EG+OG)*.5+.12?OG:EG;
}
const near=(x,centers,width)=>centers.some(c=>Math.abs(x-c)<width/2-WALK_RADIUS*.53);
function touches(x,z,w,r=WALK_RADIUS){return x+r>w.x0&&x-r<w.x1&&z+r>w.z0&&z-r<w.z1;}
export function collidesAt(x,z,foot,architecture,doors=[]){
  const r=WALK_RADIUS,og=foot>(EG+OG)/2+.18;
  if(between(x,-HALF_W-r,HALF_W+r)&&Math.abs(z-HALF_D)<.23+r){
     if(og||!near(x,FRONT_DOORS,1.52))return true;
  }
  if(between(x,-HALF_W-r,HALF_W+r)&&Math.abs(z+HALF_D)<.23+r)return true;
  if(between(z,-HALF_D-r,HALF_D+r)&&(Math.abs(x-HALF_W)<.23+r||Math.abs(x+HALF_W)<.23+r))return true;
  for(const d of doors){if(d.door.blocks(x,z,r,foot))return true;}
  if(inside(x,z)&&architecture?.interiorCollision){
    for(const w of architecture.interiorCollision[og?'og':'eg']||[]){if(touches(x,z,w))return true;}
    // No walkable floor over the double-height Salon or stairwell except on the U flights.
    if(og){
      if(between(x,-6.65,6.65)&&between(z,-11.1,-2.34))return true;
      if(between(x,-13.14,-6.80)&&between(z,-2.12,10.72)&&!first(x,z)&&!second(x,z)&&!landing(x,z)&&!between(z,8.7,10.72))return true;
    }
  }
  return false;
}
export function candidateStep(from,x,z,arch,doors=[]){
  const foot=surfaceHeight(x,z,from.footY);
  if(foot-from.footY>.37||from.footY-foot>.75)return null;
  if(collidesAt(x,z,foot,arch,doors))return null;
  return {x,z,footY:foot};
}
export function describePlace(x,z,foot,architecture){
  if(onSteps(x,z))return 'Perron · Eingangsstufen';
  if(terrace(x,z))return 'Historische Eingangs-Terrasse';
  if(inside(x,z)){
    const key=foot>(EG+OG)*.5+.2?'og':'eg',pre=key==='eg'?'Erdgeschoss':'1. Obergeschoss';
    const room=(architecture?.historicalFloors?.[key]||ROOMDATA[key]).find(r=>Math.abs(x-r.x)<r.w*.5&&Math.abs(z-r.z)<r.d*.5);
    return room?pre+' · '+room.name:pre;
  }
  return 'Schlosspark · Château de Roissy';
}
