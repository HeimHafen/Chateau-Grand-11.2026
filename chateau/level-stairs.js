import {EG,OG,STAIR_WEST} from './roissy-config.js?v=roissy363';
import {ATTIC} from './attic.js?v=roissy367';
import {CELLAR} from './cellar.js?v=roissy363';
import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export const CELLAR_SHAFT=[-20.80,-18.18,5.73,10.14];
export const CELLAR_PORTAL=10.48, ATTIC_PORTAL=9.68;
export const ATTIC_SHAFT=[-20.80,-18.18,3.60,8.78];
const stairs=[
  {id:'cellar',rect:CELLAR_SHAFT,low:CELLAR.floor,high:EG,count:17},
  {id:'attic',rect:ATTIC_SHAFT,low:OG,high:ATTIC.floor,count:16}
];
const landingDepth=.95, centreGap=.24, wallGap=.12;
const within=(n,a,b)=>n>=a&&n<=b;

function layout(stair){
  const [a,b,c,d]=stair.rect,mid=(a+b)/2;
  const start=c+landingDepth;
  return {a,b,c,d,mid,start,going:(d-start)/stair.count,rise:(stair.high-stair.low)/(2*stair.count)};
}

// undefined allows the original movement solver to run. null is a blocked move.
export function stairStep(from,x,z,r){
  const active=stairs.find(s=>s.id===from.access);
  for(const stair of active?[active]:stairs){
    const {a,b,c,d,mid,start,going,rise}=layout(stair);
    const bottom=from.footY===stair.low,top=from.footY===stair.high;
    if(!active&&!bottom&&!top)continue;
    const left=within(x,a+wallGap+r,mid-centreGap/2-r);
    const right=within(x,mid+centreGap/2+r,b-wallGap-r);
    if(z>=d){
      if(active){
        if(left&&from.footY<=stair.low+rise+.001)return {x,z,footY:stair.low};
        if(right&&from.footY>=stair.high-rise-.001)return {x,z,footY:stair.high};
        return null;
      }
      if(top&&z<d+r&&x+r>a&&x-r<b&&!right)return null;
      if(bottom&&z<d+r&&x+r>a&&x-r<b&&!left)return null;
      continue;
    }
    if(!active&&(!within(x,a-r,b+r)||!within(z,c-r,d)))continue;
    if(!within(x,a+wallGap+r,b-wallGap-r)||z<c+.09+r)return null;
    if(!active&&(from.z<d-.001||!(bottom?left:right)))return null;
    let foot;
    if(z<start)foot=stair.low+stair.count*rise;
    else if(left)foot=stair.low+Math.min(stair.count,Math.floor((d-z)/going)+1)*rise;
    else if(right)foot=stair.high-Math.floor((d-z)/going)*rise;
    else return null;
    // The central newel prevents crossing the open well between flights.
    if(Math.abs(foot-from.footY)>.25)return null;
    return {x,z,footY:foot,access:stair.id};
  }
}

