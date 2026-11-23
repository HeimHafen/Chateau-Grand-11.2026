/**
 * CHÂTEAU GRAND V2.4 — physical walk/navigation in metres.
 * Independent of Three.js so stair/ramp and portal transitions can be tested.
 */
export const EG_Y=4.72;
export const OG_Y=11.05;
export const EYE_Y=1.68;
export const FRONT_PORTALS=[-16.28,0,16.28];
export const MAIN_WING_PORTALS=[-89.7,89.7];
export const WING_REAR_PORTALS=[-91,91];
export const WALK_RADIUS=.34;
const between=(x,a,b)=>x>=a&&x<=b;
const insideMain=(x,z)=>between(x,-111.7,111.7)&&between(z,-20.70,20.70);
const insideWing=(x,z)=>between(Math.abs(x),70.5,105.5)&&between(z,-158.4,-20.55);
const insideRear=(x,z)=>between(x,-105.5,105.5)&&between(z,-196.5,-157.5);
export function isInsidePalace(x,z){return insideMain(x,z)||insideWing(x,z)||insideRear(x,z);}
export function onMonumentalStair(x,z){
  const half=25.6+Math.max(0,z-38)*.135;
  return between(z,37.65,59.35)&&Math.abs(x)<half;
}
export function onTerrace(x,z){return between(z,20.60,37.70)&&Math.abs(x)<26.36;}
export function lowerFlight(x,z){return between(x,-50.8,-43.8)&&between(z,.05,14.75);}
export function upperFlight(x,z){return between(x,-38.65,-31.75)&&between(z,-.10,14.85);}
export function middleLanding(x,z){return between(x,-51.0,-31.4)&&between(z,-2.35,1.20);}
const staircaseRise=(OG_Y-EG_Y)/24;
const halfway=EG_Y+12*staircaseRise;

/** Surface reached without jumping / teleporting. previousFoot disambiguates
 * the crossing 1.OG staircase above the ground-floor walking surface. */
export function surfaceHeight(x,z,previousFoot=0){
  if(onMonumentalStair(x,z)){
    // Rise matches the 26 real stone treads along the +Z-to--Z approach.
    return Math.min(4.50,Math.max(0,(59.28-z)*(4.50/20.8)));
  }
  if(onTerrace(x,z))return EG_Y;
  if(!isInsidePalace(x,z))return 0;
  // Historical west staircase is U-shaped: EG -> landing -> 1.OG.
  if(insideMain(x,z)){
    if(middleLanding(x,z)&&Math.abs(previousFoot-halfway)<.72)return halfway;
    if(lowerFlight(x,z)){
      const h=EG_Y+Math.min(12,Math.max(0,(14.70-z)/1.20))*staircaseRise;
      if(previousFoot<halfway+.25&&Math.abs(previousFoot-h)<.50)return h;
    }
    if(upperFlight(x,z)){
      const h=halfway+Math.min(12,Math.max(0,(z+.10)/1.20))*staircaseRise;
      if(previousFoot>halfway-.35&&Math.abs(previousFoot-h)<.50)return h;
    }
  }
  return previousFoot>=8.85?OG_Y:EG_Y;
}
function nearPortal(x,centers,width=3.05){
  return centers.some(cx=>Math.abs(x-cx)<=width/2-WALK_RADIUS*.93);
}
const at=(v,w,tol)=>Math.abs(v-w)<=tol;
const closeToWall=(x,z,w,r=WALK_RADIUS)=>x+r>w.x0&&x-r<w.x1&&z+r>w.z0&&z-r<w.z1;

/** Prevent walking through real masonry, but allow the three entry openings and
 * both continuous passage pairs to the connected wings and rear corridor. */
export function collidesAt(x,z,foot,architect,entryDoors=[]){
  const r=WALK_RADIUS;
  if(between(x,-112-r,112+r)&&at(z,21,.36+r)&&!nearPortal(x,FRONT_PORTALS,3.05))return true;
  if(between(x,-112-r,112+r)&&at(z,-21,.36+r)&&(foot>8.85||!nearPortal(x,MAIN_WING_PORTALS,4.35)))return true;
  if(between(z,-21-r,21+r)&&(at(x,-112,.36+r)||at(x,112,.36+r)))return true;
  for(const side of [-1,1]){
    for(const boundary of [70.5,105.5]){
      if(between(z,-158.4,-20.5)&&at(x,side*boundary,.36+r))return true;
    }
  }
  if(between(x,-105.5-r,105.5+r)&&at(z,-157.5,.36+r)&&(foot>8.85||!nearPortal(x,WING_REAR_PORTALS,4.35)))return true;
  if(between(x,-105.5-r,105.5+r)&&at(z,-196.5,.36+r))return true;
  if(between(z,-196.5-r,-157.5+r)&&(at(x,-105.5,.36+r)||at(x,105.5,.36+r)))return true;
  // The oak leaves are actual opening/closing collider geometry, not ghosts.
  for(const e of entryDoors){if(e.door.blocks(x,z,r,foot))return true;}
  // Roissy: a continuous physical suite of rooms with intentionally open doorways.
  if(insideMain(x,z)&&architect?.interiorCollision){
    const which=foot>8.85?'og':'eg';
    for(const w of architect.interiorCollision[which]||[]){if(closeToWall(x,z,w,r))return true;}
    // Original double-height Salon and western stairwell: real void in the 1.OG.
    if(which==='og'){
      if(between(x,-24.4,24.4)&&between(z,-19.5,-4.3))return true;
      if(between(x,-53.8,-28.8)&&between(z,-4.15,15.35)){
        // The staircase itself and its upper landing are legitimate floor surfaces.
        const gallery=between(x,-32.35,-28.50)&&between(z,1.0,19.60);
        if(!gallery&&!upperFlight(x,z)&&!middleLanding(x,z)&&!lowerFlight(x,z))return true;
      }
    }
  }
  return false;
}

/** The physical step is rejected when it requires climbing an unrelated solid
 * wall/slab or dropping off the side of the monumental entrance stairs. */
export function candidateStep(from,x,z,architect,entryDoors=[]){
  const foot=surfaceHeight(x,z,from.footY);
  if(foot-from.footY>.44||from.footY-foot>1.05)return null;
  if(collidesAt(x,z,foot,architect,entryDoors))return null;
  return {x,z,footY:foot};
}
export function describePlace(x,z,foot,architect){
  if(onMonumentalStair(x,z))return 'Monumentaltreppe';
  if(onTerrace(x,z))return 'Eingangsportikus';
  if(insideMain(x,z)){
    const which=foot>8.85?'og':'eg';
    const floor=which==='og'?'1. Obergeschoss':'Erdgeschoss';
    const room=(architect?.historicalFloors?.[which]||[]).find(r=>Math.abs(x-r.x)<=r.w/2&&Math.abs(z-r.z)<=r.d/2);
    return room?`${floor} · ${room.name}`:floor;
  }
  if(insideWing(x,z))return foot>8.85?'Seitenflügel · 1. OG':'Seitenflügel · EG';
  if(insideRear(x,z))return foot>8.85?'Rücktrakt · 1. OG':'Rücktrakt · EG';
  return 'Schlosspark';
}
