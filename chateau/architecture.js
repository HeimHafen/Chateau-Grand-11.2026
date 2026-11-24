/**
 * CHÂTEAU GRAND V3.20 – Historische Hof- und Parkfassade mit gestaffelter Hülle.
 * Geometry + room register share one unit/metre plan with navigation.
 * Interior reproduces legible room sequences; not a documented survey in cm.
 * Historical elevations interpreted from Le Rouge, 1776; exact sculpture and dimensions not documented.
 */
import {resolveStaticFaces} from './surface-cleanup.js?v=roissy320';
import {addPortalDoors} from '../wohnzimmer/portal-doors-v2.js';
import {PLAN,HALF_W,HALF_D,EG,OG,CORNICE,ROOMDATA,FRONT_DOORS,FRONT_WINDOW_AXES,REAR_WINDOW_AXES,SIDE_WINDOW_AXES,REAR_X_CUTS,REAR_X_CUTS_OG,FRONT_X_CUTS,CROSS_WALL_Z,GRAND_STAIR,PERRON,AXIS_AUDIT,SECONDARY_ROOM_WALLS,EXTERIOR,FACADE_SEGMENTS,frontAt,rearAt} from './roissy-config.js?v=roissy320';

export function buildChateau(THREE,scene,donor,mats,glass){
 const root=new THREE.Group();root.name='CHATEAU_ROISSY_V319_STUCK_UND_BOISERIE';scene.add(root);
 const layers={eg:new THREE.Group(),og:new THREE.Group()};
 layers.eg.name='ROISSY_REZ_DE_CHAUSSEE_LE_ROUGE_1776';layers.og.name='ROISSY_PREMIER_ETAGE_LE_ROUGE_1776';root.add(layers.eg,layers.og);
 const bronze=new THREE.MeshStandardMaterial({color:0x282f36,metalness:.63,roughness:.35,side:THREE.DoubleSide});
 const bronzeTrim=new THREE.MeshStandardMaterial({color:0x64666b,metalness:.65,roughness:.35});
 const stairIron=new THREE.MeshStandardMaterial({name:'Roissy_GrandEscalier_Geschmiedetes_Eisen',color:0x242a2a,metalness:.76,roughness:.32});
 const stairHandrail=new THREE.MeshStandardMaterial({name:'Roissy_GrandEscalier_Gewachstes_Nussbaumholz',color:0x584032,roughness:.43,metalness:.02});
 const gold=new THREE.MeshStandardMaterial({color:0xad8654,metalness:.61,roughness:.36});
 const wood=new THREE.MeshStandardMaterial({color:0x3d2418,roughness:.63});
 const floorStone=mats.porticoPaving||mats.trim;
 // Locally packaged maps: no network dependency and no runtime canvas texture generation.
 const materialLoader=new THREE.TextureLoader(),mapsCache=new Map();
 function mapsFor(prefix,hasRoughness=true){
   if(typeof document==='undefined')return {};
   if(mapsCache.has(prefix))return mapsCache.get(prefix);
   const load=(type,color=false)=>{const t=materialLoader.load('./assets/'+prefix+'_'+type+'.jpg');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;if(color)t.colorSpace=THREE.SRGBColorSpace;return t;};
   const m={map:load('albedo',true),normalMap:load('normal')};if(hasRoughness)m.roughnessMap=load('roughness');mapsCache.set(prefix,m);return m;
 }
 const plasterMaps=mapsFor('interior/v317_plaster'),paintMaps=mapsFor('interior/v317_paint'),stoneMaps=mapsFor('heritage-v14/column_stone');
 const finish=(name,color,roughness,source=plasterMaps,scale=.13)=>new THREE.MeshStandardMaterial({name,color,roughness,metalness:0,...source,normalScale:new THREE.Vector2(scale,scale)});
 const ceilingStone=finish('Roissy_Stuckdecke_Matt',0xfff9ee,.96,plasterMaps,.08);ceilingStone.side=THREE.DoubleSide;
 const cast={wall:mats.facadeWall,stone:mats.dressedStone,trim:mats.trim,window:mats.windowStone,
   sill:mats.shade,glass,sash:mats.paintedSash,bronze,bronzeTrim,gold,wood,stairIron,stairHandrail,floor:floorStone,ceiling:ceilingStone};
 Object.assign(cast,{
   intPlaster:finish('Roissy_Kalkputz_Warmweiss',0xfff9ee,.92),
   intPanel:finish('Roissy_Boiserie_Greige',0xe3dac8,.75,paintMaps,.06),
   intFrame:finish('Roissy_Profilleiste_Elfenbein',0xf4eadb,.78,paintMaps,.06),
   intShadow:finish('Roissy_Profil_Kehle',0xc9bbab,.90,paintMaps,.05),
   intService:finish('Roissy_Nebenraum_Kalkputz',0xeae5d9,.96),
   intHall:finish('Roissy_Vestibule_Kalkstein',0xfff6e8,.91,stoneMaps,.17),
   intHallPanel:finish('Roissy_Vestibule_Geschliffener_Kalkstein',0xf3e8d7,.86,stoneMaps,.12),
   intSalon:finish('Roissy_Salon_Elfenbein',0xfffcf4,.88),
   intSalonPanel:finish('Roissy_Salon_Boiserie_Elfenbein',0xf3e9d8,.70,paintMaps,.07),
   intPrivatePanel:finish('Roissy_Chambre_Boiserie_Salbeigrau',0xd5d9cb,.76,paintMaps,.06),
   intPassagePanel:finish('Roissy_Passage_Boiserie_Sand',0xded2bd,.83,paintMaps,.07),
   intStairStone:finish('Roissy_GrandEscalier_Kalkstein',0xfff4e2,.88,stoneMaps,.18),
   intStucField:finish('Roissy_Stuck_Innenfeld_Perlweiss',0xfff5e5,.94,plasterMaps,.07),
   intStucRelief:finish('Roissy_Stuck_Profil_Elfenbein',0xfff9ee,.86,paintMaps,.05),
   intStucRecess:finish('Roissy_Stuck_Kehle_Warmgrau',0xd9cbb6,.90,plasterMaps,.06),
   intBrass:new THREE.MeshStandardMaterial({name:'Roissy_Patinierte_Messingdetails',color:0xb39a6b,roughness:.48,metalness:.45})
 });
 function roomAt(f,x,z){
   const rooms=ROOMDATA[f];const distance=r=>Math.hypot(Math.max(0,Math.abs(x-r.x)-r.w/2),Math.max(0,Math.abs(z-r.z)-r.d/2));
   return rooms.reduce((best,r)=>distance(r)<distance(best)?r:best,rooms[0]);
 }
 function roomType(r){const n=r.name;
   if(/Vestibule|Grand escalier/.test(n))return 'hall';
   if(/Salon|parade|Assemblée|Salle à manger|musique/.test(n))return 'salon';
   if(/Chambre|Cabinet/.test(n))return 'private';
   if(/Antichambre|Passage/.test(n))return 'passage';return 'service';
 }
 const palettes={hall:['intHall','intHallPanel'],salon:['intSalon','intSalonPanel'],private:['intPlaster','intPrivatePanel'],passage:['intPlaster','intPassagePanel'],service:['intService','intPanel']};
 const interiorAudit={wallFaces:0,panelFields:0,doorCrowns:0,floorZones:[],floorRects:[],ceilingFields:0,fixtureCount:0,wallTypes:{},salonDoubleProfiles:0,ceilingDesigns:[],ceilingReliefRects:[],ceilingMedallions:0,domeCount:0};
 // All profiles are fitted to existing masonry, not to an independent guessed room grid.
 function finishWall(f,axis,fixed,p,q,low,high,side,edge,full,service=false){
   if(q-p<.025||high-low<.025)return;
   const category=at=>roomType(roomAt(f,axis==='x'?at:fixed+side*(edge+.12),axis==='x'?fixed+side*(edge+.12):at));
   const type=category((p+q)/2);service=type==='service';interiorAudit.wallTypes[type]=(interiorAudit.wallTypes[type]||0)+1;
   const put=(mat,at,Y,w,h,depth,offset)=>axis==='x'
     ?addBox(mat,at,Y,fixed+side*(edge+offset),w,h,depth,f)
     :addBox(mat,fixed+side*(edge+offset),Y,at,depth,h,w,f);
   put(palettes[type][0],(p+q)/2,(low+high)/2,q-p-.008,high-low-.008,.012,.007);
   interiorAudit.wallFaces++;
   if(!full||q-p<.62)return;
   const a=p+.22,b=q-.22,w=b-a,c=(a+b)/2;
   if(w<.17)return;
   const top=high-.31;
   // Plinth, dado, chair rail and two-stage cornice on solid wall segments only.
   put('intShadow',c,low+.065,w,.12,.034,.035);
   put('intFrame',c,low+.17,w,.095,.044,.040);
   put(palettes[type][1],c,low+.62,w,.79,.018,.021);
   put('intFrame',c,low+1.045,w,.055,.052,.047);
   put('intShadow',c,low+1.10,w,.026,.035,.038);
   put('intFrame',c,top-.12,w,.09,.060,.051);
   put('intShadow',c,top-.055,w,.04,.043,.042);
   put('intFrame',c,top+.015,w,.10,.076,.061);
   if(service||w<.70)return;
   const n=Math.max(1,Math.round(w/2.2)),bay=w/n;
   for(let i=0;i<n;i++){
     const m=a+(i+.5)*bay,pw=bay-.20, bottom=low+1.38, upper=top-.40;
     if(pw<.40||upper-bottom<.65)continue;
     put(palettes[category(m)][1],m,(bottom+upper)/2,pw,upper-bottom,.018,.022);
     for(const d of [-1,1]){
       put('intShadow',m+d*(pw/2-.035),(bottom+upper)/2,.07,upper-bottom,.027,.034);
       put('intFrame',m+d*(pw/2-.035),(bottom+upper)/2,.034,upper-bottom-.035,.042,.045);
       put('intShadow',m,d<0?bottom+.035:upper-.035,pw-.14,.07,.027,.034);
       put('intFrame',m,d<0?bottom+.035:upper-.035,pw-.14,.035,.042,.045);
     }
     // Refined inner bead and recessed field, limited to solid salon panels.
     if(type==='salon'&&pw>1.02&&upper-bottom>1.20){
       const ix=pw/2-.135, iy=.135, ih=upper-bottom-2*iy;
       for(const side of [-1,1]){
         put('intStucRelief',m+side*ix,(bottom+upper)/2,.026,ih,.020,.038);
         put('intStucRelief',m,side<0?bottom+iy:upper-iy,pw-.27-.026,.026,.020,.038);
       }
       interiorAudit.salonDoubleProfiles++;
     }
     interiorAudit.panelFields++;
   }
 }
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
 const apertureWidth=(axis,p,l,door=false)=>door?(p===0?1.98:1.52):axis==='z'?1.65:Math.abs(p)<5?2.15:1.68;
 const shellLevels=[{bottom:EG,top:OG,sill:1.00,glassH:3.73},{bottom:OG,top:CORNICE,sill:.88,glassH:3.43}];
 function wallSegments(axis,fixed,a,b,atLevel,holes,thickness=.46,mat='wall',insideNormal=null){
   const y=atLevel.bottom,top=atLevel.top;let last=a;
   const list=holes.filter(h=>h.at-h.width/2>a+.15&&h.at+h.width/2<b-.15).sort((m,n)=>m.at-n.at);
   const block=(s,e,l,u)=>{
     if(e-s<.015||u-l<.015)return;
     if(axis==='x')addBox(mat,(s+e)/2,(l+u)/2,fixed,e-s,u-l,thickness);
     else addBox(mat,fixed,(l+u)/2,(s+e)/2,thickness,u-l,e-s);
     // Never put a finish in the segmented arch infill: tiny blocks preserve the reveal.
     if(insideNormal!==null&&e-s>.08&&u-l>.12)finishWall(y===EG?'eg':'og',axis,fixed,s,e,l,u,insideNormal,thickness/2,l===y&&u===top);
   };
   for(const h of list){const left=h.at-h.width/2,right=h.at+h.width/2;
      if(left<last-.01)throw Error('Overlapping window/door openings at '+fixed+','+h.at);
      block(last,left,y,top);
      const bottom=h.isDoor?y+.01:y+atLevel.sill;
      const high=h.isDoor?Math.min(3.9,top-y-.26):atLevel.glassH;
      block(left,right,y,bottom);block(left,right,bottom+high,top);
      if(h.arch){const r=h.width/2,n=32;for(let i=0;i<n;i++){const u=-r+i*2*r/n,v=u+2*r/n;const lift=Math.sqrt(Math.max(0,r*r-Math.min(Math.abs(u),Math.abs(v),Math.abs((u+v)/2))**2));block(h.at+u,h.at+v,bottom+high-r+lift,bottom+high);}}
      last=right;
   }
   block(last,b,y,top);
 }
 function addFacadeWindow(axis,fixed,at,level,isDoor=false,directionOverride=null,arched=false){
   const v=shellLevels[level],y=v.bottom+(isDoor?.01:v.sill),height=isDoor?3.9:v.glassH,
     width=apertureWidth(axis,at,level,isDoor),t=.11,
     direction=directionOverride??Math.sign(fixed);
   const along=(material,pos,Y,l,h,depth,face=.19)=>{
      if(axis==='x')addBox(material,pos,Y,fixed+direction*face,l,h,depth);
      else addBox(material,fixed+direction*face,Y,pos,depth,h,l);
   };
   if(arched){
     const r=width/2,spring=height-r;
     const transform=(o,face)=>{o.position.set(at,y,fixed+direction*face);if(direction<0)o.rotation.y=Math.PI;};
     function archShape(radius,base,topOnly=false){const sh=new THREE.Shape();sh.moveTo(-radius,base);sh.lineTo(radius,base);sh.lineTo(radius,spring);sh.absarc(0,spring,radius,0,Math.PI,false);sh.closePath();return sh;}
     const frame=archShape(r+.19,-.08),hole=new THREE.Path();hole.moveTo(-r,0);hole.lineTo(-r,spring);hole.absarc(0,spring,r,Math.PI,0,true);hole.lineTo(r,0);hole.closePath();frame.holes.push(hole);
     const f=mesh(new THREE.ExtrudeGeometry(frame,{depth:.20,bevelEnabled:false}),'window','Roissy_Bogenarchivolte');transform(f,.23);
     if(isDoor){
       const door=addPortalDoors(THREE,root,mats,glass,at,fixed,1,width,spring,wood,y,{inset:.18,activationDistance:5.7});doors.push({x:at,z:fixed,base:y,door});
       const sh=new THREE.Shape();sh.moveTo(-r+.08,spring);sh.lineTo(r-.08,spring);sh.absarc(0,spring,r-.08,0,Math.PI,false);sh.closePath();transform(mesh(new THREE.ShapeGeometry(sh),'glass','Roissy_Bogenoberlicht'),.02);
       along('sash',at,y+spring,width,.085,.18,.03);
     }else{
       transform(mesh(new THREE.ShapeGeometry(archShape(r-.065,.06)),'glass','Roissy_Bogenfenster'),.02);
       along('sash',at,y+height/2,.07,height-.12,.10,.08);
       for(const h of [.75,1.55,2.35])if(h<spring)along('sash',at,y+h,width-.12,.065,.10,.08);
       along('trim',at,y-.12,width+.38,.19,.60,.27);
     }
     for(const q of [-1,1])along('window',at+q*(r+.085),y+spring/2,.17,spring,.27,-.18);
     along('stone',at,y+height+.08,.28,.34,.30,.39);
     return;
   }
   if(!isDoor){
     // Fit the glass into a real four-sided frame within the opening.
     along('glass',at,y+height/2,width-.105,height-.105,.045,.02);
     for(const sign of [-1,1]){
       along('sash',at+sign*(width/2-.035),y+height/2,.075,height,.14,.02);
       along('sash',at,y+height/2+sign*(height/2-.035),width,.075,.14,.02);
       along('window',at+sign*(width/2+.035),y+height/2,.13,height+.12,.09,-.24);
     }
     along('trim',at,y-.055,width+.20,.11,.30,-.30);
     along('window',at,y+height+.065,width+.22,.13,.10,-.24);

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
 function facade(seg){
   const {axis,fixed,a,b,windows:positions,entrance:excludeEntrance=false,normal}=seg;
   for(let l=0;l<2;l++){
     const v=shellLevels[l];
     const openings=positions.map(p=>{const isDoor=excludeEntrance&&l===0&&FRONT_DOORS.includes(p);return {at:p,width:apertureWidth(axis,p,l,isDoor),isDoor,arch:axis==='x'&&Math.abs(p)<5};});
     wallSegments(axis,fixed,a-.20,b+.20,v,openings,.46,'wall',-normal);
     for(const h of openings)addFacadeWindow(axis,fixed,h.at,l,h.isDoor,normal,h.arch);
   }
   const put=(m,pos,y,w,h,dep,offset=.30)=>axis==='x'?addBox(m,pos,y,fixed+normal*offset,w,h,dep):addBox(m,fixed+normal*offset,y,pos,dep,h,w);
   for(const y of [EG+.22,OG+.06,CORNICE-.10]){
     put('trim',(a+b)/2,y,b-a+.43,.19,.64);put('window',(a+b)/2,y+.16,b-a+.46,.085,.58);
   }
   for(const end of [a,b])for(let i=0;i<15;i++)put(i%2?'window':'stone',end+(end===a?.28:-.28),EG+.32+i*.73,i%2?.48:.66,.36,.14,.27);
 }
 const X=EXTERIOR;
 // The core plus three true extensions, without hidden rectangular front walls.
 const extensionRects=[[-HALF_W+.0,-X.wingX,HALF_D,X.wingFront],[X.wingX,HALF_W,HALF_D,X.wingFront],[-X.parkX,X.parkX,X.parkBack,-HALF_D]];
 const foundation=(x0,x1,z0,z1)=>addBox('stone',(x0+x1)/2,EG/2,(z0+z1)/2,x1-x0+.46,EG,z1-z0+.46);
 foundation(-HALF_W,HALF_W,-HALF_D,HALF_D);for(const r of extensionRects)foundation(...r);
 for(const seg of FACADE_SEGMENTS)facade(seg);
 // Attached classical giant-order pilasters on the park risalit; court centre
 // is arcaded, not a freestanding American portico.
 for(const x of [-6.22,-1.85,1.85,6.22]){
   const z=X.parkBack-.37;
   addBox('window',x,(EG+CORNICE)/2,z,.53,CORNICE-EG-.55,.27);
   addBox('trim',x,EG+.28,z,.82,.45,.49);addBox('trim',x,CORNICE-.45,z,.86,.53,.49);
 }
 for(const x of [-6.25,-1.80,1.80,6.25]){
   addBox('window',x,(EG+CORNICE)/2,HALF_D+.32,.48,CORNICE-EG-.42,.23);
   addBox('trim',x,CORNICE-.43,HALF_D+.34,.76,.31,.43);
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
   let rects=[slabPerimeter.slice(),[-HALF_W+.20,-X.wingX+.20,HALF_D-.20,X.wingFront-.20],[X.wingX-.20,HALF_W-.20,HALF_D-.20,X.wingFront-.20],[-X.parkX+.20,X.parkX-.20,X.parkBack+.20,-HALF_D+.20]];
   // Union the stepped footprint without overlapping any horizontal slab faces.
   const disjoint=[];
   for(const r of rects){let fresh=[r];for(const previous of disjoint)fresh=fresh.flatMap(piece=>subtract(piece,previous));disjoint.push(...fresh);}
   rects=disjoint;
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
   t.wrapS=t.wrapT=THREE.RepeatWrapping;
   return t;
 }
 const vestibulePBR=new THREE.MeshStandardMaterial({
   name:'Roissy_Vestibule_Kalkstein_Matt_Geschliffen',
   map:floorTexture('albedo',true),normalMap:floorTexture('normal'),
   roughnessMap:floorTexture('roughness'),roughness:.94,metalness:0,
   normalScale:new THREE.Vector2(.18,.18),color:0xf5efe6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2
 });
 const hallLeft=FRONT_X_CUTS[3]+.155,hallRight=FRONT_X_CUTS[4]-.155;
 const hallBack=CROSS_WALL_Z+.155,hallFront=HALF_D-.23;
 const vestibuleW=hallRight-hallLeft,vestibuleD=hallFront-hallBack,vestibuleZ=(hallBack+hallFront)/2;
 const centralFloor=new THREE.Mesh(new THREE.PlaneGeometry(vestibuleW,vestibuleD),vestibulePBR);
 const hallUV=centralFloor.geometry.attributes.uv;const hallPos=centralFloor.geometry.attributes.position;for(let i=0;i<hallUV.count;i++)hallUV.setXY(i,hallPos.getX(i)/8.8,(hallPos.getY(i)-vestibuleZ)/8.8);hallUV.needsUpdate=true;
 centralFloor.rotation.x=-Math.PI/2;
 centralFloor.position.set(0,EG+.008,vestibuleZ);
 centralFloor.receiveShadow=true;centralFloor.name='Roissy_Vestibule_Natursteinboden_Grossformat';
 layers.eg.add(centralFloor);directMeshes++;
 // A restrained inset frame on the stone plane, flush with the walking surface.
 // Door thresholds remain open; these borders are 7mm thick, not collision walls.
 const vestibuleEdge=new THREE.MeshStandardMaterial({color:0x948572,roughness:.91,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});
 function floorInlay(x,z,w,d,mat=vestibuleEdge){
   const obj=new THREE.Mesh(new THREE.BoxGeometry(w,.006,d),mat);
   obj.position.set(x,EG+.013,z);obj.receiveShadow=true;obj.castShadow=false;
   obj.name='Roissy_Vestibule_Eingelassener_Steinfries';
   layers.eg.add(obj);directMeshes++;
 }
 const border=.48, lineW=.065, secondBorder=.66;
 for(const inset of [border,secondBorder]){
   const w=vestibuleW-2*inset,d=vestibuleD-2*inset,th=inset===border?lineW:.025;
   for(const sign of [-1,1]){
     floorInlay(sign*w/2,vestibuleZ,th,d+th);
     floorInlay(0,vestibuleZ+sign*d/2,w-th,th);
   }
 }
 // Vestibule trim is generated from the actual partition segments below.
 // Four free-standing piers (two rows of two) follow the central supports in
 // Le Rouge's drawing, at estimated positions within the present room envelope.
 const hallSupports=[];
 for(const f of ['eg','og']){
   const y=f==='eg'?EG:OG,top=f==='eg'?OG-.19:CORNICE-.245;
   for(const x of [-2.24,2.24])for(const z of [2.15,6.45]){
     const h=top-y;
     addBox('stone',x,y+.095,z,.81,.19,.81,f);
     addBox('trim',x,y+.24,z,.72,.10,.72,f);
     addBox('stone',x,y+.38,z,.63,.18,.63,f);
     const shaftGeo=new THREE.CylinderGeometry(.255,.30,h-.94,32);const suv=shaftGeo.attributes.uv;for(let i=0;i<suv.count;i++)suv.setXY(i,suv.getX(i)*1.16,suv.getY(i)*(h-.94)/1.5);suv.needsUpdate=true;const shaft=mesh(shaftGeo,'intHall','Roissy_Vestibule_Saeulenschaft',layers[f]);
     shaft.position.set(x,y+.47+(h-.94)/2,z);
     addBox('trim',x,top-.395,z,.64,.15,.64,f);
     addBox('stone',x,top-.25,z,.74,.14,.74,f);
     addBox('trim',x,top-.085,z,.84,.17,.84,f);
     collisionWalls[f].push({x0:x-.405,x1:x+.405,z0:z-.405,z1:z+.405});
     hallSupports.push({floor:f,x,z});
   }
   // Continuous structural beams meet column capitals and real partition faces.
   for(const z of [2.15,6.45]){
     addBox('ceiling',0,top-.17,z,vestibuleW,.34,.59,f);
     addBox('trim',0,top-.37,z,vestibuleW,.08,.69,f);
   }
   for(const x of [-2.24,2.24]){
     addBox('ceiling',x,top-.17,vestibuleZ,.55,.34,vestibuleD,f);
     addBox('trim',x,top-.37,vestibuleZ,.65,.08,vestibuleD,f);
   }
 }
 // The Salon du Rez-de-Chaussée stays double height; the west Grand Escalier has its own void.
 const salonVoid=[-6.70,6.70,X.parkBack+.40,-2.32],stairVoid=[-13.18,-6.77,-2.10,8.70];
 addSlab(OG-.095,[salonVoid,stairVoid]);
 addSlab(CORNICE-.15,[]);
 // Room-specific floor finishes: clipped against the actual deck, never across a void.
 // Use metrically repeated UVs and a small physical finish height above the substrate.
 const parquetTex=(suffix,color=false)=>{
   if(typeof document==='undefined')return null;
   const t=tileLoader.load('./assets/interior/roissy_parquet_'+suffix+'.jpg');
   t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;
   if(color)t.colorSpace=THREE.SRGBColorSpace;return t;
 };
 const parquet=new THREE.MeshStandardMaterial({name:'Roissy_Eichenparkett_Tafelverband',color:0xffffff,map:parquetTex('albedo',true),normalMap:parquetTex('normal'),roughness:.68,normalScale:new THREE.Vector2(.23,.23),polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 const secondaryStone=vestibulePBR.clone();secondaryStone.name='Roissy_Kalkstein_Nebenraeume';secondaryStone.color.setHex(0xe7dfd2);
 const privateOak=finish('Roissy_Eichendielen_Privatraeume',0xf0e4d4,.95,mapsFor('interior/v318_oak_planks'),.22);privateOak.polygonOffset=true;privateOak.polygonOffsetFactor=-1;privateOak.polygonOffsetUnits=-2;
 const formalOak=parquet.clone();formalOak.name='Roissy_Eichenparkett_Salons';formalOak.color.setHex(0xfff5e7);formalOak.roughness=.62;
 const borderOak=privateOak.clone();borderOak.name='Roissy_Eiche_Randfries';borderOak.color.setHex(0xbba07e);const floorMats={oak:formalOak,privateOak,stone:secondaryStone,gallery:vestibulePBR,oakBorderX:borderOak,oakBorderZ:borderOak};
 const floorBuffers=new Map();
 function surfaceRect(f,kind,rect,y){
   const key=f+':'+kind;
   if(!floorBuffers.has(key))floorBuffers.set(key,{pos:[],uv:[]});
   const {pos,uv}=floorBuffers.get(key),[x0,x1,z0,z1]=rect;
   interiorAudit.floorRects.push({floor:f,kind,rect:rect.slice(),y});
   const scale=kind==='oak'?2.4:8.8;
   for(const [x,z] of [[x0,z0],[x0,z1],[x1,z0],[x1,z0],[x0,z1],[x1,z1]]){pos.push(x,y,z);if(kind==='privateOak'||kind==='oakBorderX')uv.push(x/2.4,-z/1.12);else if(kind==='oakBorderZ')uv.push(z/2.4,x/1.12);else uv.push(x/scale,-z/scale);}
 }
 for(const f of ['eg','og']){
   const y=f==='eg'?EG:OG,deck=slabAudit[f==='eg'?0:1].rectangles;
   const occupied=[];
   for(const r of ROOMDATA[f]){
     if(/Vide sur|Grand escalier|Escalier secondaire/.test(r.name)||(f==='eg'&&/Vestibule/.test(r.name)))continue;
     const type=roomType(r),kind=type==='salon'?'oak':type==='private'?'privateOak':type==='hall'?'gallery':'stone';
     // Finish field lies just inside estimated clear room boundary. The narrow existing
     // stone perimeter and thresholds stay visible rather than bridging wall lines.
     let bounds=[r.x-r.w/2-.04,r.x+r.w/2+.04,r.z-r.d/2-.04,r.z+r.d/2+.04];
     if(bounds[3]>10.3&&(bounds[0]<-X.wingX||bounds[1]>X.wingX))bounds[3]=X.wingFront-.25;
     if(r.name==='Salon')bounds=[-6.53,6.53,X.parkBack+.25,CROSS_WALL_Z-.20];
     let area=0;
     for(const d of deck){
       const b=[Math.max(d[0],bounds[0]),Math.min(d[1],bounds[1]),Math.max(d[2],bounds[2]),Math.min(d[3],bounds[3])];
       if(b[1]-b[0]<.02||b[3]-b[2]<.02)continue;
       let pieces=[b];for(const old of occupied)pieces=pieces.flatMap(rect=>subtract(rect,old));
       for(const rect of pieces){
         if(kind==='oak'&&bounds[1]-bounds[0]>1.5&&bounds[3]-bounds[2]>1.5){
           const [a,b,c,d]=bounds, t=.20;const strips=[['oakBorderX',[a,b,c,c+t]],['oakBorderX',[a,b,d-t,d]],['oakBorderZ',[a,a+t,c+t,d-t]],['oakBorderZ',[b-t,b,c+t,d-t]]];let core=[rect];
           for(const [mat,strip] of strips){const overlap=[Math.max(rect[0],strip[0]),Math.min(rect[1],strip[1]),Math.max(rect[2],strip[2]),Math.min(rect[3],strip[3])];if(overlap[1]>overlap[0]+1e-6&&overlap[3]>overlap[2]+1e-6){surfaceRect(f,mat,overlap,y+.009);core=core.flatMap(p=>subtract(p,overlap));}}
           for(const p of core)if(p[1]-p[0]>1e-6&&p[3]-p[2]>1e-6)surfaceRect(f,kind,p,y+.009);
         }else surfaceRect(f,kind,rect,y+.009);
         occupied.push(rect);area+=(rect[1]-rect[0])*(rect[3]-rect[2]);
       }
     }
     if(area>0)interiorAudit.floorZones.push({floor:f,name:r.name,material:kind,area:+area.toFixed(2)});
   }
   // Complete the floor between room fields with the same matte stone, including
   // the newly extended pavilion strips. Keep the vestibule and the stair bay
   // exactly as built in V3.14; never lay a finish over a tread or an inlay.
   const reserved=[...(f==='eg'?[[hallLeft,hallRight,hallBack,hallFront]]:[]),[-13.40,-6.60,-2.5,9.0],...occupied];
   for(const d of deck){
     let remainder=[d];for(const rect of reserved)remainder=remainder.flatMap(piece=>subtract(piece,rect));
     for(const rect of remainder)if(rect[1]-rect[0]>.003&&rect[3]-rect[2]>.003)surfaceRect(f,'stone',rect,y+.009);
   }
 }
 for(const [key,b] of floorBuffers){
   const [f,kind]=key.split(':');const geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geo.computeVertexNormals();
   const o=new THREE.Mesh(geo,floorMats[kind]);o.name='Roissy_Interiorboden_'+key;o.receiveShadow=true;layers[f].add(o);directMeshes++;
 }
 // V3.20: ceiling design attached to existing soffits; no fake ceilings in voids.
 // Each design uses clear room bounds and is verified against the actual slab.
 const ceilingArea=r=>Math.max(0,r[1]-r[0])*Math.max(0,r[3]-r[2]);
 function ceilingIntersection(a,b){return [Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.min(a[3],b[3])];}
 function ceilingBox(mat,rect,upper,drop,thickness,layer,deck){
   const area=ceilingArea(rect);if(area<1e-7)return;
   const supported=deck.reduce((n,d)=>n+ceilingArea(ceilingIntersection(rect,d)),0);
   if(Math.abs(supported-area)>1e-6)throw Error('Unattached ceiling trim '+JSON.stringify(rect));
   const [a,b,c,d]=rect;
   addBox(mat,(a+b)/2,upper-drop,(c+d)/2,b-a,thickness,d-c,layer);
   interiorAudit.ceilingReliefRects.push({mat,rect:rect.slice(),upper,drop,thickness,layer});
 }
 function ceilingFrame(rect,upper,layer,deck,mat,width,drop,thickness){
   const [a,b,c,d]=rect;if(b-a<=2*width||d-c<=2*width)return;
   for(const r of [[a,a+width,c,d],[b-width,b,c,d],[a+width,b-width,c,c+width],[a+width,b-width,d-width,d]])ceilingBox(mat,r,upper,drop,thickness,layer,deck);
 }
 const insetRect=(r,t)=>[r[0]+t,r[1]-t,r[2]+t,r[3]-t];
 function ceilingOval(rect,upper,layer){
   const [a,b,c,d]=rect,x=(a+b)/2,z=(c+d)/2,rx=(b-a)/2,rz=(d-c)/2;
   // Solid 3D plaster rings, not lights or emissive effects. Oval follows the room axis.
   for(const [fraction,tube,drop,mat] of [[1,.025,.030,'intStucRelief'],[.91,.014,.024,'intStucRecess']]){
     const geo=new THREE.TorusGeometry(1,tube,8,80);geo.rotateX(Math.PI/2);geo.scale(rx*fraction,1,rz*fraction);
     const o=mesh(geo,mat,'Roissy_Stuck_Ovalrahmen',layers[layer]);o.position.set(x,upper-drop,z);
   }
   interiorAudit.ceilingMedallions++;
 }
 function vestibuleDome(rect,upper,layer,deck){
   const area=ceilingArea(rect);if(area<1e-7)return;
   const supported=deck.reduce((n,d)=>n+ceilingArea(ceilingIntersection(rect,d)),0);
   if(Math.abs(supported-area)>1e-6)throw Error('Unattached vestibule dome '+JSON.stringify(rect));
   const [a,b,c,d]=rect,x=(a+b)/2,z=(c+d)/2,w=b-a,h=d-c;
   const ringRect=insetRect(rect,.10);
   ceilingFrame(ringRect,upper,layer,deck,'intStucRelief',.14,.050,.090);
   ceilingFrame(insetRect(ringRect,.22),upper,layer,deck,'intStucRecess',.05,.038,.060);
   const geo=new THREE.SphereGeometry(1,44,24,0,Math.PI*2,0,Math.PI/2);
   const domeMaterial=new THREE.MeshStandardMaterial({color:0xf2e9db,roughness:.94,metalness:0,side:THREE.DoubleSide});
   const dome=new THREE.Mesh(geo,domeMaterial); dome.name='Roissy_Vestibule_Kuppel'; dome.castShadow=true; dome.receiveShadow=true; layers[layer].add(dome); directMeshes++;
   dome.scale.set(w*.47,1.18,h*.47);
   dome.position.set(x,upper-.06,z);
   const drum=mesh(new THREE.TorusGeometry(1,.055,10,84),'intStucRelief','Roissy_Vestibule_Kuppelring',layers[layer]);
   drum.rotation.x=Math.PI/2;drum.scale.set(w*.43,1,h*.43);drum.position.set(x,upper-.09,z);
   const inner=mesh(new THREE.TorusGeometry(1,.028,8,72),'intStucRecess','Roissy_Vestibule_Kuppelring_Innen',layers[layer]);
   inner.rotation.x=Math.PI/2;inner.scale.set(w*.36,1,h*.36);inner.position.set(x,upper-.02,z);
   interiorAudit.domeCount++;
 }
 function designedCeiling(name,style,rect,upper,layer,deck){
   const [a,b,c,d]=rect,w=b-a,h=d-c;if(w<1.25||h<1.25)return;
   // Thin plaster field overlaps the backing physically, never coplanar with it.
   ceilingBox('intStucField',rect,upper,.006,.024,layer,deck);
   ceilingFrame(insetRect(rect,.045),upper,layer,deck,'intStucRelief',.12,.040,.080);
   ceilingFrame(insetRect(rect,.205),upper,layer,deck,'intStucRecess',.045,.029,.054);
   if(style==='grand'||style==='salon'||style==='stair'){
     const inner=insetRect(rect,.35);
     ceilingFrame(inner,upper,layer,deck,'intStucRelief',.085,.043,.078);
     ceilingFrame(insetRect(inner,.13),upper,layer,deck,'intStucRecess',.025,.028,.048);
     if(w>3.5&&h>3.5){
       const cx=(a+b)/2,cz=(c+d)/2,rx=Math.min(w*.28,2.35),rz=Math.min(h*.28,2.65);
       ceilingOval([cx-rx,cx+rx,cz-rz,cz+rz],upper,layer);
       // Four square corner reserves, distinct from central oval.
       if(style==='grand'||style==='salon')for(const sx of [-1,1])for(const sz of [-1,1]){
         const u=cx+sx*(w/2-.95),v=cz+sz*(h/2-.95),r=.26;
         ceilingFrame([u-r,u+r,v-r,v+r],upper,layer,deck,'intStucRelief',.055,.043,.074);
       }
     }
   }
   interiorAudit.ceilingDesigns.push({name,style,rect:rect.slice(),upper,layer});interiorAudit.ceilingFields++;
 }
 for(const f of ['eg','og'])for(const r of ROOMDATA[f]){
   if(/Vide sur|escalier|Escalier|Vestibule/.test(r.name))continue;
   const isSalon=r.name==='Salon',upper=(f==='og'||isSalon)?CORNICE-.283:OG-.228;
   const layer=isSalon?'og':f,deck=slabAudit[layer==='eg'?1:2].rectangles;
   const w=r.w-.58,d=r.d-.58;if(w<1.25||d<1.25)continue;
   if(roomType(r)==='salon'){
     const rect=isSalon?[-6.13,6.13,X.parkBack+.68,CROSS_WALL_Z-.58]:[r.x-w/2,r.x+w/2,r.z-d/2,r.z+d/2];
     designedCeiling(r.name,isSalon?'grand':'salon',rect,upper,layer,deck);
   }else{
     for(const sign of [-1,1]){
       addBox('intFrame',r.x+sign*w/2,upper-.035,r.z,.10,.07,d+.10,layer);
       addBox('intFrame',r.x,upper-.035,r.z+sign*d/2,w-.10,.07,.10,layer);
       addBox('intShadow',r.x+sign*(w/2-.14),upper-.025,r.z,.035,.05,d-.27,layer);
       addBox('intShadow',r.x,upper-.025,r.z+sign*(d/2-.14),w-.28,.05,.035,layer);
     }
     interiorAudit.ceilingFields++;
   }
 }
 // The upper roof slab spans the stairwell: ornament only at that level.
 designedCeiling('Grand escalier','stair',[-12.65,-7.20,-1.60,8.20],CORNICE-.283,'og',slabAudit[2].rectangles);
 // Vestibule ceilings: lower level keeps framed coffers around the central bay;
 // upper level receives a true shallow dome rather than a merely drawn circle.
 for(const f of ['eg','og']){
   const top=f==='eg'?OG-.228:CORNICE-.283,deck=slabAudit[f==='eg'?1:2].rectangles;
   const rangesX=[[hallLeft+.34,-2.24-.39],[-2.24+.39,2.24-.39],[2.24+.39,hallRight-.34]];
   const rangesZ=[[hallBack+.34,2.15-.41],[2.15+.41,6.45-.41],[6.45+.41,hallFront-.34]];
   const domeRect=[-3.55,3.55,1.05,8.05];
   for(const [a,b] of rangesX)for(const [c,d] of rangesZ){
     const w=b-a,h=d-c;if(w<.4||h<.4)continue;
     const rect=[a,b,c,d];
     const ix=ceilingIntersection(rect,domeRect);
     const overlap=ceilingArea(ix);
     if(f==='og'&&overlap>0.85*ceilingArea(rect))continue; // central bay reserved for dome
     ceilingBox('intStucField',rect,top,.005,.023,f,deck);
     ceilingFrame(rect,top,f,deck,'intStucRelief',.115,.042,.082);
     if(w>.85&&h>.85)ceilingFrame(insetRect(rect,.17),top,f,deck,'intStucRecess',.035,.028,.048);
     interiorAudit.ceilingFields++;
   }
   if(f==='og')vestibuleDome(domeRect,top,f,deck);
 }
 // V3.4 Salon gallery: the garden-side salon has a two-storey void.
 // The dividing wall on z=CROSS_WALL_Z has a single 4.9m opening at x=-2.45..2.45.
 // A 13-m railing behind/through that wall was geometrically WRONG and partly
 // embedded in stone. The guard now spans only the unprotected actual opening.
 // Side edges are guarded by the actual full-height masonry partitions at x=±6.72.
 const galleryZ=CROSS_WALL_Z+.12, galleryL=-2.45,galleryR=2.45;
 const galleryW=galleryR-galleryL;
 // A dressed lintel spans the lower portal and seals the deck/void transition.
 addBox('wall',0,OG-.37,CROSS_WALL_Z,4.90,.75,.46,'eg');
 addBox('trim',0,OG-.80,CROSS_WALL_Z,5.08,.11,.58,'eg');
 addBox('trim',0,OG-.69,CROSS_WALL_Z,5.16,.12,.61,'eg');
 // Upper portal head: the guard belongs to a framed opening, not a loose bar.
 addBox('wall',0,CORNICE-.89,CROSS_WALL_Z,4.90,1.34,.46,'og');
 addBox('trim',0,CORNICE-1.61,CROSS_WALL_Z,5.08,.10,.57,'og');
 for(const f of ['eg','og']){
   const y=f==='eg'?EG:OG,head=f==='eg'?OG-.86:CORNICE-1.66;
   for(const x of [-2.52,2.52]){
     addBox('stone',x,(y+head)/2,CROSS_WALL_Z,.14,head-y,.51,f);
     addBox('trim',x,y+.18,CROSS_WALL_Z,.23,.36,.58,f);
     addBox('trim',x,head-.09,CROSS_WALL_Z,.23,.18,.58,f);
   }
 }
 addBox('stone',0,OG+.065,galleryZ,galleryW,.13,.24,'og');
 const galleryIntervals=Math.ceil(galleryW/.15);
 for(let i=1;i<galleryIntervals;i++){
   const x=galleryL+i*galleryW/galleryIntervals;
   addBox('stairIron',x,OG+.57,galleryZ,.037,.91,.044,'og');
   addBox('gold',x,OG+.63,galleryZ,.065,.055,.065,'og');
 }
 addBox('stairIron',0,OG+.22,galleryZ,galleryW,.055,.07,'og');
 addBox('stairIron',0,OG+.96,galleryZ,galleryW,.055,.07,'og');
 addBox('stairHandrail',0,OG+1.035,galleryZ,galleryW,.10,.15,'og');
 for(const x of [galleryL+.1,galleryR-.1]){
   addBox('stone',x,OG+.52,galleryZ,.20,1.04,.23,'og');
   addBox('trim',x,OG+1.06,galleryZ,.26,.12,.28,'og');
 }
 // Delicate oval forged ornaments integrated between gallery rails.
 for(let i=-3;i<=3;i++){
   const x=i*.60;
   const ring=mesh(new THREE.TorusGeometry(.145,.017,6,24),'stairIron','Roissy_Galerie_Schmiedeeisen_Medaillon',layers.og);
   ring.scale.y=1.65;ring.position.set(x,OG+.60,galleryZ);
   addBox('intBrass',x,OG+.60,galleryZ,.061,.064,.060,'og');
 }
 collisionWalls.og.push({x0:galleryL,x1:galleryR,z0:galleryZ-.12,z1:galleryZ+.12});
 // Plan-aware partition wall with physical doorway holes and identical collider segments.
 function innerWall(f,axis,fixed,a,b,doorAt,doorW=1.38){
   const y=f==='eg'?EG:OG,upper=f==='eg'?OG+.005:CORNICE-.22;
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
      for(const side of [-1,1]){
        const topWidth=doorW+.32;
        const put=(mat,Y,w,h,depth,offset)=>axis==='x'?addBox(mat,d,Y,fixed+side*offset,w,h,depth,f):addBox(mat,fixed+side*offset,Y,d,depth,h,w,f);
        put('intFrame',y+2.965,topWidth,.10,.07,.205);
        put('intPanel',y+3.09,doorW+.19,.13,.035,.192);
        put('intFrame',y+3.19,topWidth+.08,.075,.09,.215);
      }
      interiorAudit.doorCrowns++;
      if(upper>y+2.80){
         if(axis==='x')addBox('wall',d,(upper+y+2.80)/2,fixed,doorW,upper-(y+2.80),.31,f);
         else addBox('wall',fixed,(upper+y+2.80)/2,d,.31,upper-(y+2.80),doorW,f);
         for(const side of [-1,1])finishWall(f,axis,fixed,left,right,y+2.80,upper,side,.155,false);
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
      for(const face of [-1,1])finishWall(f,axis,fixed,p,q,y,upper,face,.155,true,Math.abs(fixed)>20);
      // Low plinth and cap follow solid masonry rather than guessed door positions.
      if(q-p>.30){
        for(const face of [-1,1]){
          if(axis==='x'){
            addBox('stone',(p+q)/2,y+.105,fixed+face*.182,q-p-.07,.21,.054,f);
            addBox('trim',(p+q)/2,y+.228,fixed+face*.194,q-p-.07,.036,.078,f);
          }else{
            addBox('stone',fixed+face*.182,y+.105,(p+q)/2,.054,.21,q-p-.07,f);
            addBox('trim',fixed+face*.194,y+.228,(p+q)/2,.078,.036,q-p-.07,f);
          }
        }
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
      const groundStairDoorRemoved=f==='eg'&&Math.abs(x+13.26)<.15;
      const groundJunctionDoor=f==='eg'&&Math.abs(x-20.46)<.15;
      const entry=f==='og'&&Math.abs(x+13.21)<.15?9.68:
        f==='og'&&Math.abs(x+6.72)<.15?9.27:
        (westServiceDoor||eastUpperDoor)?7.30:
        groundJunctionDoor?5.75:5.30;
      innerWall(f,'z',x,CROSS_WALL_Z-.075,frontAt(x)-.12,groundStairDoorRemoved?[]:[entry],1.35);
   }
   for(const divider of SECONDARY_ROOM_WALLS[f]){
     innerWall(f,'x',divider.z,divider.from,divider.to,[divider.door],divider.width);
   }
 }
 // Solid head above the open stair bay, linking the adjacent partitions
 // at attic level; no masonry in the traversable mid-landing volume.
 const stairSpan=REAR_X_CUTS[3]-REAR_X_CUTS[2];
 const stairCentre=(REAR_X_CUTS[3]+REAR_X_CUTS[2])/2;
 addBox('wall',stairCentre,CORNICE-.61,CROSS_WALL_Z,stairSpan,1.0,.46,'og');
 addBox('trim',stairCentre,CORNICE-1.16,CROSS_WALL_Z,stairSpan,.10,.56,'og');
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
     addBox('intStairStone',cfg.x,y-.091,z,cfg.width,.182,dz+.012);
     const leading=z-cfg.direction*(dz*.486);
     // Closed limestone risers; a 13 mm nosing highlights the leading edge
     // without the former coarse white strip pattern.
     addBox('intStairStone',cfg.x,y-rise/2+.01,leading,cfg.width-.012,rise-.017,.064);
     addBox('intStairStone',cfg.x,y+.006,leading,cfg.width+.022,.013,.050);
   }
   // A continuous inclined stone structure closes the exposed undersides
   // of the floating treads seen from the lower storey in previous versions.
   const first=samples[0],last=samples.at(-1);
   stoneSlopedSlab('Roissy_Treppenuntersicht_Aus_Kalkstein',
     [cfg.x,first.y-.30,first.z],[cfg.x,last.y-.30,last.z],cfg.width-.16,.23,'intStairStone');
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
 addBox('intStairStone',S.landing.x,MID-.09,S.landing.z,S.landing.width,.18,S.landing.depth);
 // The transfer landing serves both flights, keeping the central turning zone clear.
 const secondRun=flight(S.second,RUN);
 // The new full-width front landing is carried by the main deck; fill
 // only the part of the small upper landing inside the stair aperture.
 const landingStart=S.upperLanding.z-S.upperLanding.depth/2;
 const landingEnd=stairVoid[3];
 addBox('intStairStone',S.upperLanding.x,OG-.095,(landingStart+landingEnd)/2,S.upperLanding.width,.19,landingEnd-landingStart);
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
   // Secondary slim bars close the large gaps between primary posts.
   for(let i=1;i<samples.length;i++){
     const a=samples[i-1],b=samples[i];
     for(const t of [1/3,2/3]){
       const z=a.z+(b.z-a.z)*t,top=a.y+(b.y-a.y)*t+h-.09;
       const base=t<.5?a.y:b.y;
       addBox('stairIron',x,(base+top)/2,z,.033,top-base,.033);stairAudit.balusters++;
     }
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
 // Both inner stair edges are now guarded. End the centre rails before the
 // transfer landing; the open U-turn remains unobstructed.
 for(const [samples,cfg,sign] of [[firstRun,S.first,1],[secondRun,S.second,-1]]){
   const x=cfg.x+sign*(cfg.width/2-.095),a=samples[0],b=samples.at(-1);
   beam('stairHandrail',[x,a.y+S.railHeight,a.z],[x,b.y+S.railHeight,b.z],.059);stairAudit.handrails++;
   beam('stairIron',[x,a.y+.21,a.z],[x,b.y+.21,b.z],.026);
   for(let i=0;i<samples.length-1;i++)for(const t of [0,1/3,2/3]){
     const q=samples[i],n=samples[i+1],z=q.z+(n.z-q.z)*t;
     const base=t<.5?q.y:n.y,top=q.y+(n.y-q.y)*t+S.railHeight-.045;
     addBox('stairIron',x,(base+top)/2,z,.034,top-base,.034);stairAudit.balusters++;
   }
   addBox('stairIron',x,b.y+.49,b.z,.05,.98,.05);stairAudit.balusters++;
 }
 for(let i=0;i<10;i++)for(const t of [1/3,2/3]){
   const x=S.landing.x-S.landing.width/2+.22+(S.landing.width-.44)*(i+t)/10;
   addBox('stairIron',x,MID+.54,S.landing.z-S.landing.depth/2+.12,.032,.98,.032);stairAudit.balusters++;
 }


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

 // Front landing is now continuous to the west suite; guard its edge
 // above the lower flight, not the route across the solid landing.
 const guardEdge=(x0,x1,z)=>{
   const n=Math.ceil((x1-x0)/.14);
   for(let i=0;i<=n;i++){
     const x=x0+(x1-x0)*i/n;
     addBox('stairIron',x,OG+.51,z,.041,.98,.045,'og');stairAudit.balusters++;
   }
   addBox('stairIron',(x0+x1)/2,OG+.20,z,x1-x0,.05,.075,'og');
   addBox('stairHandrail',(x0+x1)/2,OG+1.04,z,x1-x0,.10,.13,'og');
   for(const x of [x0,x1]){
     addBox('stone',x,OG+.50,z,.18,1,.18,'og');
     addBox('trim',x,OG+1.03,z,.24,.10,.24,'og');stairAudit.endPiers++;
   }
   collisionWalls.og.push({x0,x1,z0:z-.09,z1:z+.09});
 };
 guardEdge(stairVoid[0]+.10,S.upperLanding.x-S.upperLanding.width/2,stairVoid[3]+.10);
 // At the garden end, a real guard protects the opening above the mid-landing.
 guardEdge(stairVoid[0]+.10,stairVoid[1]-.10,stairVoid[2]-.12);
 stairAudit.handrails+=2;
 if(stairAudit.steps!==36||Math.abs(EG+36*rise-OG)>1e-7||stairAudit.railClearance<2.05)
   throw Error('Grand Escalier: Höhen oder freie Gehbreite widersprüchlich');
 // Courtyard perron, broad side terraces and central seven-step flight.
 const terraceEnd=PERRON.terraceEndZ;
 addBox('stone',0,(EG-.19)/2,(HALF_D+terraceEnd)/2,2*X.terraceHalf,EG-.19,terraceEnd-HALF_D+.16);
 addBox('floor',0,EG-.095,(HALF_D+terraceEnd)/2,2*X.terraceHalf,.19,terraceEnd-HALF_D+.16);
 for(let i=0;i<PERRON.steps;i++){
   const zz=PERRON.firstCentreZ+i*PERRON.treadDepth,h=(PERRON.steps-i)*EG/PERRON.steps;
   addBox('stone',0,h/2,zz,PERRON.width,h,PERRON.treadDepth+.015);
   addBox('trim',0,h-.025,zz+PERRON.treadDepth*.45,PERRON.width+.045,.05,.075);
 }
 for(const sign of [-1,1]){
   const a=PERRON.width/2,b=X.terraceHalf;
   addBox('stone',sign*(a+b)/2,EG+.43,terraceEnd-.12,b-a,.86,.34);
   addBox('trim',sign*(a+b)/2,EG+.91,terraceEnd-.12,b-a+.12,.13,.48);
 }
 // Historical elevations: continuous slate hip roof, three court pediments,
 // raised central attic and six chimneys. No donor portico or dome.
 const slate=new THREE.MeshStandardMaterial({name:'Roissy_Ardoise',color:0x4d555d,roughness:.89,metalness:.04,side:THREE.DoubleSide});cast.slate=slate;
 if(typeof document!=='undefined'){
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
   let seed=313;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
   ctx.fillStyle='#333b44';ctx.fillRect(0,0,256,256);
   for(let j=0;j<16;j++)for(let i=-1;i<8;i++){
     const x=i*32+(j%2)*16,y=j*16,v=103+Math.floor(rand()*25);
     ctx.fillStyle=`rgb(${v},${v+5},${v+12})`;ctx.fillRect(x+1,y+1,31,15);
     ctx.fillStyle='#47505b';ctx.fillRect(x+1,y+14,31,1);
     for(let k=0;k<10;k++){ctx.fillStyle=rand()>.5?'#ffffff12':'#00000012';ctx.fillRect(x+rand()*31,y+rand()*14,1+rand()*3,1);}
   }
   const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=8;slate.map=tex;slate.color.setHex(0xd6dce1);
 }
 const e=CORNICE+.18,shoulder=15.4,ridge=17.45,inset=2.7;
 function poly(pts,mat,name){const arr=[];for(let i=1;i<pts.length-1;i++)arr.push(...pts[0],...pts[i],...pts[i+1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));const p0=new THREE.Vector3(...pts[0]),u=new THREE.Vector3(...pts[1]).sub(p0).normalize(),n=u.clone().cross(new THREE.Vector3(...pts[2]).sub(p0)).normalize(),v=n.clone().cross(u);const uv=[];for(let i=0;i<arr.length;i+=3){const q=new THREE.Vector3(arr[i],arr[i+1],arr[i+2]).sub(p0);uv.push(q.dot(u)/2.5,q.dot(v)/3.5);}g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return mesh(g,mat,name);}
 const roofDormerAxes=FRONT_WINDOW_AXES.filter(x=>Math.abs(x)>6.7&&Math.abs(x)<X.wingX);
 const rearDormers=REAR_WINDOW_AXES.filter(x=>Math.abs(x)>6.7&&Math.abs(x)<24);
 const roofOpeningT0=.23,roofOpeningT1=.72;
 function roofPoint(x,t,sign){return [x,e+(shoulder-e)*t,sign*(HALF_D-inset*t)];}
 function slopePanel(left,right,t0,t1,sign,edgeL=false,edgeR=false){if(right-left<.001||t1-t0<.001)return;const L=t=>edgeL?-HALF_W+inset*t:left,R=t=>edgeR?HALF_W-inset*t:right;poly([roofPoint(L(t0),t0,sign),roofPoint(R(t0),t0,sign),roofPoint(R(t1),t1,sign),roofPoint(L(t1),t1,sign)],'slate','Schiefer_Mansardfläche');}
 for(const sign of [-1,1]){
   const axes=sign>0?roofDormerAxes:rearDormers;let cursor=-HALF_W,first=true;
   for(const x of axes){const a=x-.57,b=x+.57;slopePanel(cursor,a,0,1,sign,first,false);slopePanel(a,b,0,roofOpeningT0,sign);slopePanel(a,b,roofOpeningT1,1,sign);cursor=b;first=false;}
   slopePanel(cursor,HALF_W,0,1,sign,false,true);
   poly([[-HALF_W+inset,shoulder,sign*(HALF_D-inset)],[HALF_W-inset,shoulder,sign*(HALF_D-inset)],[HALF_W-7,ridge,0],[-HALF_W+7,ridge,0]],'slate','Schiefer_Oberdach');
 }
 for(const sign of [-1,1]){
   poly([[sign*HALF_W,e,-HALF_D],[sign*HALF_W,e,HALF_D],[sign*(HALF_W-inset),shoulder,HALF_D-inset],[sign*(HALF_W-inset),shoulder,-HALF_D+inset]],'slate','Schiefer_Walm');
   poly([[sign*(HALF_W-inset),shoulder,-HALF_D+inset],[sign*(HALF_W-inset),shoulder,HALF_D-inset],[sign*(HALF_W-7),ridge,0]],'slate','Schiefer_Oberwalm');
   for(const zsign of [-1,1]){beam('bronzeTrim',[sign*HALF_W,e+.04,zsign*HALF_D],[sign*(HALF_W-inset),shoulder+.04,zsign*(HALF_D-inset)],.05);beam('bronzeTrim',[sign*(HALF_W-inset),shoulder+.04,zsign*(HALF_D-inset)],[sign*(HALF_W-7),ridge+.04,0],.05);}
 }
 beam('bronzeTrim',[-HALF_W+7,ridge+.04,0],[HALF_W-7,ridge+.04,0],.065);
 // Dormer glazing within physically cut roof slopes. Slender French stone frames.
 for(const sign of [-1,1])for(const x of (sign>0?roofDormerAxes:rearDormers)){
   const z=sign*(HALF_D-1.25),y=14.05;
   for(const q of [-1,1])addBox('window',x+q*.59,y,z,.14,1.88,1.05);
   addBox('window',x,y-.90,z,1.30,.18,1.05);addBox('window',x,y+.90,z,1.30,.18,1.05);
   addBox('glass',x,y,z+sign*.54,1.04,1.60,.035);addBox('sash',x,y,z+sign*.56,.055,1.60,.07);addBox('sash',x,y,z+sign*.56,1.04,.055,.07);
   const peak=y+1.55,lo=y+.99;
   poly([[x-.79,lo,z+sign*.66],[x+.79,lo,z+sign*.66],[x,peak,z+sign*.66]],'window','Gauben_Dreiecksgiebel');
   for(const q of [-1,1])poly([[x,peak,z+sign*.68],[x+q*.80,lo,z+sign*.68],[x+q*.80,lo,z-sign*.68],[x,peak,z-sign*.68]],'slate','Gaubendach');
 }
 // Reliefs modelled in real geometry: stylised foliage and heraldic cartouche,
 // deliberately not claimed as a surviving exact sculptural reconstruction.
 function pediment(cx,z,w,base,peak,normal,name){
   const sh=new THREE.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,peak-base);sh.closePath();
   const g=mesh(new THREE.ExtrudeGeometry(sh,{depth:.28,bevelEnabled:false}),'stone',name);g.position.set(cx,base,z);if(normal<0)g.rotation.y=Math.PI;
   addBox('trim',cx,base-.045,z+normal*.13,w+.35,.20,.60);
   for(const q of [-1,1])beam('window',[cx+q*w/2,base+.03,z+normal*.35],[cx,peak+.03,z+normal*.35],.14);
   const med=mesh(new THREE.SphereGeometry(1,20,12),'window','Tympanon_Kartusche');med.scale.set(.50,.63,.13);med.position.set(cx,base+.76,z+normal*.34);
   for(const q of [-1,1])for(let i=0;i<7;i++){
      const d=.69+i*.38;if(d>w/2-1)continue;const h=Math.min(.68,(peak-base)*(1-d/(w/2))*.54);
      const leaf=mesh(new THREE.SphereGeometry(1,10,7),'window','Tympanon_Blattrelief');leaf.scale.set(.31,h*.52,.10);leaf.rotation.z=q*(.35+i*.08);leaf.position.set(cx+q*d,base+.23+h*.65,z+normal*.32);
   }
 }
 // The centre attics are built beyond the sloping roof skin, with real
 // apertures and side returns, rather than opaque boxes behind the glazing.
 function attic(sign,z,w,base,top){
   const a=-w/2,b=w/2,positions=[-3.6,0,3.6],h=top-base;
   wallSegments('x',z,a,b,{bottom:base,top,sill:.28,glassH:h-.56},positions.map(at=>({at,width:1.55})),.40);
   for(const x of positions){
     addBox('glass',x,base+h/2,z+sign*.02,1.43,h-.66,.045);addBox('sash',x,base+h/2,z+sign*.13,.065,h-.64,.08);
     for(const q of [-1,1])addBox('window',x+q*.86,base+h/2,z+sign*.23,.17,h-.38,.20);
     addBox('trim',x,top-.18,z+sign*.22,1.94,.16,.28);addBox('trim',x,base+.20,z+sign*.22,1.94,.12,.30);
   }
   for(const q of [-1,1])addBox('wall',q*(w/2-.16),base+h/2,z-sign*1.20,.34,h,2.4);
   addBox('trim',0,top+.02,z+sign*.10,w+.30,.28,.66);
   pediment(0,z+sign*.12,w+.32,top+.12,top+1.92,sign,sign>0?'Hof_Mittelgiebel':'Park_Mittelgiebel');
   for(const q of [-1,1])poly([[q*w/2,top+.1,z+sign*.17],[0,top+1.92,z+sign*.17],[0,top+1.92,z-sign*4.5],[q*w/2,top+.1,z-sign*4.5]],'slate','Mittelrisalit_Dach');
 }
 attic(1,HALF_D+.12,13.4,CORNICE+.12,15.25);attic(-1,X.parkBack-.12,13.4,CORNICE+.12,15.25);
 for(const q of [-1,1]){
   const cx=q*(HALF_W+X.wingX)/2,w=HALF_W-X.wingX,z=X.wingFront;
   pediment(cx,z+.22,w+.44,CORNICE+.13,15.02,1,q<0?'Westpavillon_Giebel':'Ostpavillon_Giebel');
   for(const sign of [-1,1])poly([[cx+sign*w/2,CORNICE+.16,z+.20],[cx,15.02,z+.20],[cx,15.02,8.15],[cx+sign*w/2,CORNICE+.16,8.15]],'slate','Pavillon_Querdach');
   const o=mesh(new THREE.SphereGeometry(1,16,12),'bronzeTrim','Pavillon_Oculus');o.scale.set(.30,.30,.055);o.position.set(cx,CORNICE+.82,z+.58);
 }
 for(const x of [-22.8,-14.1,-7.0,7.0,14.1,22.8]){
   addBox('stone',x,16.75,0,.72,3.0,.82);addBox('trim',x,18.24,0,.92,.22,1.02);
   for(const q of [-1,1])addBox('bronzeTrim',x+q*.19,18.39,0,.24,.13,.30);
 }
 // V3.20 intentionally adds no new interior light fixtures. Material realism is
 // developed first, while local lantern geometry and helper light sources stay absent
 // so the user can evaluate space purely through daylight and surface response.
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
 // Clip decorative skins exactly at junctions with perpendicular doorways.
 // Four original finish strips would otherwise extend a few centimetres into
 // the extended reveal even though the structural opening itself was clear.
 function cutSolid(record,cut){
   const lo=record.slice(0,3).map((v,i)=>v-record[i+3]/2),hi=record.slice(0,3).map((v,i)=>v+record[i+3]/2);
   const a=lo.map((v,i)=>Math.max(v,cut[i][0])),b=hi.map((v,i)=>Math.min(v,cut[i][1]));
   if(a.some((v,i)=>b[i]-v<1e-7))return [record];
   const result=[],l=lo.slice(),h=hi.slice();
   const emit=(L,H)=>{if(H.every((v,i)=>v-L[i]>1e-6))result.push([...L.map((v,i)=>(v+H[i])/2),...L.map((v,i)=>H[i]-v)]);};
   for(let i=0;i<3;i++){
     if(a[i]>l[i]+1e-6){const H=h.slice();H[i]=a[i];emit(l,H);l[i]=a[i];}
     if(b[i]<h[i]-1e-6){const L=l.slice();L[i]=b[i];emit(L,h);h[i]=b[i];}
   }
   return result;
 }
 let clippedFinishStrips=0;
 for(const [key,records] of batch){
   const [f,m]=key.split(':');if(f==='shell'||!m.startsWith('int')||m==='intStairStone')continue;
   let result=records;
   for(const d of interiorDoorways.filter(d=>d.floor===f)){
     const half=d.width/2-.04,vertical=[d.baseY+.02,d.baseY+2.78];
     const cut=d.axis==='x'?[[d.at-half,d.at+half],vertical,[d.fixed-.27,d.fixed+.27]]:[[d.fixed-.27,d.fixed+.27],vertical,[d.at-half,d.at+half]];
     result=result.flatMap(r=>{const out=cutSolid(r,cut);if(out.length!==1||out[0]!==r)clippedFinishStrips++;return out;});
   }
   batch.set(key,result);
 }
 interiorAudit.clippedFinishStrips=clippedFinishStrips;
 // Instanced stone geometry: one draw call per material and floor layer.
 const surfaceCleanup=resolveStaticFaces(THREE,batch,cast);
 const dummy=new THREE.Object3D();let renderBatches=0;
 for(const [key,group] of surfaceCleanup.groups){
   const [layer,mat]=key.split(':');const parent=layer==='shell'?root:layers[layer];
   const setup=o=>{o.receiveShadow=true;o.castShadow=!['glass','sash','bronzeTrim','ceiling'].includes(mat);parent.add(o);renderBatches++;};
   const metric=mat.startsWith('int')&&mat!=='intBrass'||mat==='ceiling';
   if(metric&&group.clean.length){
     const bg=baseGeo.index?baseGeo.toNonIndexed():baseGeo;
     const pos=bg.attributes.position,norm=bg.attributes.normal;
     for(const [x,y,z,w,h,d] of group.clean)for(let i=0;i<pos.count;i++){
       group.positions.push(x+pos.getX(i)*w,y+pos.getY(i)*h,z+pos.getZ(i)*d);group.normals.push(norm.getX(i),norm.getY(i),norm.getZ(i));
     }
     if(bg!==baseGeo)bg.dispose();
   }else if(group.clean.length){
     const o=new THREE.InstancedMesh(baseGeo,cast[mat],group.clean.length);o.name='Historische_Bauteile_'+key;o.frustumCulled=false;
     for(let i=0;i<group.clean.length;i++){const [x,y,z,w,h,d]=group.clean[i];dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,0,0);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);}
     o.instanceMatrix.needsUpdate=true;setup(o);
   }
   if(metric){group.uvs=[];for(let i=0;i<group.positions.length;i+=3){const [x,y,z]=group.positions.slice(i,i+3),[nx,ny,nz]=group.normals.slice(i,i+3);const scale=mat==='intHall'||mat==='intHallPanel'||mat==='intStairStone'?1.5:1.2;group.uvs.push((Math.abs(nx)>.5?z:x)/scale,(Math.abs(ny)>.5?-z:y)/scale);}}

   if(group.positions.length){
     const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(group.positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(group.normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(group.uvs,2));geo.computeBoundingSphere();
     const o=new THREE.Mesh(geo,cast[mat]);o.name='Roissy_Entflechtete_Flaechen_'+key;setup(o);
   }
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
 // V3.12 independent junction audit: the historical rear/entrance row
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
     joins.push({floor:f,type:'front-exterior',x,z:frontAt(x)-.12});
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
     if(i>0&&pts[i]-pts[i-1]<2.45)throw Error(`${which}: Fensteröffnungen überlappen`);
   }
 }
 return {front:root,facadeWidth:54,
   palaceDimensions:{width:54,depth:X.wingFront-X.parkBack,height:18.46,calibration:'approximate; existing core preserved and extended to represent historical setbacks'},
   buildings:['Château de Roissy – Hauptgebäude'],historicalFloors:ROOMDATA,historicalLayers:layers,
   interiorCollision:collisionWalls,upperDeckRectangles:slabAudit[1].rectangles,hallSupports,interiorDoorways,planPartitions:partitionRegister,entranceDoors:doors,
   instancedElements:[...batch.values()].reduce((s,a)=>s+a.length,0),instancedDrawcalls:renderBatches,staticConstructionBoxes:batch,
   planAxes:{frontDoors:FRONT_DOORS,frontWindows:FRONT_WINDOW_AXES,rearWindows:REAR_WINDOW_AXES},
   validations:{roomCountEG:ROOMDATA.eg.length,roomCountOG:ROOMDATA.og.length,directMeshes,interiorFinish:interiorAudit,surfaceCleanup:surfaceCleanup.stats,
     roofDormersPerSide:roofDormerAxes.length,roofPlaneCutouts:roofDormerAxes.length+rearDormers.length,
     floatingRoofDecor:0,orphanSideStairs:0,roofHipAndRidgeCaps:9,salonUpperDoorsIntoVoid:0,ceilingUndersides:true,
     roissyRoomOverlapCount:0,facadeOpeningsChecked:true,perronNavigationUsesStoneStepHeights:true,stairRailAnchoredToTreads:true,stairGeometrySharesNavigationConfig:true,
     salonGalleryGuardedWidth:galleryW,vestibuleSupports:hallSupports.length,stairInnerRails:2,stairRisersPerFlight:RUN,
     historicalExterior:true,exteriorSegments:FACADE_SEGMENTS.length,donorPorticoRemoved:true,cupolaRemoved:true,externalCornerQuoinsOnly:true,
     vestibuleNaturalStonePBR:true,vestibuleFloorSize:[vestibuleW,vestibuleD],
     roofOpeningSlope:[roofOpeningT0,roofOpeningT1],dormerGlassBackedBySolidStone:false,
     sideWindowsCheckedAgainstPartitionColliders:true,sideWindowCollisions:sideWindowConflicts.length,
     realDoorReveals:true,interiorLintelsClearHeight:2.80,
     fullDoorwayCoreCollisions:internalDoorClashes,doorsAndWindowsCheckedAgainstSolidGeometry:true,
     roofAndCeilingAreaConformsToPlan:false,steppedFootprint:true,slabPerimeterWallOverlap:[wallEmbedX,wallEmbedZ],
     deckEdgeSegments,slabOpeningIntrusions:holeSurfaceIntrusions,slabArealCoverage:slabArea,
     ceilingNeverBridgesSalonOrStair:true,grandEscalierConstruction:stairAudit,
     roomDerivedAxes:AXIS_AUDIT,partitionSegments:partitionRegister.length,derivedTransverseWallCount:SECONDARY_ROOM_WALLS.eg.length+SECONDARY_ROOM_WALLS.og.length,
     checkedMasonryJoins:joins.length+4,wallJoinConflicts:junctionProblems.length,
     historicGrandStairOpeningPreserved:true,exteriorConnectionOverlap:joinOverlap}
 };
}