export function buildLevelStairs(T,parent,materials){
  const groups=[];
  const glow=new T.MeshStandardMaterial({name:'Roissy_Treppenlaterne_Opalglas',color:0xffe5b9,emissive:0xffab5b,emissiveIntensity:.92});
  for(const stair of stairs){
    const {a,b,c,d,mid,start,going,rise}=layout(stair);
    const group=new T.Group();
    group.name=stair.id==='cellar'?'Escalier des Caves · Kalkstein':'Escalier des Combles · Eiche';
    parent.add(group);
    groups.push(group);
    const {stone,wood,iron,brass}=materials,tread=stair.id==='cellar'?stone:wood;
    const parts=new Map();
    function part(mat,indexed,transform){
      const g=indexed.index?indexed.toNonIndexed():indexed;
      if(g!==indexed)indexed.dispose();
      transform(g);
      if(!parts.has(mat))parts.set(mat,[]);
      parts.get(mat).push(g);
    }
    function box(mat,x,y,z,w,h,depth,angle=0){
      part(mat,new T.BoxGeometry(w,h,depth),g=>{
        if(angle)g.rotateX(angle);
        g.translate(x,y,z);
      });
    }
    const lanes=[[a+wallGap,mid-centreGap/2],[mid+centreGap/2,b-wallGap]];
    for(const [lane,[l,r]] of lanes.entries()){
      const x=(l+r)/2,startY=lane?stair.high:stair.low+rise,slope=lane?1:-1;
      for(let i=0;i<stair.count;i++){
        const y=startY+slope*-i*rise,z=d-(i+.5)*going;
        box(tread,x,y-.13,z,r-l,.26,going);
        box(tread,x,y-.026,z+slope*-going*.34,r-l+.012,.052,.045);
        for(const side of [-1,1]){
          const edge=side<0?l:r;
          box(iron,edge,y+.49,z,.029,.98,.029);
          if(i%3===0)box(brass,edge,y+.63,z,.064,.050,.064);
        }
      }
      const incline=-Math.atan2(slope*rise,going);
      const span=Math.hypot(d-start,(stair.count-1)*rise);
      const midY=startY-slope*(stair.count-1)*rise/2,midZ=(start+d)/2;
      // The closed underside follows the stair pitch and meets both stringers.
      box(tread,x,midY-.222,midZ,r-l-.077,.155,span,incline);
      for(const edge of [l,r]){
        const inward=edge===l?1:-1;
        // A continuous stringer ties the treads and the turning platform together.
        box(tread,edge+inward*.064,midY-.235,midZ,.154,.26,span,incline);
        box(brass,edge-inward*.015,midY-.221,midZ,.018,.026,span,incline);
        box(wood,edge,midY+1.02,midZ,.077,.066,span,incline);
        box(iron,edge,midY+.255,midZ,.037,.033,span,incline);
        for(let i=2;i<stair.count-2;i+=3){
          const y=startY-slope*i*rise,z=d-(i+.5)*going;
          part(iron,new T.TorusGeometry(.12,.011,7,24),g=>{
            g.scale(.61,1.55,1);g.rotateY(Math.PI/2);g.translate(edge,y+.54,z);
          });
        }
      }
    }
    const turnY=(stair.low+stair.high)/2;
    box(tread,mid,turnY-.12,(start+c)/2,b-a-.24,.24,landingDepth);
    // Lanterns stand on the enclosed side of the turn, clear of headroom
    // and of the opening between the stair flights.
    for(const x of [a+.12,b-.12]){
      const z=c+.10,y=turnY+1.36;
      box(tread,x,turnY+.58,z,.15,1.16,.15);
      box(brass,x,y-.19,z,.22,.074,.17);
      box(brass,x,y+.163,z,.20,.059,.16);
      for(const u of [-.079,.079])for(const v of [-.057,.057])box(iron,x+u,y,z+v,.018,.30,.018);
      box(glow,x,y,z,.123,.254,.082);
      const lamp=new T.PointLight(0xffce9f,3.6,3.5,2);
      lamp.position.set(x,y,z+.10);
      group.add(lamp);
    }
    box(wood,mid,turnY+1,c+.12,b-a-.24,.073,.074);
    for(const x of [a+.12,b-.12]){
      box(wood,x,turnY+1,(c+.12+start)/2,.077,.068,start-c-.12);
      for(const z of [c+.29,c+.48,start-.18])box(iron,x,turnY+.49,z,.030,.98,.031);
    }
    for(let x=a+.16;x<b-.1;x+=.16)box(iron,x,turnY+.49,c+.12,.03,.98,.029);
    // Guard the upper opening on all sides except the uphill flight.
    const guardEnd=mid+centreGap/2;
    const guardRuns=[[a,b,c,c],[a,a,c,d],[b,b,c,d],[a,guardEnd,d,d]];
    for(const [x0,x1,z0,z1] of guardRuns){
      const dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),steps=Math.ceil(len/.16);
      box(wood,(x0+x1)/2,stair.high+1.04,(z0+z1)/2,dx||.075,.077,dz||.075);
      if(stair.id==='attic'){
        box(iron,(x0+x1)/2,stair.high+.096,(z0+z1)/2,dx||.041,.034,dz||.041);
        for(let i=1;i<steps;i++)box(iron,x0+dx*i/steps,stair.high+.552,z0+dz*i/steps,.025,.97,.025);
      }else{
        for(let i=0;i<=steps;i++)box(iron,x0+dx*i/steps,stair.high+.54,z0+dz*i/steps,.032,1.04,.033);
      }
    }
    if(stair.id==='attic')for(const [x,z] of [[a,c],[b,c],[a,d],[b,d],[guardEnd,d]]){
      box(wood,x,stair.high+.532,z,.083,1.064,.083);
      box(wood,x,stair.high+.057,z,.12,.114,.12);
      box(brass,x,stair.high+1.083,z,.103,.030,.103);
    }
    // Dressed reveals bridge the underground vault and the opening in the floor above.
    if(stair.id==='cellar'){
      // Masonry supports sit under the rear edge of the intermediate landing,
      // away from the flight entries and retaining-wall arches.
      for(const x of [a+.19,b-.19]){
        const h=turnY-stair.low-.20;
        box(stone,x,stair.low+h/2,c+.16,.31,h,.31);
        box(stone,x,stair.low+.09,c+.16,.39,.18,.39);
        box(stone,x,turnY-.30,c+.16,.38,.16,.38);
      }
      for(const x of [a-.09,b+.09])box(stone,x,-.13,(c+d)/2,.18,2.43,d-c);
      box(stone,mid,-.13,c-.09,b-a+.36,2.43,.18);
      box(stone,mid,-.13,d+.09,b-a+.36,2.43,.18);
    }
    if(typeof document!=='undefined'){
      const cellar=stair.id==='cellar';
      const panelZ=cellar?CELLAR_PORTAL:ATTIC_PORTAL;
      const y=(cellar?stair.high:stair.low)+3.18,x=STAIR_WEST+.31;
      const canvas=document.createElement('canvas');
      canvas.width=512;canvas.height=132;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#2f251c';ctx.fillRect(0,0,512,132);
      ctx.strokeStyle='#bfa16a';ctx.lineWidth=5;ctx.strokeRect(12,12,488,108);
      ctx.fillStyle='#f7e7c9';ctx.textAlign='center';
      ctx.font='36px Georgia, serif';
      ctx.fillText(cellar?'ESCALIER DES CAVES':'ESCALIER DES COMBLES',256,61);
      ctx.font='22px system-ui';
      ctx.fillText(cellar?'KELLER':'DACHGESCHOSS',256,97);
      const texture=new T.CanvasTexture(canvas);
      texture.colorSpace=T.SRGBColorSpace;
      const plaque=new T.Mesh(new T.PlaneGeometry(1.31,.338),new T.MeshBasicMaterial({map:texture}));
      plaque.rotation.y=Math.PI/2;
      plaque.position.set(x,y,panelZ);
      group.add(plaque);
      box(brass,x-.022,y,panelZ,.027,.354,1.33);
    }
    for(const [mat,geometries] of parts){
      const geo=mergeGeometries(geometries,false);
      for(const part of geometries)part.dispose();
      const mesh=new T.Mesh(geo,mat);
      mesh.castShadow=mat!==glow;mesh.receiveShadow=true;
      group.add(mesh);
    }
  }
  return groups;
}
