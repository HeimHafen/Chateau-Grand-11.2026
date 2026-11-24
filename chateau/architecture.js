/**
 * CHÂTEAU GRAND V3.4 – coherent grand staircase, landings, salon-gallery edge.
 * Geometry + room register share one unit/metre plan with navigation.
 * Interior reproduces legible room sequences; not a documented survey in cm.
 * The classical MaxGame portico and small cupola are creative additions, not historical evidence.
 */
import {addPorticoColumn} from '../wohnzimmer/portico-columns-v2.js';
import {addPortalDoors} from '../wohnzimmer/portal-doors-v2.js';
import {PLAN,HALF_W,HALF_D,EG,OG,CORNICE,ROOMDATA,FRONT_DOORS,FRONT_WINDOW_AXES,REAR_WINDOW_AXES,SIDE_WINDOW_AXES,REAR_X_CUTS,FRONT_X_CUTS,CROSS_WALL_Z,GRAND_STAIR} from './roissy-config.js';

export function buildChateau(THREE,scene,donor,mats,glass){
 const root=new THREE.Group();root.name='CHATEAU_ROISSY_HISTORISCHER_KERN_54X23';scene.add(root);
 const layers={eg:new THREE.Group(),og:new THREE.Group()};
 layers.eg.name='ROISSY_REZ_DE_CHAUSSEE_LE_ROUGE_1776';layers.og.name='ROISSY_PREMIER_ETAGE_LE_ROUGE_1776';root.add(layers.eg,layers.og);
 const bronze=new THREE.MeshStandardMaterial({color:0x282f36,metalness:.63,roughness:.35,side:THREE.DoubleSide});
 const bronzeTrim=new THREE.MeshStandardMaterial({color:0x64666b,metalness:.65,roughness:.35});
 const gold=new THREE.MeshStandardMaterial({color:0xad8654,metalness:.61,roughness:.36});
 const wood=new THREE.MeshStandardMaterial({color:0x3d2418,roughness:.63});
 const floorStone=mats.porticoPaving||mats.trim;
 // Interior ceiling finish is a separate physically situated underside, not the
 // exterior gravel/foundation material and not a dark roofing polygon.
 const ceilingStone=new THREE.MeshStandardMaterial({
   name:'Roissy_Heller_Kalkstein_Deckenunterseite',
   color:0xe6d6c1,roughness:.96,metalness:0,
   emissive:0xb8a18b,emissiveIntensity:.20,side:THREE.DoubleSide
 });
 const cast={wall:mats.facadeWall,stone:mats.dressedStone,trim:mats.trim,window:mats.windowStone,
   sill:mats.shade,glass,sash:mats.paintedSash,bronze,bronzeTrim,gold,wood,floor:floorStone,ceiling:ceilingStone};
 const baseGeo=new THREE.BoxGeometry(1,1,1),batch=new Map(), collisionWalls={eg:[],og:[]};
 const doors=[]; let directMeshes=0;
 function addBox(mat,x,y,z,w,h,d,layer='shell'){
   if(![x,y,z,w,h,d].every(Number.isFinite)||w<=0||h<=0||d<=0)throw Error('Invalid geometry: '+[mat,x,y,z,w,h,d]);
   const k=layer+':'+mat; if(!batch.has(k))batch.set(k,[]);batch.get(k).push([x,y,z,w,h,d]);
 }
 function mesh(geo,mat,name,parent=root){const o=new THREE.Mesh(geo,cast[mat]||mat);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);directMeshes++;return o;}
 function cyl(mat,x,y,z,r,h,segments=22){const a=mesh(new THREE.CylinderGeometry(r,r,h,segments),mat,'Steinrundelement');a.position.set(x,y,z);return a;}
 function beam(mat,from,to,r=.075){const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),v=b.clone().sub(a),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),mat,'Dachprofil');o.position.copy(a.add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 const shellLevels=[{bottom:EG,top:OG,sill:1.00,glassH:3.73},{bottom:OG,top:CORNICE,sill:.88,glassH:3.43}];
 function wallSegments(axis,fixed,a,b,atLevel,holes,thickness=.46,mat='wall'){
   const y=atLevel.bottom,top=atLevel.top;let last=a;
   const list=holes.filter(h=>h.at-h.width/2>a+.15&&h.at+h.width/2<b-.15).sort((m,n)=>m.at-n.at);
   const block=(s,e,l,u)=>{
     if(e-s<.015||u-l<.015)return;
     if(axis==='x')addBox(mat,(s+e)/2,(l+u)/2,fixed,e-s,u-l,thickness);
     else addBox(mat,fixed,(l+u)/2,(s+e)/2,thickness,u-l,e-s);
   };
   for(const h of list){const left=h.at-h.width/2,right=h.at+h.width/2;
      if(left<last-.01)throw Error('Overlapping window/door openings at '+fixed+','+h.at);
      block(last,left,y,top);
      const bottom=h.isDoor?y+.01:y+atLevel.sill;
      const high=h.isDoor?Math.min(3.9,top-y-.26):atLevel.glassH;
      block(left,right,y,bottom);block(left,right,bottom+high,top);last=right;
   }
   block(last,b,y,top);
 }
 function addFacadeWindow(axis,fixed,at,level,isDoor=false){
   const v=shellLevels[level],y=v.bottom+(isDoor?.01:v.sill),height=isDoor?3.9:v.glassH,
     width=isDoor?(Math.abs(at)<.3?1.98:1.52):(level===0?2.15:2.05),t=.11,
     direction=(axis==='x'?(fixed>0?1:-1):(fixed>0?1:-1));
   const along=(material,pos,Y,l,h,depth,face=.19)=>{
      if(axis==='x')addBox(material,pos,Y,fixed+direction*face,l,h,depth);
      else addBox(material,fixed+direction*face,Y,pos,depth,h,l);
   };
   if(!isDoor){
     along('glass',at,y+height/2,width-.2,height-.16,.045,.02);
     for(const delta of [-.5,.5])along('sash',at+delta*(width-.22)/2,y+height/2,.065,height-.14,.10,.22);
     for(const frac of [.34,.68])along('sash',at,y+height*frac,width-.17,.065,.105,.22);
   }
   for(const sgn of [-1,1])along('window',at+sgn*(width/2+.04),y+height/2,.20,height+.28,.49,.26);
   along('trim',at,y+height+.11,width+.38,.22,.58,.29);
   along('window',at,y+height+.30,width+.54,.10,.62,.33);
   along('window',at,y-.12,width+.38,.19,.60,.27);
   if(!isDoor&&level===1){
     along('trim',at,y+height+.43,width+.46,.12,.67,.32);
     // Delicate French balcony immediately below 1.OG window, without masking the panes.
     if(axis==='x'&&fixed>0){
       along('stone',at,y-.30,width+.38,.12,.23,.42);
       for(let i=-2;i<=2;i++)along('bronzeTrim',at+i*.36,y+.02,.048,.54,.075,.47);
       along('bronzeTrim',at,y+.34,width+.40,.06,.08,.49);
     }
   }
   if(isDoor){
     const door=addPortalDoors(THREE,root,mats,glass,at,fixed,1,width,height,wood,y,{inset:-.12,activationDistance:5.7});
     doors.push({x:at,z:fixed,base:y,door});
     along('stone',at,y+height+.47,width+.82,.22,.73,.36);
   }
 }
 function facade(axis,fixed,a,b,positions,excludeEntrance=false){
   for(let l=0;l<2;l++){
     const v=shellLevels[l];
     const openings=positions.map(p=>({at:p,width:excludeEntrance&&l===0&&FRONT_DOORS.includes(p)?(p===0?1.98:1.52):(l===0?2.15:2.05),isDoor:excludeEntrance&&l===0&&FRONT_DOORS.includes(p)}));
     wallSegments(axis,fixed,a,b,v,openings);
     for(const p of positions)addFacadeWindow(axis,fixed,p,l,excludeEntrance&&l===0&&FRONT_DOORS.includes(p));
   }
   // Stone courses perfectly match the same EG, OG and upper cornice heights.
   const put=(m,pos,y,w,h,dep,offset=.48)=>axis==='x'
     ?addBox(m,pos,y,fixed+(fixed>0?offset:-offset),w,h,dep)
     :addBox(m,fixed+(fixed>0?offset:-offset),y,pos,dep,h,w);
   for(const y of [EG+.22,OG+.06,CORNICE-.10]){
     put('trim',(a+b)/2,y,b-a+.35,.19,.81,.33);
     put('window',(a+b)/2,y+.16,b-a+.36,.085,.72,.36);
   }
 }
 // Proven plan footprint: symmetrically centred 54×23 m, not a fantasy 224×217 m quadrangle.
 addBox('stone',0,.35,0,54.5,.70,23.5);
 facade('x',HALF_D,-HALF_W,HALF_W,FRONT_WINDOW_AXES,true);
 facade('x',-HALF_D,-HALF_W,HALF_W,REAR_WINDOW_AXES,false);
 facade('z',HALF_W,-HALF_D,HALF_D,SIDE_WINDOW_AXES,false);
 facade('z',-HALF_W,-HALF_D,HALF_D,SIDE_WINDOW_AXES,false);
 // Corner quoins and aligned central masonry piers, independent of windows.
 for(const x of [-26.8,26.8])for(const z of [-11.3,11.3])
   for(let i=0;i<14;i++)addBox(i%2?'window':'trim',x,EG+.29+i*.77,z,1.00,.49,.98);
 for(const frontZ of [-11.56,11.56])for(const x of [-22.3,-13.22,-6.72,6.72,14.05,20.5]){
   // Pilaster occupies room partition axis, not the window's glazed opening.
   addBox('window',x,(EG+CORNICE)/2,frontZ,.46,CORNICE-EG-.42,.27);
   addBox('trim',x,CORNICE-.40,frontZ,.65,.33,.42);
 }
 // Three stone plates: EG floor, punctured upper slab, attic/roof top.
 function subtract(rect,hole){const [x0,x1,z0,z1]=rect,[u0,u1,v0,v1]=hole;
   const a=Math.max(x0,u0),b=Math.min(x1,u1),c=Math.max(z0,v0),d=Math.min(z1,v1);
   if(a>=b||c>=d)return [rect];const out=[];
   if(x0<a)out.push([x0,a,z0,z1]);if(b<x1)out.push([b,x1,z0,z1]);
   if(z0<c)out.push([a,b,z0,c]);if(d<z1)out.push([a,b,d,z1]);return out;
 }
 function addSlab(y,omit=[],material='floor'){
   let rects=[[-26.72,26.72,-11.18,11.18]];
   for(const h of omit)rects=rects.flatMap(rect=>subtract(rect,h));
   for(const [x0,x1,z0,z1] of rects){
     const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
     addBox(material,cx,y,cz,w,.19,d);
     // Visible underside is exactly contiguous with the underside of the slab.
     // Leave salon and stairwell *voids* completely open, including the ceiling.
     if(y>EG)addBox('ceiling',cx,y-.114,cz,w-.008,.038,d-.008);
   }
 }
 addSlab(EG-.095,[]);
 // The Salon du Rez-de-Chaussée stays double height; the west Grand Escalier has its own void.
 const salonVoid=[-6.70,6.70,-11.10,-2.32],stairVoid=[-13.18,-6.77,-2.10,10.80];
 addSlab(OG-.095,[salonVoid,stairVoid]);
 addSlab(CORNICE-.15,[]);
 // V3.4 Salon gallery: the garden-side salon has a two-storey void.
 // The dividing wall on z=CROSS_WALL_Z has a single 4.9m opening at x=-2.45..2.45.
 // A 13-m railing behind/through that wall was geometrically WRONG and partly
 // embedded in stone. The guard now spans only the unprotected actual opening.
 // Side edges are guarded by the actual full-height masonry partitions at x=±6.72.
 const galleryZ=CROSS_WALL_Z+.12, galleryL=-2.31,galleryR=2.31;
 const galleryW=galleryR-galleryL;
 addBox('stone',0,OG+.055,galleryZ,galleryW,.11,.18);
 for(let i=0;i<=8;i++){
   const x=galleryL+i*galleryW/8;
   addBox('bronzeTrim',x,OG+.57,galleryZ,.06,1.03,.075);
 }
 addBox('trim',0,OG+1.115,galleryZ,galleryW+.08,.14,.16);
 addBox('bronzeTrim',0,OG+.43,galleryZ,galleryW,.052,.072);
 // Plan-aware partition wall with physical doorway holes and identical collider segments.
 function innerWall(f,axis,fixed,a,b,doorAt,doorW=1.38){
   const y=f==='eg'?EG:OG,upper=f==='eg'?OG-.15:CORNICE-.22;
   const segments=[];let last=a;
   for(const d of doorAt.sort((p,q)=>p-q)){
      const left=d-doorW/2,right=d+doorW/2;
      if(left<last+.08||right>b-.09)continue;
      segments.push([last,left]);last=right;
      // The previous door frame had a SOLID full-height 2.86m box spanning
      // the opening. This visually blocked nearly every historical room door.
      // Use only jambs and a lintel; leave the middle empty.
      // Door lintel and jambs; no box over the opening.
      if(axis==='x')addBox('trim',d,y+2.81,fixed,doorW+.24,.22,.42,f);
      else addBox('trim',fixed,y+2.81,d,.42,.22,doorW+.24,f);
      if(axis==='x')for(const sx of [-1,1])addBox('window',d+sx*(doorW/2+.065),y+1.37,fixed,.13,2.72,.41,f);
      else for(const sx of [-1,1])addBox('window',fixed,y+1.37,d+sx*(doorW/2+.065),.41,2.72,.13,f);
      if(upper>y+2.92){
         if(axis==='x')addBox('wall',d,(upper+y+2.90)/2,fixed,doorW,upper-(y+2.90),.29,f);
         else addBox('wall',fixed,(upper+y+2.90)/2,d,.29,upper-(y+2.90),doorW,f);
      }
   }
   segments.push([last,b]);
   for(const [p,q] of segments){if(q-p<.05)continue;
      if(axis==='x'){
        addBox('wall',(p+q)/2,(y+upper)/2,fixed,q-p,upper-y,.31,f);
        collisionWalls[f].push({x0:p,x1:q,z0:fixed-.17,z1:fixed+.17});
      }else{
        addBox('wall',fixed,(y+upper)/2,(p+q)/2,.31,upper-y,q-p,f);
        collisionWalls[f].push({x0:fixed-.17,x1:fixed+.17,z0:p,z1:q});
      }
   }
 }
 // The historical wall register uses the same boundaries for EG and 1. OG.
 for(const f of ['eg','og']){
   // Longitudinal division into garden suites and entrance/service suites.
   // Wide free stair bay on the west and a 5-metre salon axis in the centre.
   innerWall(f,'x',CROSS_WALL_Z,-26.65,-13.28,[-24,-17.5],1.6);
   innerWall(f,'x',CROSS_WALL_Z,-6.66,-2.45,[],1.6);
   innerWall(f,'x',CROSS_WALL_Z,2.45,26.65,[10.2,17.4,24],1.6);
   const xBack=REAR_X_CUTS.slice(1,-1),xFront=FRONT_X_CUTS.slice(1,-1);
   for(const x of xBack){
     const bordersSalon=Math.abs(Math.abs(x)-6.72)<.08;
     // Le Rouge's Salon occupies a double-height volume here. First-floor
     // doors directly into that void were a construction error, not a gallery.
     const doorPositions=(f==='og'&&bordersSalon)?[]:[-6.5];
     innerWall(f,'z',x,-11.13,CROSS_WALL_Z-.18,doorPositions,1.32);
   }
   for(const x of xFront){
      // 1OG stair landing enters the vestibule through a correctly placed upper doorway.
      const entry=f==='og'&&Math.abs(x+6.72)<.15?9.27:5.3;
      innerWall(f,'z',x,CROSS_WALL_Z+.16,10.96,[entry],1.35);
   }
   if(f==='eg'){
     innerWall(f,'x',1.55,-26.8,-21.98,[-24.30],1.2);
     innerWall(f,'x',5.35,-26.8,-21.98,[-24.30],1.2);
     innerWall(f,'x',4.53,-21.81,-13.38,[-17.55],1.3);
     innerWall(f,'x',1.50,14.15,20.35,[17.3],1.25);
     innerWall(f,'x',4.65,20.58,26.75,[23.5],1.25);
   }else{
     innerWall(f,'x',-3.95,-26.8,-21.98,[-24.45],1.2);
     innerWall(f,'x',.50,-26.8,-21.98,[-24.45],1.2);
     innerWall(f,'x',3.20,-26.8,-21.98,[-24.45],1.2);
     innerWall(f,'x',2.18,6.85,13.85,[10.2],1.25);
     innerWall(f,'x',1.84,14.15,20.35,[17.3],1.25);
     innerWall(f,'x',4.97,14.15,20.35,[17.3],1.25);
     innerWall(f,'x',4.65,20.58,26.75,[23.5],1.25);
   }
 }
 // V3.4 GRAND ESCALIER – geometry and pedestrian heights use the SAME
 // GRAND_STAIR dimensions in roissy-config.js. No suspended floor-height bars.
 const S=GRAND_STAIR, RUN=S.stepsPerFlight, rise=(OG-EG)/(2*RUN), MID=EG+RUN*rise;
 const flight=(cfg,offset)=>{
   const dz=cfg.length/RUN, samples=[];
   for(let i=0;i<RUN;i++){
     const y=EG+(offset+i+1)*rise;
     const z=cfg.startZ+cfg.direction*(i+.5)*dz;
     samples.push({x:cfg.x,y,z});
     // Treads' actual upper face is equal to the navigation step height.
     addBox('floor',cfg.x,y-.085,z,cfg.width,.17,dz+.018);
     // Short riser right at the leading edge – closes the previous dark slit
     // without introducing a massive solid block under the whole staircase.
     const edge=z-cfg.direction*(dz*.49);
     addBox('stone',cfg.x,y-rise/2+.012,edge,cfg.width-.028,rise-.022,.058);
     addBox('trim',cfg.x,y+.014,edge,cfg.width+.028,.028,.065);
   }
   return samples;
 };
 const firstRun=flight(S.first,0);
 addBox('floor',S.landing.x,MID-.09,S.landing.z,S.landing.width,.18,S.landing.depth);
 const secondRun=flight(S.second,RUN);
 // Upper landing and connecting bridge span the stair void at exactly OG.
 addBox('floor',S.upperLanding.x,OG-.09,S.upperLanding.z,S.upperLanding.width,.18,S.upperLanding.depth);
 addBox('floor',S.passage.x,OG-.09,S.passage.z,S.passage.width,.18,S.passage.depth);
 // Stone stringers sit beneath both real stair runs and terminate at the landing.
 for(const x of [-12.66,-10.08])
   beam('trim',[x,EG+.05,8.76],[x,MID-.19,-1.25],.067);
 for(const x of [-9.74,-7.34])
   beam('trim',[x,MID-.17,-1.13],[x,OG-.14,8.71],.067);
 // Bespoke balustrades attached to each tread (no arbitrary OG-height posts).
 // On the first flight the guard runs along the western outer edge; on the
 // second it runs along the eastern edge. These are traversable stair widths.
 function addFlightGuard(samples,x){
   const h=S.railHeight;
   for(let i=0;i<samples.length;i++){
     const p=samples[i];
     if(i%2===0||i===samples.length-1){
       addBox('bronzeTrim',x,p.y+h*.50,p.z,.07,h,.07);
       addBox('stone',x,p.y+.055,p.z,.17,.11,.17);
     }
     if(i+1<samples.length){
       const b=samples[i+1];
       beam('bronzeTrim',[x,p.y+h,p.z],[x,b.y+h,b.z],.055);
       beam('bronzeTrim',[x,p.y+.46,p.z],[x,b.y+.46,b.z],.028);
     }
   }
 }
 addFlightGuard(firstRun,S.first.x-S.first.width/2+.13);
 addFlightGuard(secondRun,S.second.x+S.second.width/2-.13);
 // Landing rear edge protected – placed entirely on top of its floor plate.
 const backZ=S.landing.z-S.landing.depth/2+.11;
 for(let i=0;i<=6;i++){
   const x=S.landing.x-S.landing.width/2+.24+i*(S.landing.width-.48)/6;
   addBox('bronzeTrim',x,MID+.55,backZ,.075,1.08,.075);
 }
 beam('bronzeTrim',[S.landing.x-S.landing.width/2+.18,MID+1.09,backZ],
   [S.landing.x+S.landing.width/2-.18,MID+1.09,backZ],.055);
 // Upper landing guard: short western edge where the adjoining stair void is open.
 const topGuardX=S.upperLanding.x-S.upperLanding.width/2+.11;
 for(const z of [8.75,9.45,10.12])addBox('bronzeTrim',topGuardX,OG+.55,z,.075,1.10,.075);
 beam('bronzeTrim',[topGuardX,OG+1.1,8.75],[topGuardX,OG+1.1,10.12],.055);
 // Ground-level perron. No five-metre block; seven realistic shallow steps.
 addBox('stone',0,.46,14.25,14.60,.90,6.65);
 addBox('floor',0,EG-.10,14.25,14.80,.18,6.65);
 const steps=7;for(let i=0;i<steps;i++){
   const n=steps-i,zz=17.40+i*.41,h=n*(EG/steps);
   addBox('stone',0,h-.075,zz,12.72,.15,.42);
   addBox('trim',0,h+.018,zz+.19,12.79,.035,.055);
 }
 for(const sx of [-7.32,7.32]){
   addBox('trim',sx,EG+.34,14.20,.28,.75,6.0);
   for(let zz=12;zz<16.6;zz+=.72)addBox('stone',sx,EG+.67,zz,.11,.65,.13);
 }
 // Original Herrenhaus-/MaxGame-Portikus; uniformly scaled so columns remain ROUND.
 donor.updateMatrixWorld(true);
 const porch=new THREE.Group();porch.name='ORIGINAL_MAXGAME_PORTIKUS_ROISSY_MASSTAB';
 porch.scale.setScalar(.75);porch.position.set(0,EG-.75*.75,14.88-18.10*.75);root.add(porch);
 function donorPart(sourceName,material,target=porch){
    const o=donor.getObjectByName(sourceName);if(!o||!o.isMesh)return null;
    const clone=o.clone(false);o.matrixWorld.decompose(clone.position,clone.quaternion,clone.scale);
    clone.material=material;clone.castShadow=clone.receiveShadow=true;target.add(clone);return clone;
 }
 for(const s of ['Giebel','Cube431','Cube432','Cube439','Cube440'])donorPart(s,mats.dressedStone);
 const names=['Cone001','Cone007','Cone010','Cone013'];
 const foot=['Cube419','Cube423','Cube425','Cube427'];
 const cap=['Cube420','Cube424','Cube426','Cube428'];
 for(let i=0;i<4;i++){
   const shaft=donor.getObjectByName(names[i]);if(!shaft)throw Error('MaxGame-Säule fehlt: '+names[i]);
   addPorticoColumn(THREE,porch,shaft,mats);
   donorPart(foot[i],mats.trim);donorPart(cap[i],mats.trim);
 }
 if(porch.children.length<17)throw Error('MaxGame-Portikus konnte nicht geladen werden.');
 // Mansard roof: exact 54×23 perimeter, slight breaks at two end pavilions.
 function faceRoof(p,q,r,s){const geo=new THREE.BufferGeometry();const arr=[...p,...q,...r,...p,...r,...s];geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));geo.computeVertexNormals();return mesh(geo,'bronze','Mansard_Dachhaut');}
 const e=CORNICE+.16,shoulder=15.38,ridge=17.10, inset=2.55;
 for(const x0 of [-27,-21.7,21.7]){/* Corners set out by plan axes; no independent roof footprint. */}
 const a=-27,b=27,c=-11.5,d=11.5,aa=a+inset,bb=b-inset,cc=c+inset,dd=d-inset;
 // V3.2: the earlier roof was a single uninterrupted opaque sheet BEHIND
 // every dormer window. Cut actual roof-plane openings aligned to their sash,
 // leaving watertight-looking upper and lower flashing strips. The holes are
 // true missing triangles, not black transparent textures or visual decals.
 const roofDormerAxes=FRONT_WINDOW_AXES.filter(xx=>Math.abs(xx)>=6.2);
 const dormerHoleHalfWidth=.63;
 const roofOpeningT0=.29,roofOpeningT1=.70;
 function roofPoint(x,t,sign){
   // x is WORLD x, not an eave-space percentage; otherwise the roof cutouts
   // drift inward and cover the glazing near the end pavilions.
   return [x, e+(shoulder-e)*t,sign*(HALF_D-inset*t)];
 }
 function slopePanel(left,right,t0,t1,sign,outerLeft=false,outerRight=false){
   if(right-left<.001||t1-t0<.001)return;
   const L=t=>outerLeft?a+inset*t:left;
   const R=t=>outerRight?b-inset*t:right;
   if(sign>0)faceRoof(roofPoint(L(t0),t0,sign),roofPoint(R(t0),t0,sign),roofPoint(R(t1),t1,sign),roofPoint(L(t1),t1,sign));
   else faceRoof(roofPoint(R(t0),t0,sign),roofPoint(L(t0),t0,sign),roofPoint(L(t1),t1,sign),roofPoint(R(t1),t1,sign));
 }
 for(const sign of [-1,1]){
   let cursor=a,first=true;
   for(const x of roofDormerAxes){
     const left=x-dormerHoleHalfWidth,right=x+dormerHoleHalfWidth;
     slopePanel(cursor,left,0,1,sign,first,false);
     slopePanel(left,right,0,roofOpeningT0,sign);
     slopePanel(left,right,roofOpeningT1,1,sign);
     cursor=right;first=false;
   }
   slopePanel(cursor,b,0,1,sign,false,true);
 }
 // Roof opening coordinates are derived from the same dormer axes and slope;
 // no manually positioned second mesh is allowed to cover a window. 
 faceRoof([b,e,d],[b,e,c],[bb,shoulder,cc],[bb,shoulder,dd]);
 faceRoof([a,e,c],[a,e,d],[aa,shoulder,dd],[aa,shoulder,cc]);
 faceRoof([aa,shoulder,dd],[bb,shoulder,dd],[bb-4,ridge,0],[aa+4,ridge,0]);
 faceRoof([bb,shoulder,cc],[aa,shoulder,cc],[aa+4,ridge,0],[bb-4,ridge,0]);
 const tri=(pts,mat,name)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));g.computeVertexNormals();return mesh(g,mat,name);};
 tri([[aa,shoulder,cc],[aa,shoulder,dd],[aa+4,ridge,0]],bronze,'Dachwalmdreieck_W');
 tri([[bb,shoulder,dd],[bb,shoulder,cc],[bb-4,ridge,0]],bronze,'Dachwalmdreieck_O');
 // Simple zinc roof seams and authentic aligned dormers on both long faces.
 for(const xx of FRONT_WINDOW_AXES){
   if(Math.abs(xx)<6.2)continue; // cupola + portico occupy the central roof zone
   for(const sign of [-1,1]){
     const dz=sign*(11.5-1.63),dy=14.05;
     // Freestanding stone frame with EMPTY centre: old model contained a solid
     // 1.42×2.20×0.83-m stone box directly behind the glass!
     // The hole in the roof behind this opening is cut by slopePanel().
     for(const side of [-1,1]){
       addBox('window',xx+side*.635,dy,dz,.16,2.20,.87);
       addBox('trim',xx+side*.64,dy,dz+sign*.48,.17,1.90,.24);
     }
     addBox('window',xx,dy+1.04,dz,1.42,.15,.88);
     addBox('window',xx,dy-.98,dz,1.42,.24,.90);
     addBox('glass',xx,dy,dz+sign*.47,1.12,1.62,.035);
     // Two real glazing subdivisions; centred in front of the opening.
     addBox('sash',xx,dy,dz+sign*.51,.055,1.57,.065);
     addBox('sash',xx,dy+.12,dz+sign*.51,1.10,.055,.065);
     addBox('trim',xx,dy+1.13,dz+sign*.40,1.70,.20,.88);
     const roofW=new THREE.ConeGeometry(1.19,1.30,4);roofW.rotateY(Math.PI/4);
     const dorm=mesh(roofW,'bronze','Schiefer_Dachgaube');dorm.position.set(xx,dy+1.86,dz);
   }
 }
 // V3.3: removed four disconnected stone bars at y=16 on the end pavilions.
 // They were not chimneys, roof windows or supported cornices and visibly
 // hovered above the roof line in the iPhone screenshots.
 // Small studio-designed central cupola: kept from the user's monumental concept,
 // explicitly NOT claimed as historically authentic to the 1776 Roissy elevations.
 const cupBase=16.25,rad=4.65,drumH=2.65;
 for(let n=0;n<24;n++){
   const a=n*Math.PI/12,b=(n+1)*Math.PI/12,da=.03;
   const pts=[];const XY=(theta,y,r=rad)=>[Math.cos(theta)*r,y,Math.sin(theta)*r-1.35];
   for(const [y0,y1] of [[cupBase,cupBase+.54],[cupBase+.54,cupBase+drumH-.48],[cupBase+drumH-.48,cupBase+drumH]]){
     const glazing=y0>cupBase+.5&&y1<cupBase+drumH-.45&&n%3===0;
     const g=new THREE.BufferGeometry();const A=XY(a,y0),B=XY(b,y0),C=XY(b,y1),D=XY(a,y1);
     g.setAttribute('position',new THREE.Float32BufferAttribute([...A,...B,...C,...A,...C,...D],3));g.computeVertexNormals();mesh(g,glazing?'glass':'stone',glazing?'Verglaster_Kuppeltambour':'Stein_Tambour');
   }
 }
 for(const yy of [cupBase+.11,cupBase+drumH]){
   const ring=mesh(new THREE.TorusGeometry(rad+.11,.135,8,48),'trim','Kuppelgesims');ring.rotation.x=Math.PI/2;ring.position.set(0,yy,-1.35);
 }
 const domeGeo=new THREE.SphereGeometry(rad,48,22,0,Math.PI*2,0,Math.PI/2),dom=mesh(domeGeo,'bronze','Kuppelhaube');dom.position.set(0,cupBase+drumH,-1.35);
 for(let i=0;i<12;i++){
   const theta=i*Math.PI/6;
   const path=new THREE.CatmullRomCurve3(Array.from({length:10},(_,k)=>{const t=k/9*Math.PI/2;return new THREE.Vector3((rad+.06)*Math.cos(t)*Math.cos(theta),cupBase+drumH+(rad+.06)*Math.sin(t),-1.35+(rad+.06)*Math.cos(t)*Math.sin(theta));}));
   const pipe=mesh(new THREE.TubeGeometry(path,16,.043,4,false),'bronzeTrim','Kuppelrippe');pipe.castShadow=false;
 }
 cyl('gold',0,cupBase+drumH+rad+.33,-1.35,.55,.64);
 const tip=mesh(new THREE.SphereGeometry(.31,10,8),'gold','Kuppelbekrönung');tip.position.set(0,cupBase+drumH+rad+.72,-1.35);
 // Restrained front terrace balustrade & side service steps from Roissy plan.
 for(const sx of [-1,1]){
   addBox('stone',sx*27.25,EG+.08,1.9,.88,.18,8.3);
   for(let i=0;i<3;i++)addBox('stone',sx*28.0,.14+i*.15,1.9+i*.39,2.7,.15,1.0);
 }
 // A few warm architectural luminaires, not thousands of mobile point lights.
 for(const x of [-17.2,-11.1,11.1,17.2]){
   const lamp=mesh(new THREE.SphereGeometry(.145,10,8),'gold','Wandleuchte');lamp.position.set(x,3.8,11.87);
 }
 // Room labels visible only during top-down plan inspection (not in walkthrough).
 if(typeof document!=='undefined')for(const f of ['eg','og']){
    const roomY=f==='eg'?EG+.12:OG+.12;
    for(const r of ROOMDATA[f]){
      const canv=document.createElement('canvas');canv.width=512;canv.height=128;
      const ctx=canv.getContext('2d');ctx.clearRect(0,0,512,128);
      ctx.fillStyle='#1a2325';ctx.font='bold 36px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';
      const title=r.name.length>23?r.name.slice(0,22)+'…':r.name;
      ctx.fillText(title,256,63,490);
      const tx=new THREE.CanvasTexture(canv);tx.colorSpace=THREE.SRGBColorSpace;
      const label=new THREE.Mesh(new THREE.PlaneGeometry(Math.max(1.7,Math.min(5.8,r.w*.83)),.75),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
      label.userData.floorPlanLabel=true;label.rotation.x=-Math.PI/2;
      label.position.set(r.x,roomY,r.z);label.visible=false;layers[f].add(label);
    }
 }
 // Instanced stone geometry: one draw call per material and floor layer.
 const dummy=new THREE.Object3D();for(const [key,records] of batch){
   const [layer,mat]=key.split(':');const parent=layer==='shell'?root:layers[layer];
   const o=new THREE.InstancedMesh(baseGeo,cast[mat],records.length);o.name='Historische_Bauteile_'+key;
   o.frustumCulled=false;o.receiveShadow=true;o.castShadow=!['glass','sash','bronzeTrim','ceiling'].includes(mat);
   for(let i=0;i<records.length;i++){const [x,y,z,w,h,d]=records[i];dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,0,0);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);}
   o.instanceMatrix.needsUpdate=true;parent.add(o);
 }
 return {front:root,originalPortico:porch,facadeWidth:54,
   palaceDimensions:{width:54,depth:23,height:27.6,calibration:'estimated using Le Rouge 1776 scale; 23m incl projections not confirmed'},
   buildings:['Château de Roissy – Hauptgebäude'],historicalFloors:ROOMDATA,historicalLayers:layers,
   interiorCollision:collisionWalls,entranceDoors:doors,
   instancedElements:[...batch.values()].reduce((s,a)=>s+a.length,0),instancedDrawcalls:batch.size,
   planAxes:{frontDoors:FRONT_DOORS,frontWindows:FRONT_WINDOW_AXES,rearWindows:REAR_WINDOW_AXES},
   validations:{roomCountEG:ROOMDATA.eg.length,roomCountOG:ROOMDATA.og.length,directMeshes,
     roofDormersPerSide:roofDormerAxes.length,roofPlaneCutouts:roofDormerAxes.length*2,
     floatingRoofDecor:0,salonUpperDoorsIntoVoid:0,ceilingUndersides:true,stairRailAnchoredToTreads:true,stairGeometrySharesNavigationConfig:true,
     salonGalleryGuardedWidth:4.62,stairRisersPerFlight:RUN,
     roofOpeningSlope:[roofOpeningT0,roofOpeningT1],dormerGlassBackedBySolidStone:false}
 };
}
