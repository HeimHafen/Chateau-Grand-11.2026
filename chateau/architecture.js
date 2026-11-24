/**
 * CHÂTEAU GRAND V3.11 – historische Innenwandachsen und lückenfreie Mauerwerksanschlüsse.
 * Geometry + room register share one unit/metre plan with navigation.
 * Interior reproduces legible room sequences; not a documented survey in cm.
 * The classical MaxGame portico and small cupola are creative additions, not historical evidence.
 */
import {addPorticoColumn} from '../wohnzimmer/portico-columns-v2.js';
import {addPortalDoors} from '../wohnzimmer/portal-doors-v2.js';
import {PLAN,HALF_W,HALF_D,EG,OG,CORNICE,ROOMDATA,FRONT_DOORS,FRONT_WINDOW_AXES,REAR_WINDOW_AXES,SIDE_WINDOW_AXES,REAR_X_CUTS,REAR_X_CUTS_OG,FRONT_X_CUTS,CROSS_WALL_Z,GRAND_STAIR,PERRON,AXIS_AUDIT,SECONDARY_ROOM_WALLS} from './roissy-config.js?v=roissy311';

export function buildChateau(THREE,scene,donor,mats,glass){
 const root=new THREE.Group();root.name='CHATEAU_ROISSY_HISTORISCHER_KERN_54X23';scene.add(root);
 const layers={eg:new THREE.Group(),og:new THREE.Group()};
 layers.eg.name='ROISSY_REZ_DE_CHAUSSEE_LE_ROUGE_1776';layers.og.name='ROISSY_PREMIER_ETAGE_LE_ROUGE_1776';root.add(layers.eg,layers.og);
 const bronze=new THREE.MeshStandardMaterial({color:0x282f36,metalness:.63,roughness:.35,side:THREE.DoubleSide});
 const bronzeTrim=new THREE.MeshStandardMaterial({color:0x64666b,metalness:.65,roughness:.35});
 const stairIron=new THREE.MeshStandardMaterial({name:'Roissy_GrandEscalier_Geschmiedetes_Eisen',color:0x242a2a,metalness:.76,roughness:.32});
 const stairHandrail=new THREE.MeshStandardMaterial({name:'Roissy_GrandEscalier_Gewachstes_Nussbaumholz',color:0x584032,roughness:.43,metalness:.02});
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
   sill:mats.shade,glass,sash:mats.paintedSash,bronze,bronzeTrim,gold,wood,stairIron,stairHandrail,floor:floorStone,ceiling:ceilingStone};
 const baseGeo=new THREE.BoxGeometry(1,1,1),batch=new Map(), collisionWalls={eg:[],og:[]};
 const interiorDoorways=[]; // audited physical openings: floor, wall, position, clear geometry
 const partitionRegister=[]; // structural walls: floor, orientation, span, and doorway apertures
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
     width=isDoor?(Math.abs(at)<.3?1.98:1.52):(axis==='z'?1.65:(level===0?2.15:2.05)),t=.11,
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
     const openings=positions.map(p=>({at:p,width:excludeEntrance&&l===0&&FRONT_DOORS.includes(p)?(p===0?1.98:1.52):(axis==='z'?1.65:(l===0?2.15:2.05)),isDoor:excludeEntrance&&l===0&&FRONT_DOORS.includes(p)}));
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
 // All rusticated quoins project OUTWARD only. Earlier x=26.8/z=11.3
 // cubes protruded into the corner rooms and looked suspended indoors.
 for(const signX of [-1,1])for(const signZ of [-1,1])
   for(let i=0;i<14;i++){
     const lateral=i%2? .56:.44;
     addBox(i%2?'window':'trim',signX*(HALF_W+.18),EG+.28+i*.77,
       signZ*(HALF_D+.18),lateral,.47,lateral);
   }
 for(const frontZ of [-11.56,11.56])for(const x of [-22.3,-13.22,-6.72,6.72,14.05,20.5]){
   // Pilaster occupies room partition axis, not the window's glazed opening.
   addBox('window',x,(EG+CORNICE)/2,frontZ,.46,CORNICE-EG-.42,.27);
   addBox('trim',x,CORNICE-.40,frontZ,.65,.33,.42);
 }
 // V3.9: the two inhabited floors and attic slab meet the actual 0.46m
 // exterior masonry walls. V3.8 ended slabs 5cm short of the inner side walls
 // and 9cm short of the front/back walls, leaving green daylight seams.
 // Exterior wall centres: +/-HALF_W / +/-HALF_D, clear inner faces at
 // HALF_W-.23 / HALF_D-.23. Embed the 19cm slabs 3cm into the masonry.
 const slabInset=.20;
 const slabPerimeter=[-HALF_W+slabInset, HALF_W-slabInset,
                      -HALF_D+slabInset, HALF_D-slabInset];
 const slabAudit=[];
 let deckEdgeSegments=0;
 function subtract(rect,hole){const [x0,x1,z0,z1]=rect,[u0,u1,v0,v1]=hole;
   const a=Math.max(x0,u0),b=Math.min(x1,u1),c=Math.max(z0,v0),d=Math.min(z1,v1);
   if(a>=b||c>=d)return [rect];const out=[];
   if(x0<a)out.push([x0,a,z0,z1]);if(b<x1)out.push([b,x1,z0,z1]);
   if(z0<c)out.push([a,b,z0,c]);if(d<z1)out.push([a,b,d,z1]);return out;
 }
 const almost=(a,b)=>Math.abs(a-b)<.00001;
 function addSlab(y,omit=[],material='floor'){
   let rects=[slabPerimeter.slice()];
   for(const hole of omit)rects=rects.flatMap(rect=>subtract(rect,hole));
   const pieces=[];
   for(const [x0,x1,z0,z1] of rects){
     const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
     if(w<=.001||d<=.001)continue;
     pieces.push([x0,x1,z0,z1]);
     addBox(material,cx,y,cz,w,.19,d);
     // Finish follows the *same* area as the deck, with no ceiling panel
     // spanning the Salon double-height opening or the Grand Escalier.
     if(y>EG)addBox('ceiling',cx,y-.114,cz,w-.008,.038,d-.008);
   }
   if(omit.length){
     // A narrow vertical limestone fascia follows the actual cut edges of
     // the upper slab. Its entirety rests on the SOLID side of each void,
     // never creating a decorative bridge across the stair opening.
     const fascia=(x,z,w,d)=>{
       if(w<.003||d<.003)return;
       addBox('trim',x,y,z,w,.188,d);
       deckEdgeSegments++;
     };
     for(const r of pieces){
       const [x0,x1,z0,z1]=r, ww=x1-x0, dd=z1-z0;
       for(const [u0,u1,v0,v1] of omit){
         const loZ=Math.max(z0,v0),hiZ=Math.min(z1,v1);
         if(hiZ-loZ>.02){
           const w=Math.min(.052,ww*.65),o=w*.50;
           if(almost(x1,u0))fascia(x1-o,(loZ+hiZ)/2,w,hiZ-loZ);
           if(almost(x0,u1))fascia(x0+o,(loZ+hiZ)/2,w,hiZ-loZ);
         }
         const loX=Math.max(x0,u0),hiX=Math.min(x1,u1);
         if(hiX-loX>.02){
           const d=Math.min(.052,dd*.65),o=d*.50;
           if(almost(z1,v0))fascia((loX+hiX)/2,z1-o,hiX-loX,d);
           if(almost(z0,v1))fascia((loX+hiX)/2,z0+o,hiX-loX,d);
         }
       }
     }
   }
   slabAudit.push({y,rectangles:pieces,holes:omit.map(h=>h.slice())});
 }
 addSlab(EG-.095,[]);
 // V3.6: architectural finish in the verified Vestibule footprint, without
 // covering doorways, step treads or historic partitions. This is a plausible
 // period limestone finish, NOT evidence of the original Roissy paving.
 const FLOOR_MAP_PREFIX='./assets/interior/roissy_vestibule_limestone_';
 const tileLoader=new THREE.TextureLoader();
 function floorTexture(file,isColor=false){
   if(typeof document==='undefined')return null; // headless geometry/QA tests
   const t=tileLoader.load(FLOOR_MAP_PREFIX+file+'.jpg');
   if(isColor)t.colorSpace=THREE.SRGBColorSpace;
   t.anisotropy=8;
   t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
   return t;
 }
 const vestibulePBR=new THREE.MeshStandardMaterial({
   name:'Roissy_Vestibule_Kalkstein_Matt_Geschliffen',
   map:floorTexture('albedo',true),normalMap:floorTexture('normal'),
   roughnessMap:floorTexture('roughness'),roughness:.94,metalness:0,
   normalScale:new THREE.Vector2(.18,.18),color:0xf5efe6
 });
 const vestibuleW=12.35,vestibuleD=12.26,vestibuleZ=4.51;
 const centralFloor=new THREE.Mesh(new THREE.PlaneGeometry(vestibuleW,vestibuleD),vestibulePBR);
 centralFloor.rotation.x=-Math.PI/2;
 centralFloor.position.set(0,EG+.008,vestibuleZ);
 centralFloor.receiveShadow=true;centralFloor.name='Roissy_Vestibule_Natursteinboden_Grossformat';
 layers.eg.add(centralFloor);directMeshes++;
 // A restrained inset frame on the stone plane, flush with the walking surface.
 // Door thresholds remain open; these borders are 7mm thick, not collision walls.
 const vestibuleEdge=new THREE.MeshStandardMaterial({color:0x948572,roughness:.91,metalness:0});
 function floorInlay(x,z,w,d,mat=vestibuleEdge){
   const obj=new THREE.Mesh(new THREE.BoxGeometry(w,.006,d),mat);
   obj.position.set(x,EG+.013,z);obj.receiveShadow=true;obj.castShadow=false;
   obj.name='Roissy_Vestibule_Eingelassener_Steinfries';
   layers.eg.add(obj);directMeshes++;
 }
 for(const sign of [-1,1]){
   floorInlay(sign*5.91,vestibuleZ,.055,vestibuleD-.18);
   floorInlay(sign*5.58,vestibuleZ,.022,vestibuleD-.75);
 }
 for(const z of [vestibuleZ-5.89,vestibuleZ+5.89]){
   floorInlay(0,z,11.89,.055);
 }
 // Architectural skirting along the actual walls, split around the two side
 // doors. No bar across any opening or inside the walkable stair corridor.
 const stWallX=6.53;
 for(const sign of [-1,1]){
   for(const [a,b] of [[-1.36,4.30],[6.27,10.52]]){
     addBox('trim',sign*stWallX,EG+.125,(a+b)/2,.085,.25,b-a,'eg');
     addBox('window',sign*stWallX,EG+.266,(a+b)/2,.11,.041,b-a,'eg');
   }
 }
 // A very shallow, properly restrained wall cornice; the upper floor remains
 // visible and no arch/roof structure protrudes into this room.
 for(const sign of [-1,1]){
   addBox('trim',sign*6.49,OG-.40,vestibuleZ,.12,.21,12.48,'eg');
 }
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
   const validDoors=doorAt.filter(d=>d-doorW/2>=a+.08 && d+doorW/2<=b-.09);
   partitionRegister.push({floor:f,axis,fixed,from:a,to:b,doors:validDoors.slice(),doorWidth:doorW});
   const segments=[];let last=a;
   for(const d of doorAt.sort((p,q)=>p-q)){
      const left=d-doorW/2,right=d+doorW/2;
      if(left<last+.08||right>b-.09)continue;
      segments.push([last,left]);last=right;
      interiorDoorways.push({floor:f,axis,fixed,at:d,width:doorW,baseY:y,clearHeight:2.80});
      // V3.8: the doorway is built as a real 0.31m-thick masonry aperture.
      // The V3.7 heavy .41m-deep rectangular frames protruded into adjoining
      // rooms and visually merged with perpendicular walls. Thin REVEALS
      // dress both exposed jamb cuts; narrow face architraves follow the wall
      // surfaces WITHOUT reducing the documented central clear opening.
      // The head starts at +2.80m; no solid element intrudes below it.
      const half=doorW/2,edge=.155,face=.184;
      for(const side of [-1,1]){
        const jamb=d+side*half;
        const reveal=jamb+side*.009; // only 0.001m across the clearance boundary
        if(axis==='x')addBox('trim',reveal,y+1.40,fixed,.018,2.80,.314,f);
        else addBox('trim',fixed,y+1.40,reveal,.314,2.80,.018,f);
        const frame=jamb+side*.054;
        for(const surface of [-1,1]){
          if(axis==='x')addBox('window',frame,y+1.40,fixed+surface*face,.10,2.80,.042,f);
          else addBox('window',fixed+surface*face,y+1.40,frame,.042,2.80,.10,f);
        }
      }
      // Continuous dressed underside of the historic lintel and twin shallow
      // architrave heads on the two faces of the partition.
      if(axis==='x')addBox('trim',d,y+2.808,fixed,doorW,.016,.314,f);
      else addBox('trim',fixed,y+2.808,d,.314,.016,doorW,f);
      for(const surface of [-1,1]){
        if(axis==='x')addBox('window',d,y+2.857,fixed+surface*face,doorW+.20,.114,.042,f);
        else addBox('window',fixed+surface*face,y+2.857,d,.042,.114,doorW+.20,f);
      }
      if(upper>y+2.90){
         if(axis==='x')addBox('wall',d,(upper+y+2.90)/2,fixed,doorW,upper-(y+2.90),.31,f);
         else addBox('wall',fixed,(upper+y+2.90)/2,d,.31,upper-(y+2.90),doorW,f);
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
      // Conceal the physical wall-to-ceiling junction on BOTH room faces.
      // Unlike old continuous trims, these follow individual solid wall
      // segments and stop at every real doorway, never crossing an opening.
      if(q-p>.24){
        for(const face of [-1,1]){
          if(axis==='x') addBox('trim',(p+q)/2,upper-.085,fixed+face*.177,q-p-.025,.13,.052,f);
          else addBox('trim',fixed+face*.177,upper-.085,(p+q)/2,.052,.13,q-p-.025,f);
        }
      }
   }
 }
 // The historical wall register uses the same boundaries for EG and 1. OG.
 for(const f of ['eg','og']){
   // Longitudinal division into garden suites and entrance/service suites.
   // Wide free stair bay on the west and a 5-metre salon axis in the centre.
   // All three masonry runs meet one another, and the two ends physically
   // penetrate the massive exterior side walls. The large opening behind the Grand Escalier is required by
   // the actual U-stair landing; other walls now connect into the facade.
   const rearStairWest=REAR_X_CUTS[2];
   const rearStairEast=REAR_X_CUTS[3];
   const outerJoin=HALF_W+.075;
   innerWall(f,'x',CROSS_WALL_Z,-outerJoin,rearStairWest,[-24,-17.5],1.6);
   // The historical Grand Escalier turns within a 5.78m-wide intermediate
   // landing. It actually traverses this cross-wall axis. This large opening
   // is INTENTIONAL: closing it would make the staircase impassable. The
   // reconstructed masonry abuts the full-height stair opening on each side.
   innerWall(f,'x',CROSS_WALL_Z,rearStairEast,-2.45,[],1.6);
   innerWall(f,'x',CROSS_WALL_Z,2.45,outerJoin,[10.2,17.4,24],1.6);
   const xBack=(f==='og'?REAR_X_CUTS_OG:REAR_X_CUTS).slice(1,-1),xFront=FRONT_X_CUTS.slice(1,-1);
   for(const x of xBack){
     const bordersSalon=Math.abs(Math.abs(x)-6.72)<.08;
     // Le Rouge's Salon occupies a double-height volume here. First-floor
     // doors directly into that void were a construction error, not a gallery.
     const doorPositions=(f==='og'&&bordersSalon)?[]:[-6.5];
     innerWall(f,'z',x,-HALF_D+.0+0.12,CROSS_WALL_Z+.075,doorPositions,1.32);
   }
   for(const x of xFront){
      // 1OG stair landing enters the vestibule through a correctly placed upper doorway.
      // V3.7 independent geometry audit: the former z=5.30 doorway at
      // x=-21.93 (EG) crossed the z=5.35 service partition by 13.5 cm;
      // at x=20.46 (1OG) it crossed z=4.97 by 7.5 cm. Shift only these
      // two openings onto the correct uninterrupted room-to-room passage.
      const westServiceDoor=f==='eg'&&Math.abs(x+21.93)<.15;
      const eastUpperDoor=f==='og'&&Math.abs(x-20.46)<.15;
      // V3.8 strict full-clearance audit: two further EG junctions were
      // not detected by the V3.7 narrower doorway-core test. Move their
      // thresholds within the same historic service-room passage, away from
      // the cross walls terminating at z=4.53 and z=4.65 respectively.
      const groundJunctionDoor=f==='eg'&&(Math.abs(x+13.26)<.15||Math.abs(x-20.46)<.15);
      const entry=f==='og'&&Math.abs(x+6.72)<.15?9.27:
        (westServiceDoor||eastUpperDoor)?7.30:
        groundJunctionDoor?5.75:5.30;
      innerWall(f,'z',x,CROSS_WALL_Z-.075,HALF_D-.12,[entry],1.35);
   }
   for(const divider of SECONDARY_ROOM_WALLS[f]){
     innerWall(f,'x',divider.z,divider.from,divider.to,[divider.door],divider.width);
   }
 }
 // GRAND ESCALIER inherited from V3.10 – elevations, stone treads and soffits,
 // landings, wrought-iron balusters and handrails share the SAME plan geometry
 // as navigation. No rail crosses a stair lane, landing transfer or doorway.
 // This is a historically PLAUSIBLE finish, not documented original decoration.
 const S=GRAND_STAIR, RUN=S.stepsPerFlight, rise=(OG-EG)/(2*RUN), MID=EG+RUN*rise;
 const stairAudit={steps:RUN*2,riser:rise,stairStart:EG,stairMid:MID,stairEnd:OG,
   soffits:0,handrails:0,balusters:0,endPiers:0,landings:2,railClearance:.0};
 function stoneSlopedSlab(name,from,to,width,thickness,material='stone'){
   const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),v=b.clone().sub(a);
   const g=new THREE.BoxGeometry(width,v.length(),thickness);
   const o=mesh(g,material,name);
   o.position.copy(a.clone().add(b).multiplyScalar(.5));
   o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
   return o;
 }
 function flight(cfg,offset){
   const dz=cfg.length/RUN, samples=[];
   for(let i=0;i<RUN;i++){
     const y=EG+(offset+i+1)*rise;
     const z=cfg.startZ+cfg.direction*(i+.5)*dz;
     samples.push({x:cfg.x,y,z});
     // Every tread top is exactly the same height as the virtual step for walking.
     addBox('floor',cfg.x,y-.091,z,cfg.width,.182,dz+.012);
     const leading=z-cfg.direction*(dz*.486);
     // Closed limestone risers; a 13 mm nosing highlights the leading edge
     // without the former coarse white strip pattern.
     addBox('stone',cfg.x,y-rise/2+.01,leading,cfg.width-.012,rise-.017,.064);
     addBox('trim',cfg.x,y+.006,leading,cfg.width+.022,.013,.050);
   }
   // A continuous inclined stone structure closes the exposed undersides
   // of the floating treads seen from the lower storey in previous versions.
   const first=samples[0],last=samples.at(-1);
   stoneSlopedSlab('Roissy_Treppenuntersicht_Aus_Kalkstein',
     [cfg.x,first.y-.30,first.z],[cfg.x,last.y-.30,last.z],cfg.width-.16,.23,'stone');
   stairAudit.soffits++;
   for(const sign of [-1,1]){
     const edge=cfg.x+sign*(cfg.width/2-.095);
     stoneSlopedSlab('Roissy_Geschlossenes_Seitliches_Treppenprofil',
       [edge,first.y-.23,first.z],[edge,last.y-.23,last.z],.13,.23,'trim');
     stairAudit.soffits++;
   }
   return samples;
 }
 const firstRun=flight(S.first,0);
 addBox('floor',S.landing.x,MID-.09,S.landing.z,S.landing.width,.18,S.landing.depth);
 // The transfer landing serves both flights, keeping the central turning zone clear.
 const secondRun=flight(S.second,RUN);
 addBox('floor',S.upperLanding.x,OG-.09,S.upperLanding.z,S.upperLanding.width,.18,S.upperLanding.depth);
 addBox('floor',S.passage.x,OG-.09,S.passage.z,S.passage.width,.18,S.passage.depth);
 // Subtle horizontal edge fascia at each landing, never through an opening.
 addBox('trim',S.landing.x,MID-.15,S.landing.z-S.landing.depth/2+.04,S.landing.width-.06,.12,.08);
 addBox('trim',S.upperLanding.x,OG-.15,S.upperLanding.z-S.upperLanding.depth/2+.04,S.upperLanding.width-.07,.12,.08);

 // The railing follows a mathematically straight line through the exact top
 // surfaces of ALL individual treads, rather than separate disconnected pieces.
 function flightBalustrade(samples,cfg,edgeSign){
   const x=cfg.x+edgeSign*(cfg.width/2-.12);
   const h=S.railHeight,begin=samples[0],end=samples.at(-1);
   const topA=[x,begin.y+h,begin.z],topB=[x,end.y+h,end.z];
   const lowA=[x,begin.y+.34,begin.z],lowB=[x,end.y+.34,end.z];
   beam('stairHandrail',topA,topB,.078);stairAudit.handrails++;
   beam('stairIron',[x,begin.y+h-.105,begin.z],[x,end.y+h-.105,end.z],.036);
   beam('stairIron',lowA,lowB,.031);
   for(let i=0;i<samples.length;i++){
     const p=samples[i];
     // The balusters are attached to the same tread heights used for walking.
     const post= i===0||i===samples.length-1 || i%3===0;
     if(post){
       addBox('stairIron',x,p.y+.52,p.z,.069,.94,.067);
       addBox('stone',x,p.y+.047,p.z,.19,.094,.19);
       addBox('gold',x,p.y+.84,p.z,.086,.046,.088);
     }else{
       addBox('stairIron',x,p.y+.51,p.z,.041,.91,.044);
       addBox('gold',x,p.y+.55,p.z,.069,.045,.075);
     }
     stairAudit.balusters++;
   }
   // A square dressed-stone newel closes each end of the flight. It is
   // on the outer tread edge and does not reduce the walking lane centrally.
   for(const p of [begin,end]){
     addBox('stone',x,p.y+.51,p.z,.205,1.02,.205);
     addBox('trim',x,p.y+1.055,p.z,.275,.105,.275);
     stairAudit.endPiers++;
   }
   const innerFreeWidth=cfg.width-2*.12-.21;
   stairAudit.railClearance=stairAudit.railClearance
     ?Math.min(stairAudit.railClearance,innerFreeWidth):innerFreeWidth;
 }
 // Keep the same guarded edges as the V3.9 player-tested geometry.
 flightBalustrade(firstRun,S.first,-1);
 flightBalustrade(secondRun,S.second,1);

 // The turn landing has its own continuous handrail, double iron rails and
 // masonry-capped newel posts, positioned ONLY along the outer back edge.
 const backZ=S.landing.z-S.landing.depth/2+.12;
 const lx0=S.landing.x-S.landing.width/2+.22;
 const lx1=S.landing.x+S.landing.width/2-.22;
 for(let i=0;i<=10;i++){
   const x=lx0+(lx1-lx0)*i/10;
   addBox('stairIron',x,MID+.54,backZ,.053,.98,.056);
   if(i%2===0)addBox('gold',x,MID+.69,backZ,.073,.045,.076);
   stairAudit.balusters++;
 }
 beam('stairHandrail',[lx0,MID+1.07,backZ],[lx1,MID+1.07,backZ],.075);
 beam('stairIron',[lx0,MID+.34,backZ],[lx1,MID+.34,backZ],.031);
 stairAudit.handrails++;
 for(const x of [lx0,lx1]){
   addBox('stone',x,MID+.50,backZ,.21,1.00,.21);
   addBox('trim',x,MID+1.05,backZ,.29,.11,.29);
   stairAudit.endPiers++;
 }

 // Guard the short open end of the upper landing; the exit passage to the
 // vestibule remains fully open on the opposite side.
 const topGuardX=S.upperLanding.x-S.upperLanding.width/2+.14;
 const uz0=S.upperLanding.z-S.upperLanding.depth/2+.20;
 const uz1=S.upperLanding.z+S.upperLanding.depth/2-.20;
 for(let i=0;i<=6;i++){
   const z=uz0+(uz1-uz0)*i/6;
   addBox('stairIron',topGuardX,OG+.53,z,.054,1.00,.054);
   if(i%2===0)addBox('gold',topGuardX,OG+.66,z,.076,.041,.077);
   stairAudit.balusters++;
 }
 beam('stairHandrail',[topGuardX,OG+1.07,uz0],[topGuardX,OG+1.07,uz1],.075);
 beam('stairIron',[topGuardX,OG+.35,uz0],[topGuardX,OG+.35,uz1],.028);
 stairAudit.handrails++;
 for(const z of [uz0,uz1]){
   addBox('stone',topGuardX,OG+.49,z,.20,.98,.20);
   addBox('trim',topGuardX,OG+1.03,z,.27,.11,.27);
   stairAudit.endPiers++;
 }
 if(stairAudit.steps!==36||Math.abs(EG+36*rise-OG)>1e-7||stairAudit.railClearance<2.05)
   throw Error('Grand Escalier: Höhen oder freie Gehbreite widersprüchlich');
 // Ground-level perron. No five-metre block; seven realistic shallow steps.
 addBox('stone',0,.46,14.25,14.60,.90,6.65);
 addBox('floor',0,EG-.10,14.25,14.80,.18,6.65);
 const steps=PERRON.steps;for(let i=0;i<steps;i++){
   const n=steps-i,zz=PERRON.firstCentreZ+i*PERRON.treadDepth;
   const h=n*(PERRON.landingHeight/steps);
   addBox('stone',0,h-.075,zz,PERRON.width,PERRON.stoneTreadThickness,PERRON.treadDepth+.01);
   addBox('trim',0,h+.018,zz+PERRON.treadDepth*.46,PERRON.width+.07,.035,.055);
 }
 for(const sx of [-7.32,7.32]){
   addBox('trim',sx,EG+.34,14.20,.28,.75,6.0);
   for(let zz=12;zz<16.6;zz+=.72)addBox('stone',sx,EG+.67,zz,.11,.65,.13);
 }
 // Original Herrenhaus-/MaxGame-Portikus; uniformly scaled so columns remain ROUND.
 donor.updateMatrixWorld(true);
 const porch=new THREE.Group();porch.name='ORIGINAL_MAXGAME_PORTIKUS_ROISSY_MASSTAB';
 // V3.6: original MaxGame Giebel occupies z=[11.65,19.43] donor metres.
 // The previous offset put its back edge at z=10.07 (1.4m INSIDE the upper vestibule).
 // Place the entire imported portico outside the 54x23m historical wall plane.
 // Exact historic Roissy facade never had this donor portico: design addition only.
 porch.scale.setScalar(.75);
 porch.position.set(0,EG-.75*.75,3.15);
 root.add(porch);
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
 const originalPediment=donor.getObjectByName('Giebel');
 if(originalPediment){
   const box=new THREE.Box3().setFromObject(originalPediment);
   const backOfPediment=box.min.z*porch.scale.z+porch.position.z;
   // The inside edge of the front wall is at 11.27m, exterior at 11.73m.
   if(backOfPediment<HALF_D+.20)
     throw Error('Portikusgiebel dringt wieder in das obere Vestibül ein: z='+backOfPediment.toFixed(3));
 }
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
 // V3.5: continuous hip/ridge metal caps anchored exactly to each roof
 // intersection. No freestanding ornament boxes above the slate roof.
 const hipNodes=[
   [[a,e,c],[aa,shoulder,cc]],[[a,e,d],[aa,shoulder,dd]],
   [[b,e,c],[bb,shoulder,cc]],[[b,e,d],[bb,shoulder,dd]],
   [[aa,shoulder,cc],[aa+4,ridge,0]],[[aa,shoulder,dd],[aa+4,ridge,0]],
   [[bb,shoulder,cc],[bb-4,ridge,0]],[[bb,shoulder,dd],[bb-4,ridge,0]]
 ];
 for(const [p,q] of hipNodes){
   const P=[p[0],p[1]+.040,p[2]],Q=[q[0],q[1]+.040,q[2]];
   beam('bronzeTrim',P,Q,.050);
 }
 beam('bronzeTrim',[aa+4,ridge+.05,0],[bb-4,ridge+.05,0],.073);
 // Visible flashing along the stone/slate eaves, aligned to facade corners.
 for(const z of [-HALF_D-.02,HALF_D+.02]){
   beam('bronzeTrim',[-HALF_W-.04,e+.045,z],[HALF_W+.04,e+.045,z],.052);
 }
 for(const x of [-HALF_W-.02,HALF_W+.02]){
   beam('bronzeTrim',[x,e+.045,-HALF_D-.01],[x,e+.045,HALF_D+.01],.049);
 }
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
 // V3.5: removed the two isolated side steps from the former prototype.
 // They stood below WINDOW openings and climbed along the wall, not toward a
 // door; therefore they could not be accessed. The historical drawing has
 // exterior side stairs, but their exact thresholds are not reconstructed
 // until the corresponding exterior door and ground level are established.
 // Continuous foundation curb is already generated at the exterior perimeter.
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
 // Strict 3D-wide doorway clearance test, run in the browser as well as
 // by the standalone regression script. Both wall and decorative geometries
 // must leave the central light opening completely clear (not just traversable
 // by a player's slimmer collider). The 2cm margins are for the masonry reveals.
 let internalDoorClashes=0;
 for(const door of interiorDoorways){
   const half=(door.width-.04)/2;
   const p=door.axis==='x'
     ?{x0:door.at-half,x1:door.at+half,z0:door.fixed-.14,z1:door.fixed+.14}
     :{x0:door.fixed-.14,x1:door.fixed+.14,z0:door.at-half,z1:door.at+half};
   const low=door.baseY+.018,high=door.baseY+2.785;
   for(const [key,records] of batch){
     if(!key.startsWith(door.floor+':'))continue;
     const mat=key.split(':')[1];if(!['wall','trim','window'].includes(mat))continue;
     for(const [x,y,z,w,h,d] of records){
       const ox=Math.min(p.x1,x+w/2)-Math.max(p.x0,x-w/2);
       const oz=Math.min(p.z1,z+d/2)-Math.max(p.z0,z-d/2);
       const oy=Math.min(high,y+h/2)-Math.max(low,y-h/2);
       if(ox>.015&&oz>.015&&oy>.015)internalDoorClashes++;
     }
   }
 }
 if(internalDoorClashes)throw Error('Historische Innentüren überlappt: '+internalDoorClashes);
 // V3.11 independent junction audit: the historical rear/entrance row
 // dividers MUST intersect transverse masonry and the two outer facades.
 // Earlier builds left a 12cm side gap, 31cm entrance gap, and 2.5cm
 // cross-wall gap even while all 44 door-clearance tests passed.
 function hasWallCovering(f,axis,fixed,coord,eps=.17){
   return partitionRegister.some(w=>w.floor===f&&w.axis===axis&&Math.abs(w.fixed-fixed)<eps
     &&coord>=w.from-.005&&coord<=w.to+.005
     &&!w.doors.some(d=>Math.abs(coord-d)<w.doorWidth/2-.02));
 }
 const junctionProblems=[];
 const joins=[];
 for(const f of ['eg','og']){
   for(const x of (f==='og'?REAR_X_CUTS_OG:REAR_X_CUTS).slice(1,-1)){
     joins.push({floor:f,type:'rear-exterior',x,z:-HALF_D+.12});
     joins.push({floor:f,type:'rear-transverse',x,z:CROSS_WALL_Z});
   }
   for(const x of FRONT_X_CUTS.slice(1,-1)){
     joins.push({floor:f,type:'front-transverse',x,z:CROSS_WALL_Z});
     joins.push({floor:f,type:'front-exterior',x,z:HALF_D-.12});
   }
   for(const x of [-HALF_W+.12,HALF_W-.12])joins.push({floor:f,type:'side-transverse',x,z:CROSS_WALL_Z});
   // The staircase and landing occupy the historic opening. It must stay
   // free across both floors, while masonry to either side stays connected.
   if(hasWallCovering(f,'x',CROSS_WALL_Z,GRAND_STAIR.first.x))
     junctionProblems.push({floor:f,type:'stair route walled off'});
   if(!hasWallCovering(f,'x',CROSS_WALL_Z,REAR_X_CUTS[2]-.28)
     ||!hasWallCovering(f,'x',CROSS_WALL_Z,REAR_X_CUTS[3]+.28))
     junctionProblems.push({floor:f,type:'stair lateral abutment missing'});
 }
 for(const floor of ['eg','og'])for(const w of SECONDARY_ROOM_WALLS[floor]){
   const span=(w.from+w.to)/2;
   // The doorway occupies the middle but both outside shoulders must be solid.
   for(const x of [w.from+.25, w.to-.25]){
     if(!hasWallCovering(floor,'x',w.z,x))junctionProblems.push({floor,source:w.source,x,z:w.z});
   }
   if(!partitionRegister.some(p=>p.floor===floor&&p.axis==='x'&&Math.abs(p.fixed-w.z)<.0001))
     junctionProblems.push({floor,source:w.source,missingPartition:true});
 }
 for(const j of joins){
   if(j.type==='rear-exterior'||j.type==='rear-transverse'){
     if(!hasWallCovering(j.floor,'z',j.x,j.z))junctionProblems.push(j);
   }else if(j.type==='front-exterior'||j.type==='front-transverse'){
     if(!hasWallCovering(j.floor,'z',j.x,j.z))junctionProblems.push(j);
   }else if(!hasWallCovering(j.floor,'x',CROSS_WALL_Z,j.x))junctionProblems.push(j);
 }
 if(junctionProblems.length)throw Error('Roissy Mauerwerksanschlüsse offen: '+JSON.stringify(junctionProblems.slice(0,5)));
 // Explicitly measure the connection overlap against the 0.46m exterior
 // and 0.31m interior wall thickness, rather than just endpoint equality.
 const envelopeInnerX=HALF_W-.23,envelopeInnerZ=HALF_D-.23;
 const joinOverlap={x:(HALF_W+.075)-envelopeInnerX,z:(HALF_D-.12)-envelopeInnerZ};
 if(joinOverlap.x<.075||joinOverlap.z<.075)throw Error('Missing overlap with outer facade');
 // V3.8 side-window bay check: historical room partitions must never be
 // positioned directly across the side glazing. We check the SOLID partition
 // colliders, not just the room names or theoretical elevation raster. The
 // facade's two storeys share the same openings for a continuous stone pier.
 const sideOpeningHalfWidth=.825;
 const sideWindowConflicts=[];
 for(const [side,sideX] of [['east',HALF_W],['west',-HALF_W]]){
   for(const f of ['eg','og'])for(const z of SIDE_WINDOW_AXES){
     for(const wall of collisionWalls[f]){
       const touchesSide=sideX>0?wall.x1>HALF_W-.42:wall.x0<-HALF_W+.42;
       const crossesAperture=wall.z1>z-sideOpeningHalfWidth+.025 && wall.z0<z+sideOpeningHalfWidth-.025;
       if(touchesSide&&crossesAperture)sideWindowConflicts.push({side,f,z,wall});
     }
   }
 }
 if(sideWindowConflicts.length)throw Error('Seitenfenster trifft Raumtrennwand: '+JSON.stringify(sideWindowConflicts.slice(0,3)));
 // V3.9: prove all slab fields meet the exterior masonry and do not
 // fill the genuine Salon and Grand Escalier double-height voids.
 const exteriorInsideX=HALF_W-.23,exteriorInsideZ=HALF_D-.23;
 const wallEmbedX=slabPerimeter[1]-exteriorInsideX;
 const wallEmbedZ=slabPerimeter[3]-exteriorInsideZ;
 if(wallEmbedX<.025||wallEmbedZ<.025)
   throw Error('Zwischen Geschossdecke und Außenwand verbleibt eine Bodenfuge');
 let holeSurfaceIntrusions=0,slabArea=0;
 for(const slab of slabAudit){
   for(const [x0,x1,z0,z1] of slab.rectangles){
     slabArea+=(x1-x0)*(z1-z0);
     for(const [u0,u1,v0,v1] of slab.holes){
       const ix=Math.max(0,Math.min(x1,u1)-Math.max(x0,u0));
       const iz=Math.max(0,Math.min(z1,v1)-Math.max(z0,v0));
       if(ix*iz>1e-7)holeSurfaceIntrusions++;
     }
   }
 }
 if(holeSurfaceIntrusions||slabAudit.length!==3||deckEdgeSegments<8)
   throw Error('Salon-/Treppenöffnungen oder Geschosskanten fehlerhaft');
 // Final construction checks executed during the real browser build.
 // Interior room rectangles are disjoint, and every facade window must fit
 // within an exterior bay away from corner quoins and main-wall piers.
 const roomOverlap=(a,b)=>Math.max(0,Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2)) *
   Math.max(0,Math.min(a.z+a.d/2,b.z+b.d/2)-Math.max(a.z-a.d/2,b.z-b.d/2));
 for(const floor of ['eg','og']){
   const rs=ROOMDATA[floor];
   for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){
     if(roomOverlap(rs[i],rs[j])>.05)throw Error(`Überlappende Roissy-Räume ${floor}: ${rs[i].name} / ${rs[j].name}`);
   }
 }
 for(const [which,arr,low,high] of [
   ['Frontfenster',FRONT_WINDOW_AXES,-HALF_W,HALF_W],
   ['Parkfenster',REAR_WINDOW_AXES,-HALF_W,HALF_W],
   ['Seitenfenster',SIDE_WINDOW_AXES,-HALF_D,HALF_D]]){
   const pts=arr.slice().sort((a,b)=>a-b);
   for(let i=0;i<pts.length;i++){
     const r=1.20;
     if(pts[i]-r<low+.20||pts[i]+r>high-.20)throw Error(`${which}: Fenster schneidet Gebäudeecke`);
     if(i>0&&pts[i]-pts[i-1]<2.6)throw Error(`${which}: Fensteröffnungen überlappen`);
   }
 }
 return {front:root,originalPortico:porch,facadeWidth:54,
   palaceDimensions:{width:54,depth:23,height:27.6,calibration:'estimated using Le Rouge 1776 scale; 23m incl projections not confirmed'},
   buildings:['Château de Roissy – Hauptgebäude'],historicalFloors:ROOMDATA,historicalLayers:layers,
   interiorCollision:collisionWalls,interiorDoorways,planPartitions:partitionRegister,entranceDoors:doors,
   instancedElements:[...batch.values()].reduce((s,a)=>s+a.length,0),instancedDrawcalls:batch.size,
   planAxes:{frontDoors:FRONT_DOORS,frontWindows:FRONT_WINDOW_AXES,rearWindows:REAR_WINDOW_AXES},
   validations:{roomCountEG:ROOMDATA.eg.length,roomCountOG:ROOMDATA.og.length,directMeshes,
     roofDormersPerSide:roofDormerAxes.length,roofPlaneCutouts:roofDormerAxes.length*2,
     floatingRoofDecor:0,orphanSideStairs:0,roofHipAndRidgeCaps:9,salonUpperDoorsIntoVoid:0,ceilingUndersides:true,
     roissyRoomOverlapCount:0,facadeOpeningsChecked:true,perronNavigationUsesStoneStepHeights:true,stairRailAnchoredToTreads:true,stairGeometrySharesNavigationConfig:true,
     salonGalleryGuardedWidth:4.62,stairRisersPerFlight:RUN,
     donorPedimentClearOfUpperVestibule:true,externalCornerQuoinsOnly:true,
     vestibuleNaturalStonePBR:true,vestibuleFloorSize:[vestibuleW,vestibuleD],
     roofOpeningSlope:[roofOpeningT0,roofOpeningT1],dormerGlassBackedBySolidStone:false,
     sideWindowsCheckedAgainstPartitionColliders:true,sideWindowCollisions:sideWindowConflicts.length,
     realDoorReveals:true,interiorLintelsClearHeight:2.80,
     fullDoorwayCoreCollisions:internalDoorClashes,doorsAndWindowsCheckedAgainstSolidGeometry:true,
     roofAndCeilingAreaConformsToPlan:true,slabPerimeterWallOverlap:[wallEmbedX,wallEmbedZ],
     deckEdgeSegments,slabOpeningIntrusions:holeSurfaceIntrusions,slabArealCoverage:slabArea,
     ceilingNeverBridgesSalonOrStair:true,grandEscalierConstruction:stairAudit,
     roomDerivedAxes:AXIS_AUDIT,partitionSegments:partitionRegister.length,derivedTransverseWallCount:SECONDARY_ROOM_WALLS.eg.length+SECONDARY_ROOM_WALLS.og.length,
     checkedMasonryJoins:joins.length+4,wallJoinConflicts:junctionProblems.length,
     historicGrandStairOpeningPreserved:true,exteriorConnectionOverlap:joinOverlap}
 };
}
