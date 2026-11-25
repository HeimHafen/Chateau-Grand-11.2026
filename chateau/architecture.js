import {installFurnishings} from './furnishings-v346.js?v=roissy347';
/**
 * CHÂTEAU GRAND V3.46 – Historische Hof- und Parkfassade mit verfeinerten Raumboeden.
 * Geometry + room register share one unit/metre plan with navigation.
 * Interior reproduces legible room sequences; not a documented survey in cm.
 * Historical elevations interpreted from Le Rouge, 1776; exact sculpture and dimensions not documented.
 */
import {installReferenceFixtures} from './reference-fixtures-v342.js?v=roissy347';
import {createInteriorDoorKit} from './interior-doors-v324.js?v=roissy347';
import {resolveStaticFaces} from './surface-cleanup.js?v=roissy347';
import {addPortalDoors,createOakFinish} from '../wohnzimmer/portal-doors-v2.js';
import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';
import {addRoissyPortal} from './portal-doors-v321.js?v=roissy347';
import {PLAN,STAIR_WEST,HALF_W,HALF_D,EG,OG,CORNICE,ROOMDATA,FRONT_DOORS,FRONT_WINDOW_AXES,REAR_WINDOW_AXES,SIDE_WINDOW_AXES,REAR_X_CUTS,REAR_X_CUTS_OG,FRONT_X_CUTS,CROSS_WALL_Z,GRAND_STAIR,PERRON,AXIS_AUDIT,SECONDARY_ROOM_WALLS,EXTERIOR,FACADE_SEGMENTS,frontAt,rearAt} from './roissy-config.js?v=roissy347';

export function buildChateau(THREE,scene,donor,mats,glass){
 const root=new THREE.Group();root.name='CHATEAU_ROISSY_V345_GRAND_ESCALIER';scene.add(root);
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
   intShadow:finish('Roissy_Profil_Kehle',0xd9ccba,.90,paintMaps,.05),
   intService:finish('Roissy_Nebenraum_Kalkputz',0xeae5d9,.96),
   intHall:finish('Roissy_Vestibule_Kalkstein',0xfff6e8,.91,stoneMaps,.17),
   intHallPanel:finish('Roissy_Vestibule_Geschliffener_Kalkstein',0xf3e8d7,.86,stoneMaps,.12),
   intSalon:finish('Roissy_Salon_Elfenbein',0xfffcf4,.88),
   intSalonPanel:finish('Roissy_Salon_Boiserie_Elfenbein',0xf3e9d8,.70,paintMaps,.07),
   intPrivatePanel:finish('Roissy_Chambre_Boiserie_Salbeigrau',0xd5d9cb,.76,paintMaps,.06),
   intPassagePanel:finish('Roissy_Passage_Boiserie_Sand',0xded2bd,.83,paintMaps,.07),
   intBasePaint:finish('Roissy_Sockel_Gestrichenes_Elfenbein',0xf0e6d6,.77,paintMaps,.045),
   intBaseStone:finish('Roissy_Sockel_Geschliffener_Kalkstein',0xf1e7d7,.86,stoneMaps,.12),
   intBaseRecess:finish('Roissy_Sockel_Schattenkehle',0xd8ccbb,.83,paintMaps,.045),
   intBaseCap:finish('Roissy_Sockel_Profilabschluss',0xf8f1e5,.76,paintMaps,.045),
   intStairStone:finish('Roissy_GrandEscalier_Kalkstein',0xfff5e6,.68,stoneMaps,.18),
   intStucField:finish('Roissy_Stuck_Innenfeld_Perlweiss',0xfff8ee,.94,plasterMaps,.07),
   intStucRelief:finish('Roissy_Stuck_Profil_Elfenbein',0xfff9ee,.86,paintMaps,.05),
   intStucRecess:finish('Roissy_Stuck_Kehle_Warmgrau',0xe1d4c0,.90,plasterMaps,.06),
   intBrass:new THREE.MeshStandardMaterial({name:'Roissy_Patinierte_Messingdetails',color:0xb39a6b,roughness:.48,metalness:.45})
 });
 const finishRegions={eg:[],og:[]},pendingWallFinishes=[];
 function roomAt(f,x,z){
   const cell=finishRegions[f].find(c=>x>=c.rect[0]-1e-6&&x<=c.rect[1]+1e-6&&z>=c.rect[2]-1e-6&&z<=c.rect[3]+1e-6);if(cell)return cell.room;
   const rooms=ROOMDATA[f];const distance=r=>Math.hypot(Math.max(0,Math.abs(x-r.x)-r.w/2),Math.max(0,Math.abs(z-r.z)-r.d/2));
   return rooms.reduce((best,r)=>distance(r)<distance(best)?r:best,rooms[0]);
 }
 function stairAntechamber(r){return r.level===0&&r.name==='Antichambre'&&r.x<-9&&r.x>-15;}
 function roomType(r){const n=r.name;
   if(stairAntechamber(r)||/Vestibule|Grand escalier/.test(n))return 'hall';
   if(/Salon|parade|Assemblée|Salle à manger|musique/.test(n))return 'salon';
   if(/Chambre|Cabinet/.test(n))return 'private';
   if(/Antichambre|Passage/.test(n))return 'passage';return 'service';
 }
 const palettes={hall:['intHall','intHallPanel'],salon:['intSalon','intSalonPanel'],private:['intPlaster','intPrivatePanel'],passage:['intPlaster','intPassagePanel'],service:['intService','intPanel']};
 // V3.35: room-specific painted boiseries, kept separate from the common
 // ivory mouldings and the existing limestone. All textures are local.
 const roomFinishes={
   salon:{label:'Elfenbein / Perlmutt',wall:'intSalon',panel:'intSalonPanel'},
   parade:{label:'Champagner / helles Greige',wall:'intSalon',panel:'intRoomParade'},
   dining:{label:'Warmes Weiss / Salbeigruen',wall:'intSalon',panel:'intRoomDining'},
   assembly:{label:'Elfenbein / heller Sand',wall:'intSalon',panel:'intRoomAssembly'},
   music:{label:'Perlweiss / rauchiges Blaugrau',wall:'intSalon',panel:'intRoomMusic'},
   bedroom:{label:'Kalkweiss / Salbeigrau',wall:'intPlaster',panel:'intPrivatePanel'},
   cabinet:{label:'Kalkweiss / gedämpftes Blaugrau',wall:'intPlaster',panel:'intRoomCabinet'},
   passage:{label:'Kalkweiss / Sand',wall:'intPlaster',panel:'intPassagePanel'},
   hall:{label:'Heller Kalkstein',wall:'intHall',panel:'intHallPanel'},
   service:{label:'Kalkputz / warmes Greige',wall:'intService',panel:'intPanel'}
 };
 Object.assign(cast,{
   intRoomParade:finish('Roissy_Boiserie_Champagner',0xe6d3b7,.70,paintMaps,.055),
   intRoomDining:finish('Roissy_Boiserie_Salbei',0xc5cdbb,.74,paintMaps,.06),
   intRoomAssembly:finish('Roissy_Boiserie_Sandsteinfarbig',0xe2d5bf,.73,paintMaps,.06),
   intRoomMusic:finish('Roissy_Boiserie_Rauchblau',0xc0cbd0,.73,paintMaps,.055),
   intRoomCabinet:finish('Roissy_Boiserie_Blaugrau',0xcbd2d0,.77,paintMaps,.06)
 });
 function roomFinishKey(r){
   const n=r.name;
   if(stairAntechamber(r)||/Vestibule|Grand escalier/.test(n))return 'hall';
   if(/parade/.test(n))return 'parade';
   if(/Salle à manger/.test(n))return 'dining';
   if(/Assemblée/.test(n))return 'assembly';
   if(/musique/.test(n))return 'music';
   if(/Salon/.test(n))return 'salon';
   if(/Chambre/.test(n)&&!/Antichambre/.test(n))return 'bedroom';
   if(/Cabinet/.test(n))return 'cabinet';
   if(/Antichambre|Passage/.test(n))return 'passage';
   return 'service';
 }
 const windowAudit=[];
 // Separate single-surface window glass: doors retain their existing material.
 const windowGlass=new THREE.MeshPhysicalMaterial({name:'Roissy_Klarglas_V340',color:0xf7fafb,roughness:.13,metalness:0,ior:1.52,clearcoat:.12,clearcoatRoughness:.15,transparent:true,opacity:.095,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
 cast.windowGlass=windowGlass;
 windowGlass.envMap=glass.envMap||null;
 windowGlass.onBeforeRender=()=>{if(glass.envMap&&windowGlass.envMap!==glass.envMap){windowGlass.envMap=glass.envMap;windowGlass.needsUpdate=true;}};
 cast.windowSash=finish('Roissy_Fensterholz_Warmes_Anthrazit',0x373632,.66,paintMaps,.045);
 cast.windowFillet=finish('Roissy_Fensterholz_Glasfalz_V340',0x49443d,.64,paintMaps,.035);
 cast.windowSill=finish('Roissy_Fensterbank_Geschliffener_Kalkstein_V340',0xeee4d4,.78,stoneMaps,.10);
 cast.windowGasket=finish('Roissy_Fensterholz_Schattenfalz_V340',0x302d29,.80,paintMaps,.03);
 const windowHardwareParts=[];
 cast.windowBead=finish('Roissy_Fensterholz_Profil',0x514a40,.72,paintMaps,.035);
 cast.windowReveal=finish('Roissy_Fensterlaibung_Geschliffener_Kalkstein',0xf2e8d7,.89,stoneMaps,.10);
 const stairWalnut=createOakFinish(THREE,0x634432);stairWalnut.name='Roissy_Treppe_Poliertes_Dunkelholz';stairWalnut.roughness=.29;
 Object.assign(cast,{stairWalnut,stairForged:new THREE.MeshStandardMaterial({name:'Roissy_Treppe_Schmiedeeisen_Satin',color:0x242322,metalness:.68,roughness:.32}),stairPatina:new THREE.MeshStandardMaterial({name:'Roissy_Treppe_Messing_Patiniert',color:0xc39a51,metalness:.73,roughness:.29}),intStairMolding:finish('Roissy_Treppe_Geschliffener_Kalkstein',0xfff5e6,.66,stoneMaps,.12),intStairInlay:finish('Roissy_Treppe_Steinfries_Taupe',0xa99a86,.92,stoneMaps,.09)});
 cast.stairScroll=cast.stairForged;
 const interiorAudit={wallFaces:0,panelFields:0,baseboardRuns:[],dadoRuns:[],doorCrowns:0,floorZones:[],floorRects:[],ceilingFields:0,fixtureCount:0,wallTypes:{},salonDoubleProfiles:0,ceilingDesigns:[],ceilingReliefRects:[],ceilingMedallions:0,domeCount:0,stairDoubleProfiles:0,stairWallCartouches:[],stairCorniceRuns:[],stairCeilingCorners:0,formalWallPanels:[],formalDadoPanels:[],formalReliefs:[],roomFinishAssignments:[],ceilingCorniceRuns:[],plainCeilingFields:[],domeGeometry:null};
 // V3.28: modelled low relief cartouches in the upper panel thirds, in the
 // exact wall-plane coordinate system. Shared merged buffers keep drawcalls low.
 const stairWallReliefs={eg:[],og:[]};
 function stairCartouche(f,axis,fixed,side,edge,m,Y,pw,bottom,upper){
   const radius=Math.min(.31,pw*.205),cx=m,cy=Y;
   const parts=stairWallReliefs[f];
   const add=(g,u,v,depth,angle=0)=>{
     g.rotateZ(angle);g.translate(u,v,depth);
     // Local z points out of the wall, towards the stair room.
     if(axis==='x'){if(side<0)g.rotateY(Math.PI); /* mirror u positions about centre */
       g.translate(cx,cy,fixed+side*(edge+.030));}
     else {g.rotateY(side*Math.PI/2);g.translate(fixed+side*(edge+.030),cy,cx);}
     if(g.index){parts.push(g.toNonIndexed());g.dispose();}else parts.push(g);
   };
   // Oval raised shield and continuous carved bead, flanked by leaf sprays.
   const shield=new THREE.SphereGeometry(1,20,12);shield.scale(radius*.47,radius*.67,.028);add(shield,0,0,.011);
   const rim=new THREE.TorusGeometry(1,.060,8,44);rim.scale(radius*.55,radius*.75,.17);add(rim,0,0,.009);
   for(const d of [-1,1])for(let i=0;i<3;i++){
     const leaf=new THREE.SphereGeometry(1,12,8);leaf.scale(radius*.115,radius*.29,.018);
     add(leaf,d*radius*(.65+i*.25),radius*(-.31+i*.19),.016,-d*(.67+i*.12));
   }
   const crown=new THREE.SphereGeometry(1,12,8);crown.scale(radius*.17,radius*.20,.019);add(crown,0,radius*.76,.016);
   interiorAudit.stairWallCartouches.push({floor:f,axis,fixed,side,edge,centre:[m,Y],radius,panel:[m-pw/2,m+pw/2,bottom,upper]});
 }
 // V3.35: restrained Louis XIV-inspired leaf-and-shell relief, in the
 // coordinate system of the actual wall face. One merged mesh per floor.
 const formalParts={eg:[],og:[]};
 function formalRelief(f,axis,fixed,side,edge,m,Y,r,room,panel){
   const parts=formalParts[f];
   function add(g,u,v,depth,angle=0){
     g.rotateZ(angle);g.translate(u,v,depth);
     if(axis==='x'){if(side<0)g.rotateY(Math.PI);g.translate(m,Y,fixed+side*edge);}
     else{g.rotateY(side*Math.PI/2);g.translate(fixed+side*edge,Y,m);}
     const q=g.index?g.toNonIndexed():g;parts.push(q);if(q!==g)g.dispose();
   }
   // Fluted shell crown with a small central boss and symmetric laurel sprays.
   for(let i=-3;i<=3;i++){
     const a=i*.25,g=new THREE.SphereGeometry(1,8,5);
     g.scale(r*.095,r*(.40-Math.abs(i)*.035),.018);
     add(g,Math.sin(a)*r*.29,Math.cos(a)*r*.26,.047,-a);
   }
   const boss=new THREE.SphereGeometry(1,12,8);boss.scale(r*.18,r*.12,.022);add(boss,0,-r*.09,.049);
   for(const sign of [-1,1])for(let i=0;i<4;i++){
     const g=new THREE.SphereGeometry(1,8,5);g.scale(r*.10,r*.25,.014);
     add(g,sign*r*(.32+i*.18),r*(-.19+i*.09),.044,-sign*(.77+i*.12));
   }
   interiorAudit.formalReliefs.push({floor:f,axis,fixed,side,edge,centre:[m,Y],radius:r,room,panel});
 }
 // All profiles are fitted to existing masonry, not to an independent guessed room grid.
 function finishWall(...args){pendingWallFinishes.push(args);}
 function buildWallFinish(f,axis,fixed,p,q,low,high,side,edge,full,service=false){
   if(q-p<.025||high-low<.025)return;
   const adjacentRoom=at=>roomAt(f,axis==='x'?at:fixed+side*(edge+.12),axis==='x'?fixed+side*(edge+.12):at);
   const category=at=>roomType(adjacentRoom(at));
   const roomFinish=at=>roomFinishes[roomFinishKey(adjacentRoom(at))];
   const type=category((p+q)/2);const stairWall=/Grand escalier/.test(roomAt(f,axis==='x'?(p+q)/2:fixed+side*(edge+.12),axis==='x'?fixed+side*(edge+.12):(p+q)/2).name);service=type==='service';interiorAudit.wallTypes[type]=(interiorAudit.wallTypes[type]||0)+1;
   const put=(mat,at,Y,w,h,depth,offset)=>axis==='x'
     ?addBox(mat,at,Y,fixed+side*(edge+offset),w,h,depth,f)
     :addBox(mat,fixed+side*(edge+offset),Y,at,depth,h,w,f);
   // Closed wall finish; the backing masonry stays untouched. Continuous
   // 4-part skirting replaces the previous competing stone and painted plinths.
   const selected=adjacentRoom((p+q)/2),scheme=roomFinish((p+q)/2);
   put(scheme.wall,(p+q)/2,(low+high)/2,q-p,high-low-.002,.012,.006);
   interiorAudit.roomFinishAssignments.push({floor:f,room:selected.name,roomCentre:[selected.x,selected.z],scheme:roomFinishKey(selected),wall:scheme.wall,panel:scheme.panel,axis,fixed,side,edge,from:p,to:q,low,high});
   interiorAudit.wallFaces++;
   const base=f==='eg'?EG:OG,span=q-p,mid=(p+q)/2,height=high-low;
   if(Math.abs(low-base)<1e-6&&height>.26&&span>.025){
     const stone=type==='hall',body=stone?'intBaseStone':'intBasePaint';
     // The bottom edge meets the existing finish at base + .009m.
     // Depth measured from actual masonry face; maximum projection 66 mm.
     const profiles=[[body,.079,.148,.050,.029],['intBaseRecess',.164,.022,.046,.030],[body,.191,.032,.060,.034],[stone?'intBaseStone':'intBaseCap',.224,.034,.067,.0325]];
     for(const [mat,Y,h,depth,offset] of profiles)put(mat,mid,base+Y,span,h,depth,offset);
     interiorAudit.baseboardRuns.push({floor:f,axis,fixed,side,edge,from:p,to:q,type,partial:!full});
     // Full-width lower wall lining. At windows stop beneath the projecting sill.
     // The rail must not continue across a doorway or the glass aperture.
     const upperDado=full?1.017:Math.min(1.017,height-.20);
     if(upperDado>.28){
       put(scheme.panel,mid,base+(.242+upperDado)/2,span,upperDado-.242,.018,.021);
       if(full){
         put('intFrame',mid,base+1.045,span,.055,.052,.047);
         put('intShadow',mid,base+1.10,span,.026,.035,.038);
       }
       if(type!=='salon'&&!service&&span>.85&&upperDado>.64){const n=Math.max(1,Math.round(span/1.7));for(let i=0;i<n;i++){const w=span/n-.22,m=p+(i+.5)*span/n,lo=base+.37,hi=base+upperDado-.13;if(w<.45||hi-lo<.15)continue;for(const sign of [-1,1]){put('intFrame',m+sign*w/2,(lo+hi)/2,.025,hi-lo,.025,.036);put('intFrame',m,sign<0?lo:hi,w-.025,.025,.025,.036);}}}
       interiorAudit.dadoRuns.push({floor:f,axis,fixed,side,from:p,to:q,type,top:upperDado});
     }
   }
   if(!full||q-p<.62)return;
   const exteriorEdge=(v)=>FACADE_SEGMENTS.some(w=>w.axis!==axis&&Math.abs(w.fixed-v)<.24&&fixed>=w.a-.24&&fixed<=w.b+.24);
   const a=p+(exteriorEdge(p)?.45:.22),b=q-(exteriorEdge(q)?.45:.22),w=b-a,c=(a+b)/2;
   if(w<.17)return;
   const top=high-.31;
   // V3.46: the continuous soffit cornice is generated once after all walls.
   // Do not install disconnected decorative bars at each window/door segment.
   if(service||w<.70)return;
   const n=Math.max(1,Math.round(w/2.2)),bay=w/n;
   for(let i=0;i<n;i++){
     const m=a+(i+.5)*bay,pw=bay-.20, bottom=low+1.38, upper=top-.40;
     if(pw<.40||upper-bottom<.65)continue;
     put(roomFinish(m).panel,m,(bottom+upper)/2,pw,upper-bottom,.018,.022);
     for(const d of [-1,1]){
       put('intShadow',m+d*(pw/2-.035),(bottom+upper)/2,.07,upper-bottom,.027,.034);
       put('intFrame',m+d*(pw/2-.035),(bottom+upper)/2,.034,upper-bottom-.035,.042,.045);
       put('intShadow',m,d<0?bottom+.035:upper-.035,pw-.14,.07,.027,.034);
       put('intFrame',m,d<0?bottom+.035:upper-.035,pw-.14,.035,.042,.045);
     }
     // Formal boiserie: a broad recessed field and finely graduated frame.
     // All details remain within the panel, rather than covering apertures.
     const actualRoom=roomAt(f,axis==='x'?m:fixed+side*(edge+.12),axis==='x'?fixed+side*(edge+.12):m);
     if(type==='salon'&&roomType(actualRoom)==='salon'&&pw>1.02&&upper-bottom>1.20){
       const inset=.20,iw=pw-2*inset,ih=upper-bottom-2*inset;
       for(const sign of [-1,1]){
         put('intShadow',m+sign*iw/2,(bottom+upper)/2,.018,ih,.014,.031);
         put('intShadow',m,sign<0?bottom+inset:upper-inset,iw-.018,.018,.014,.031);
       }
       interiorAudit.formalWallPanels.push({floor:f,axis,fixed,side,edge,room:actualRoom.name,panel:[m-pw/2,m+pw/2,bottom,upper]});
       if(pw>1.12&&upper-bottom>1.7){
         const r=Math.min(.26,(pw-.44)/2.6);
         formalRelief(f,axis,fixed,side,edge,m,upper-.48,r,actualRoom.name,[m-pw/2,m+pw/2,bottom,upper]);
       }
       if(Math.abs(low-base)<1e-6){
         const lo=base+.36,hi=base+.90,hw=(pw-.24)/2,hh=(hi-lo)/2,cy=(lo+hi)/2;
         for(const sign of [-1,1]){
           put('intFrame',m+sign*hw,cy,.032,hi-lo,.025,.038);
           put('intFrame',m,cy+sign*hh,2*hw-.032,.032,.025,.038);
         }
         interiorAudit.formalDadoPanels.push({floor:f,axis,fixed,side,room:actualRoom.name,panel:[m-hw-.016,m+hw+.016,lo-.016,hi+.016]});
       }
     }
     // Private rooms use a small, quiet inner bead, not the salon's richer relief.
     if(type==='private'&&category(m)==='private'&&pw>.85&&upper-bottom>1.0){
       const inset=.12,iw=pw-2*inset,ih=upper-bottom-2*inset;
       for(const d of [-1,1]){
         put('intFrame',m+d*iw/2,(bottom+upper)/2,.018,ih,.016,.030);
         put('intFrame',m,d<0?bottom+inset:upper-inset,iw-.018,.018,.016,.030);
       }
     }
     // Refined inner bead and recessed field, limited to solid salon panels.
     if((type==='salon'||stairWall)&&pw>1.02&&upper-bottom>1.20){
       const ix=pw/2-.135, iy=.135, ih=upper-bottom-2*iy;
       for(const side of [-1,1]){
         put('intStucRelief',m+side*ix,(bottom+upper)/2,.026,ih,.020,.038);
         put('intStucRelief',m,side<0?bottom+iy:upper-iy,pw-.27-.026,.026,.020,.038);
       }
       if(stairWall&&type!=='salon'&&pw>1.20){
         const inset=.205,insideW=pw-2*inset,insideH=upper-bottom-2*inset;
         for(const d of [-1,1]){
           put('intShadow',m+d*insideW/2,(bottom+upper)/2,.014,insideH,.014,.032);
           put('intShadow',m,d<0?bottom+inset:upper-inset,insideW-.014,.014,.014,.032);
         }
       }
       if(stairWall&&type!=='salon'&&pw>1.20&&upper-bottom>1.65){
         stairCartouche(f,axis,fixed,side,edge,m,upper-.53,pw,bottom,upper);
       }
       if(type==='salon')interiorAudit.salonDoubleProfiles++;else interiorAudit.stairDoubleProfiles++;
     }
     interiorAudit.panelFields++;
   }
 }
 const baseGeo=new THREE.BoxGeometry(1,1,1),batch=new Map(), collisionWalls={eg:[],og:[]};
 const interiorDoorways=[]; // audited physical openings: floor, wall, position, clear geometry
 const partitionRegister=[]; // structural walls: floor, orientation, span, and doorway apertures
 const doors=[],interiorDoors=[]; let directMeshes=0;
 const interiorDoorKit=createInteriorDoorKit(THREE);cast.doorFrame=interiorDoorKit.frame;
 function addBox(mat,x,y,z,w,h,d,layer='shell'){
   if(![x,y,z,w,h,d].every(Number.isFinite)||w<=0||h<=0||d<=0)throw Error('Invalid geometry: '+[mat,x,y,z,w,h,d]);
   const k=layer+':'+mat; if(!batch.has(k))batch.set(k,[]);batch.get(k).push([x,y,z,w,h,d]);
 }
 function mesh(geo,mat,name,parent=root){const o=new THREE.Mesh(geo,cast[mat]||mat);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);directMeshes++;return o;}
 function cyl(mat,x,y,z,r,h,segments=22){const a=mesh(new THREE.CylinderGeometry(r,r,h,segments),mat,'Steinrundelement');a.position.set(x,y,z);return a;}
 function beam(mat,from,to,r=.075){const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),v=b.clone().sub(a),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),mat==='stairWalnut'?20:8),mat,'Dachprofil');o.position.copy(a.add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
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
 // All windows use one glazing plane, real frame profiles and continuous inner reveals.
 function detailedWindow(axis,fixed,at,y,width,height,normal,arched=false,kind='facade'){
   const r=width/2, spring=height-r, f=.064, glassR=r-f, depth=.13;
   const put=(m,u,Y,w,h,d,offset)=>axis==='x'?addBox(m,at+u,y+Y,fixed+normal*offset,w,h,d):addBox(m,fixed+normal*offset,y+Y,at+u,d,h,w);
   const place=(o,offset)=>{o.position.set(axis==='x'?at:fixed+normal*offset,y,axis==='x'?fixed+normal*offset:at);o.rotation.y=axis==='x'?(normal>0?0:Math.PI):(normal>0?Math.PI/2:-Math.PI/2);return o;};
   function outline(rad,bottom){const sh=new THREE.Shape();sh.moveTo(-rad,bottom);sh.lineTo(rad,bottom);sh.lineTo(rad,spring);sh.absarc(0,spring,rad,0,Math.PI,false);sh.closePath();return sh;}
   function archBand(outer,inner,outerBottom,innerBottom,thick,offset,mat,name){const sh=outline(outer,outerBottom),hole=new THREE.Path();hole.moveTo(-inner,innerBottom);hole.lineTo(-inner,spring);hole.absarc(0,spring,inner,Math.PI,0,true);hole.lineTo(inner,innerBottom);hole.closePath();sh.holes.push(hole);return place(mesh(new THREE.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:false,curveSegments:32}),mat,name),offset);}
   let geo;
   if(arched)geo=new THREE.ShapeGeometry(outline(glassR,f),40);
   else{geo=new THREE.PlaneGeometry(width-2*f,height-2*f);geo.translate(0,height/2,0);}
   const pane=place(mesh(geo,'windowGlass','Roissy_Klarglas_'+kind),0);pane.castShadow=false;pane.receiveShadow=false;
   pane.userData.windowOpening={axis,fixed,at,y,width,height,normal,arched,kind};
   windowAudit.push(pane.userData.windowOpening);
   const detail=pane.userData.windowDetail={perimeterProfiles:0,glazingBarProfiles:0,hardware:false,sill:false};
   const H=arched?spring:height;
   if(arched){
     archBand(r,glassR,0,f,depth,-depth/2,'windowSash','Roissy_Bogenholzrahmen');
     if(kind==='facade')archBand(r+.012,r-.002,-.012,.002,.17,-.23,'windowReveal','Roissy_Innenbogenlaibung');
   }else{
     for(const q of [-1,1])put('windowSash',q*(r-f/2),height/2,f,height,depth,0);
     for(const Y of [f/2,height-f/2])put('windowSash',0,Y,width-2*f,f,depth,0);
   }
   // True central meeting stile, horizontal glazing bars, visible from BOTH sides.
   put('windowSash',0,H/2,.071,H-2*f,.115,0);
   const rows=kind==='facade'?4:2;
   for(let i=1;i<rows;i++)put('windowSash',0,f+(H-2*f)*i/rows,width-2*f,.038,.085,0);
   if(arched){
     put('windowSash',0,spring,width-2*f,.062,.10,0);
     const spokeR=glassR-.028;
     for(const angle of [Math.PI/4,Math.PI/2,3*Math.PI/4]){
       const from=[0,spring,0],to=[spokeR*Math.cos(angle),spring+spokeR*Math.sin(angle),0];
       const A=new THREE.Vector3(...from),B=new THREE.Vector3(...to),v=B.clone().sub(A),g=new THREE.BoxGeometry(.038,v.length(),.07);g.rotateZ(-Math.atan2(v.x,v.y));g.translate((A.x+B.x)/2,(A.y+B.y)/2,0);place(mesh(g,'windowSash','Roissy_Faecher_Sprosse'),0);
     }
   }
   // Narrow glazing beads sit on the existing frame, not across the clear glass.
   // Two stepped profiles on both faces; same aperture and centreline as V3.39.
   for(const face of [-1,1]){
     if(arched){
       archBand(r-.019,r-.052,.019,.052,.012,face>0?.064:-.076,'windowFillet','Roissy_Glasfalz_Bogen_V340');
       detail.perimeterProfiles++;
     }else{
       for(const q of [-1,1])put('windowFillet',q*(r-.036),height/2,.027,height-.028,.013,face*.071);
       for(const Y of [.036,height-.036])put('windowFillet',0,Y,width-.099,.027,.013,face*.071);
       detail.perimeterProfiles+=4;
     }
     put('windowFillet',0,H/2,.035,H-2*f,.014,face*.062);detail.glazingBarProfiles++;
     for(let i=1;i<rows;i++){
       const Y=f+(H-2*f)*i/rows;
       for(const q of [-1,1])put('windowFillet',q*(glassR+.036)/2,Y,glassR-.036,.019,.012,face*.047);
       detail.glazingBarProfiles+=2;
     }
     if(arched){put('windowFillet',0,spring,width-2*f,.028,.012,face*.056);detail.glazingBarProfiles++;}
   }
   if(kind==='facade'){
     // Finish wraps the masonry opening up to the wooden frame. The chamfered
     // face mouldings project only toward the room, not into the light opening.
     if(!arched){
       for(const q of [-1,1])put('windowReveal',q*(r+.014),height/2,.032,height,.177,-.1465);
       put('windowReveal',0,height+.014,width+.06,.032,.177,-.1465);
     }
     // Continuous three-step stone sill. No ledge is higher than the glass bottom.
     put('windowSill',0,-.047,width+.20,.094,.394,-.243);
     put('windowSill',0,-.075,width+.24,.040,.086,-.463);
     put('windowReveal',0,-.119,width+.18,.050,.106,-.418);
     put('intFrame',0,-.166,width+.12,.044,.094,-.328);
     detail.sill=true;
     for(const q of [-1,1]){
       put('windowReveal',q*(r+.065),H/2,.11,H+.025,.074,-.265);
       put('windowSill',q*(r+.093),H/2,.029,H+.016,.026,-.314);
       put('windowGasket',q*(r-.006),H/2,.012,H-.04,.018,-.078);
     }
     if(!arched){
       put('windowReveal',0,height+.065,width+.24,.11,.074,-.265);
       put('windowSill',0,height+.093,width+.215,.029,.026,-.314);
     }else{
       archBand(r+.12,r+.015,-.025,.001,.07,-.30,'windowReveal','Roissy_Innenarchivolte');
       archBand(r+.108,r+.079,-.016,.001,.026,-.327,'windowSill','Roissy_Innenbogenprofil_V340');
     }
     // Brass espagnolette: a slim central rod, stepped mounts and rounded grip.
     // Local hardware geometry is merged globally into one draw call.
     const handleY=Math.min(H-.24,height*.46);
     put('intBrass',0,H/2,.016,H-.34,.024,-.080);
     put('intBrass',0,handleY,.050,.21,.026,-.096);
     for(const Y of [f+.17,H-f-.17])put('intBrass',0,Y,.038,.055,.034,-.092);
     const angle=axis==='x'?(normal>0?0:Math.PI):(normal>0?Math.PI/2:-Math.PI/2);
     function hardware(g,u,Y,offset){
       g.translate(u,Y,offset);g.rotateY(angle);g.translate(axis==='x'?at:fixed,y,axis==='x'?fixed:at);
       if(g.index){const q=g.toNonIndexed();g.dispose();g=q;}windowHardwareParts.push(g);
     }
     const grip=new THREE.CapsuleGeometry(.017,.115,4,8);grip.rotateZ(Math.PI/2);hardware(grip,-.062,handleY,-.146);
     const neck=new THREE.CylinderGeometry(.015,.015,.055,10);neck.rotateX(Math.PI/2);hardware(neck,0,handleY,-.123);
     for(const q of [-1,1])for(const Y of [.26,H-.26]){
       put('windowFillet',q*(r-f-.015),Y,.035,.105,.05,-.075);
       // Slim vertical hinge barrels on the interior face of each sash.
       hardware(new THREE.CylinderGeometry(.012,.012,.092,10),q*(r-f-.012),Y,-.108);
     }
     detail.hardware=true;
   }
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
     const frame=archShape(r+.19,-.08),hole=new THREE.Path();hole.moveTo(-r,isDoor?-.08:0);hole.lineTo(-r,spring);hole.absarc(0,spring,r,Math.PI,0,true);hole.lineTo(r,isDoor?-.08:0);hole.closePath();frame.holes.push(hole);
     let archFrame=frame;if(isDoor){archFrame=new THREE.Shape();archFrame.moveTo(-r-.19,0);archFrame.lineTo(-r-.19,spring);archFrame.absarc(0,spring,r+.19,Math.PI,0,true);archFrame.lineTo(r+.19,0);archFrame.lineTo(r,0);archFrame.lineTo(r,spring);archFrame.absarc(0,spring,r,0,Math.PI,false);archFrame.lineTo(-r,0);archFrame.closePath();}
     const f=mesh(new THREE.ExtrudeGeometry(archFrame,{depth:.20,bevelEnabled:false}),'window','Roissy_Bogenarchivolte');transform(f,.23);
     if(isDoor){
       const door=addRoissyPortal(THREE,root,mats,glass,at,fixed,width,height,y);doors.push({x:at,z:fixed,base:y,door});
     }else{
       detailedWindow(axis,fixed,at,y,width,height,direction,true);
       along('trim',at,y-.16,width+.46,.10,.76,.34);
       along('stone',at,y-.07,width+.28,.11,.42,.28);
     }
     if(isDoor)for(const q of [-1,1])along('window',at+q*(r+.085),y+spring/2,.17,spring,.27,-.18);
     along('trim',at,y+height+.03,width+.18,.08,.20,.14);
     along('stone',at,y+height+.10,.28,.34,.30,.39);
     return;
   }
   if(!isDoor){
     detailedWindow(axis,fixed,at,y,width,height,direction);
   }
   for(const sgn of [-1,1])along('window',at+sgn*(width/2+.04),y+height/2,.22,height+.34,.52,.27);
   along('trim',at,y+height+.12,width+.42,.20,.60,.30);
   along('window',at,y+height+.31,width+.60,.10,.66,.34);
   along('window',at,y-.10,width+.44,.16,.64,.30);
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
     let ranges=[[a-.23,b+.23]];
     if(excludeEntrance&&y<EG+.5)for(const x of FRONT_DOORS){const half=apertureWidth(axis,x,0,true)/2+.23;
       ranges=ranges.flatMap(([l,r])=>x+half<=l||x-half>=r?[[l,r]]:[[l,Math.max(l,x-half)],[Math.min(r,x+half),r]].filter(q=>q[1]-q[0]>.001));}
     for(const [l,r] of ranges){put('trim',(l+r)/2,y,r-l,.19,.64);put('window',(l+r)/2,y+.16,r-l,.085,.58);}
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
 const FLOOR_MAP_PREFIX='./assets/interior/v342_limestone_';
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
   roughnessMap:floorTexture('roughness'),roughness:.65,metalness:0,
   normalScale:new THREE.Vector2(.22,.22),color:0xf5efe6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2
 });
 const hallLeft=FRONT_X_CUTS[3]+.155,hallRight=FRONT_X_CUTS[4]-.155;
 const hallBack=CROSS_WALL_Z+.155,hallFront=HALF_D-.23;
 const vestibuleW=hallRight-hallLeft,vestibuleD=hallFront-hallBack,vestibuleZ=(hallBack+hallFront)/2;
 const centralFloor=new THREE.Mesh(new THREE.PlaneGeometry(vestibuleW,vestibuleD),vestibulePBR);
 const hallUV=centralFloor.geometry.attributes.uv;const hallPos=centralFloor.geometry.attributes.position;for(let i=0;i<hallUV.count;i++)hallUV.setXY(i,hallPos.getX(i)/3.2,(hallPos.getY(i)-vestibuleZ)/3.2);hallUV.needsUpdate=true;
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
 const salonVoid=[-6.70,6.70,X.parkBack+.40,-2.32],stairVoid=[-15.40,-6.77,-2.10,8.70];
 addSlab(OG-.095,[salonVoid,stairVoid]);
 // The central upper vestibule bay is genuinely open into the attic, between the four beams.
 const domeOpening=[-1.74,1.74,2.70,5.90];
 addSlab(CORNICE-.15,[domeOpening]);
 // V3.32: step 1 of the room-by-room refinement focuses on the floors.
 // Representative rooms now receive calmer, more château-like parquet tuning,
 // while passages, private rooms and service zones keep distinct materials.
 const parquetTex=(suffix,color=false)=>{
   if(typeof document==='undefined')return null;
   const t=tileLoader.load('./assets/interior/v342_parquet_'+suffix+'.jpg');
   t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=16;
   if(color)t.colorSpace=THREE.SRGBColorSpace;return t;
 };
 const oakTex=(file,color=false)=>{
   if(typeof document==='undefined')return null;
   const t=tileLoader.load('./assets/interior/'+file+'.jpg');
   t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=16;
   if(color)t.colorSpace=THREE.SRGBColorSpace;return t;
 };
 const parquetBase={map:parquetTex('albedo',true),normalMap:parquetTex('normal'),roughnessMap:parquetTex('roughness'),polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2};
 const plankBase={map:oakTex('v342_oak_albedo',true),normalMap:oakTex('v342_oak_normal'),roughnessMap:oakTex('v342_oak_roughness'),polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2};
 const salonParquet=new THREE.MeshPhysicalMaterial({name:'Roissy_Parquet_Salon_V332',color:0xfff5e7,roughness:.46,clearcoat:.14,clearcoatRoughness:.40,reflectivity:.20,normalScale:new THREE.Vector2(.20,.20),...parquetBase});
 const diningParquet=salonParquet.clone();diningParquet.name='Roissy_Parquet_SalleAManger_V332';diningParquet.color.setHex(0xf8eedf);diningParquet.roughness=.49;diningParquet.clearcoat=.12;
 const cabinetParquet=salonParquet.clone();cabinetParquet.name='Roissy_Parquet_Cabinets_V332';cabinetParquet.color.setHex(0xf4e6d4);cabinetParquet.roughness=.52;cabinetParquet.clearcoat=.10;cabinetParquet.clearcoatRoughness=.47;
 const chamberParquet=salonParquet.clone();chamberParquet.name='Roissy_Parquet_Chambres_V332';chamberParquet.color.setHex(0xefdfca);chamberParquet.roughness=.56;chamberParquet.clearcoat=.08;chamberParquet.clearcoatRoughness=.53;
 const passageParquet=salonParquet.clone();passageParquet.name='Roissy_Parquet_Antichambres_V332';passageParquet.color.setHex(0xfaefe1);passageParquet.roughness=.54;passageParquet.clearcoat=.09;
 const privateOak=new THREE.MeshPhysicalMaterial({name:'Roissy_Dielen_Privatraeume_V332',color:0xf3e6d2,roughness:.53,clearcoat:.08,clearcoatRoughness:.55,reflectivity:.14,normalScale:new THREE.Vector2(.17,.17),...plankBase});
 const secondaryStone=vestibulePBR.clone();secondaryStone.name='Roissy_Kalkstein_Nebenraeume_V332';secondaryStone.color.setHex(0xece3d5);secondaryStone.roughness=.70;secondaryStone.normalScale=new THREE.Vector2(.14,.14);
 const stairStone=vestibulePBR.clone();stairStone.name='Roissy_Kalkstein_GrandEscalier_V332';stairStone.color.setHex(0xf5ead6);stairStone.roughness=.43;stairStone.normalScale=new THREE.Vector2(.12,.12);stairStone.envMapIntensity=.78;
 // Reference: honed ivory marble, octagonal slabs with dark corner inserts.
 const polishedMaps=mapsFor('interior/v344_marble');
 Object.assign(stairStone,polishedMaps);stairStone.name='Roissy_Marmor_Oktagon_V344';stairStone.color.setHex(0xfffaf0);stairStone.roughness=.28;stairStone.normalScale.set(.15,.15);stairStone.envMapIntensity=1.05;
 const stairBorder=stairStone.clone();Object.assign(stairBorder,mapsFor('interior/v344_marble_border'));stairBorder.name='Roissy_Marmor_Dunkler_Randfries_V344';stairBorder.roughness=.32;
 const borderFormal=privateOak.clone();borderFormal.name='Roissy_Randfries_Formal_V332';borderFormal.color.setHex(0xbb9972);borderFormal.roughness=.58; borderFormal.clearcoat=.05;
 const borderPrivate=privateOak.clone();borderPrivate.name='Roissy_Randfries_Privat_V332';borderPrivate.color.setHex(0xb08b64);borderPrivate.roughness=.61; borderPrivate.clearcoat=.04;
 const borderPassage=privateOak.clone();borderPassage.name='Roissy_Randfries_Passage_V332';borderPassage.color.setHex(0xc3a37b);borderPassage.roughness=.60; borderPassage.clearcoat=.04;
 const floorMats={salonParquet,diningParquet,cabinetParquet,chamberParquet,passageParquet,privateOak,stone:secondaryStone,vestStone:vestibulePBR,stairStone,stairBorder,
   borderFormalX:borderFormal,borderFormalZ:borderFormal,borderPrivateX:borderPrivate,borderPrivateZ:borderPrivate,borderPassageX:borderPassage,borderPassageZ:borderPassage};
 const floorBuffers=new Map();
 function floorSpec(r,f){
   const n=r.name;
   if(/Vestibule/.test(n))return {kind:'vestStone',inset:.10,border:0,borderKind:null};
   if(stairAntechamber(r)||/Grand escalier/.test(n))return {kind:'stairStone',inset:.10,border:0,borderKind:null};
   if(n==='Salon')return {kind:'salonParquet',inset:.22,border:.24,borderKind:'borderFormal'};
   if(/Salle à manger/.test(n))return {kind:'diningParquet',inset:.21,border:.22,borderKind:'borderFormal'};
   if(/Grand Cabinet d’Assemblée|Cabinet de musique/.test(n))return {kind:'cabinetParquet',inset:.20,border:.20,borderKind:'borderFormal'};
   if(/Chambre de parade/.test(n))return {kind:'chamberParquet',inset:.20,border:.18,borderKind:'borderPrivate'};
   if(/Antichambre|Passage/.test(n))return {kind:'passageParquet',inset:.17,border:.16,borderKind:'borderPassage'};
   if(/Cabinet|Chambre/.test(n))return {kind:'privateOak',inset:.17,border:.15,borderKind:'borderPrivate'};
   return {kind:'stone',inset:.08,border:0,borderKind:null};
 }
 function surfaceRect(f,kind,rect,y,uvShift=[0,0]){
   const key=f+':'+kind;
   if(!floorBuffers.has(key))floorBuffers.set(key,{pos:[],uv:[]});
   const {pos,uv}=floorBuffers.get(key),[x0,x1,z0,z1]=rect;
   interiorAudit.floorRects.push({floor:f,kind:kind==='stairBorder'?'stairStone':kind,finish:kind,rect:rect.slice(),y});
   const scaleMap={stone:3.2,vestStone:3.2,stairStone:3.2,stairBorder:1.6,salonParquet:2.42,diningParquet:2.50,cabinetParquet:2.56,chamberParquet:2.64,passageParquet:2.82,privateOak:2.95};
   const scale=scaleMap[kind]||2.7;
   const [su,sv]=uvShift;
   for(const [x,z] of [[x0,z0],[x0,z1],[x1,z0],[x1,z0],[x0,z1],[x1,z1]]){
     pos.push(x,y,z);
     if(kind==='privateOak'||kind==='borderPrivateX')uv.push((x+su)/3.05,(-z+sv)/1.20);
     else if(kind==='borderPrivateZ')uv.push((z+su)/3.05,(x+sv)/1.20);
     else if(kind==='borderFormalX')uv.push((x+su)/2.72,(-z+sv)/1.14);
     else if(kind==='borderFormalZ')uv.push((z+su)/2.72,(x+sv)/1.14);
     else if(kind==='borderPassageX')uv.push((x+su)/2.92,(-z+sv)/1.18);
     else if(kind==='borderPassageZ')uv.push((z+su)/2.92,(x+sv)/1.18);
     else if(kind==='passageParquet')uv.push((x+su)/2.85,(-z+sv)/2.85);
     else uv.push((x+su)/scale,(-z+sv)/scale);
   }
 }
 // V3.28: ceiling design attached to existing soffits; no fake ceilings in voids.
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
   const [a,b,c,d]=rect,x=(a+b)/2,z=(c+d)/2,hw=(b-a)/2,hd=(d-c)/2;
   const rx=hw-.09,rz=hd-.09,rise=.84;
   const occupied=deck.reduce((n,r)=>n+ceilingArea(ceilingIntersection(rect,r)),0);
   if(occupied>1e-7)throw Error('Dome opening blocked by roof slab');
   // Smooth concave plaster cap. The cap and its planar spandrels close the
   // rectangular aperture completely without an opaque plane across the dome.
   const domeMaterial=cast.ceiling.clone();domeMaterial.name='Roissy_Kuppel_Kalkstuck';domeMaterial.side=THREE.DoubleSide;
   const geo=new THREE.SphereGeometry(1,64,24,0,Math.PI*2,0,Math.PI/2);
   const dome=mesh(geo,domeMaterial,'Roissy_Vestibule_Kuppel',layers[layer]);
   dome.scale.set(rx,rise,rz);dome.position.set(x,upper,z);dome.castShadow=false;
   // Include exact rectangle corners and the cap's 64 azimuth samples.
   // Match the cap's polygonal edge by interpolating the corresponding chord.
   const tau=2*Math.PI,step=tau/64;
   const angles=Array.from({length:64},(_,i)=>i*step);
   for(const sx of [-1,1])for(const sz of [-1,1])angles.push((Math.atan2(sz*hd/rz,sx*hw/rx)+tau)%tau);
   angles.sort((a,b)=>a-b);
   const unique=angles.filter((a,i)=>!i||a-angles[i-1]>1e-8);
   const outer=t=>{const u=rx*Math.cos(t),v=rz*Math.sin(t),m=Math.min(hw/Math.max(1e-12,Math.abs(u)),hd/Math.max(1e-12,Math.abs(v)));return [x+u*m,upper,z+v*m];};
   const inner=t=>{const j=Math.floor(t/step),a=j*step,b=(j+1)*step,m=Math.cos(step/2)/Math.cos(t-(a+b)/2);return [x+rx*Math.cos(t)*m,upper,z+rz*Math.sin(t)*m];};
   const pos=[],uv=[];const vertex=p=>{pos.push(...p);uv.push(p[0]/1.2,p[2]/1.2);};
   for(let i=0;i<unique.length;i++){const t=unique[i],u=unique[(i+1)%unique.length];const A=outer(t),B=outer(u),C=inner(t),D=inner(u);for(const p of [A,C,B,B,C,D])vertex(p);}
   const sp=new THREE.BufferGeometry();sp.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sp.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sp.computeVertexNormals();
   const surround=mesh(sp,domeMaterial,'Roissy_Kuppel_Zwickel',layers[layer]);surround.castShadow=false;
   for(const [fraction,tube,drop,mat] of [[1,.025,.020,'intStucRelief'],[1.027,.012,.009,'intStucRecess']]){
     const g=new THREE.TorusGeometry(1,tube,10,96);g.rotateX(Math.PI/2);g.scale(rx*fraction,1,rz*fraction);
     const o=mesh(g,mat,'Roissy_Vestibule_Kuppelring',layers[layer]);o.position.set(x,upper-drop,z);
   }
   interiorAudit.domeCount++;interiorAudit.domeGeometry={rect:rect.slice(),centre:[x,z],radii:[rx,rz],rise,upper,slabOverlap:occupied};
 }
 // V3.37: room-specific carved plaster relief on the existing supported ceiling fields.
 const formalCeilingSpecs={
   'Salon':{style:'Sonnenrosette und Lorbeer',petals:16,inner:12,scale:1.00,swag:1},
   'Chambre de parade':{style:'Akanthusrosette und Palmetten',petals:12,inner:8,scale:.87,swag:1},
   'Grand Cabinet d’Assemblée':{style:'Lorbeerkranz und Längsgirlanden',petals:10,inner:8,scale:.84,swag:1.20},
   'Salle à manger':{style:'Blütenrosette und Blattgirlanden',petals:12,inner:6,scale:.80,swag:1.08},
   'Cabinet de musique':{style:'Kleine Blütenrosette und geschwungene Ranken',petals:8,inner:8,scale:.70,swag:.85}
 };
 interiorAudit.formalCeilings=[];
 function formalCeilingRelief(name,rect,upper,layer,deck){
   const spec=formalCeilingSpecs[name];if(!spec)return;
   const [a,b,c,d]=rect,w=b-a,h=d-c,cx=(a+b)/2,cz=(c+d)/2;
   const rx=Math.min(w*.28,2.35),rz=Math.min(h*.28,2.65),r=Math.min(rx,rz)*.46*spec.scale;
   const parts={ivory:[],patina:[]};let leaves=0,stems=0,collars=0;
   function push(g,t='ivory'){
     const pos=g.attributes.position;
     for(let i=0;i<pos.count;i++){
       const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
       if(x<a+.30||x>b-.30||z<c+.30||z>d-.30||y<upper-.15||y>upper+.035||!deck.some(q=>x>=q[0]-1e-5&&x<=q[1]+1e-5&&z>=q[2]-1e-5&&z<=q[3]+1e-5))throw Error('Unsupported formal ceiling ornament '+name);
     }
     parts[t].push(g.index?g.toNonIndexed():g);if(g.index)g.dispose();
   }
   // Leaves have an actual rounded cross section, tapered ends and a curved spine.
   // Their back penetrates the plaster field by 5–12 mm, not a floating overlay.
   function leaf(x,z,angle,length,width,depth,bend=0,t='ivory'){
     const g=new THREE.SphereGeometry(1,12,8),p=g.attributes.position;
     for(let i=0;i<p.count;i++){
       const u=p.getX(i),v=p.getY(i),q=p.getZ(i);
       const localX=u*width*(.76+.24*(1-q*q))+bend*length*q*q;
       const localZ=q*length;
       p.setXYZ(i,localX,depth*v,localZ);
     }
     p.needsUpdate=true;g.computeVertexNormals();g.rotateY(angle);g.translate(x,upper-.018,z);push(g,t);leaves++;
   }
   function boss(x,z,radius,depth,t='ivory'){
     const g=new THREE.SphereGeometry(1,20,10);g.scale(radius,depth,radius);g.translate(x,upper-.030,z);push(g,t);
   }
   function line(points,tube=.017,t='ivory',closed=false){
     const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,upper-.018,z)),closed);
     push(new THREE.TubeGeometry(curve,Math.max(12,points.length*2),tube,8,closed),t);stems++;
   }
   function ring(x,z,rad,tube,t='ivory'){
     const g=new THREE.TorusGeometry(rad,tube,8,64);g.rotateX(Math.PI/2);g.translate(x,upper-.022,z);push(g,t);collars++;
   }
   boss(cx,cz,r*.17,.063);ring(cx,cz,r*.22,.020,'patina');
   for(let i=0;i<spec.inner;i++){
     const t=i*2*Math.PI/spec.inner+Math.PI/spec.inner;
     leaf(cx+Math.sin(t)*r*.34,cz+Math.cos(t)*r*.34,t,r*.19,r*.085,.043,.10);
   }
   for(let i=0;i<spec.petals;i++){
     const t=i*2*Math.PI/spec.petals;
     leaf(cx+Math.sin(t)*r*.68,cz+Math.cos(t)*r*.68,t,r*.26,r*.10,.048,i%2?.12:-.12);
     if(name==='Salon'||name==='Grand Cabinet d’Assemblée'){
       const u=t+Math.PI/spec.petals;leaf(cx+Math.sin(u)*r*.88,cz+Math.cos(u)*r*.88,u+.50,r*.12,r*.044,.030,.16,'patina');
     }
   }
   ring(cx,cz,r*1.03,.018);ring(cx,cz,r*1.13,.012,'patina');
   // Paired axial garlands: arc and leaflets, individually scaled to the oval.
   for(const sign of [-1,1]){
     const z=cz+sign*rz*.69,span=rx*.30*spec.swag,amp=Math.min(.16,rz*.075);
     const path=t=>[cx+t*span,z+sign*amp*(1-t*t)];
     line(Array.from({length:17},(_,i)=>path(-1+i/8)),.017);
     for(let i=0;i<7;i++){
       const t=-.90+i*.30,[x,v]=path(t),tilt=sign*(t*.5);
       leaf(x,v+sign*.085,tilt+.58,.105,.035,.031,.10);
       leaf(x,v-sign*.075,tilt-.58,.095,.034,.027,-.10);
     }
     boss(cx,z+sign*amp,.060,.038,'patina');
   }
   // Four corner fleurons are contained within the existing square reserves.
   for(const sx of [-1,1])for(const sz of [-1,1]){
     const x=cx+sx*(w/2-.95),z=cz+sz*(h/2-.95);
     boss(x,z,.045,.038);ring(x,z,.145,.012,'patina');
     for(let i=0;i<4;i++){
       const t=i*Math.PI/2+Math.PI/4;
       leaf(x+Math.sin(t)*.072,z+Math.cos(t)*.072,t,.095,.036,.035,.06);
     }
   }
   const names=[];let vertices=0;
   for(const [t,geos] of Object.entries(parts)){
     if(!geos.length)continue;const combined=mergeGeometries(geos,false);if(!combined)throw Error('Formal ceiling merge');
     const id='Roissy_Deckenrelief_V337_'+name+'_'+t;
     const o=mesh(combined,t==='ivory'?'intStucRelief':'intStucRecess',id,layers[layer]);o.castShadow=false;
     vertices+=combined.attributes.position.count;names.push(id);for(const g of geos)g.dispose();
   }
   interiorAudit.formalCeilings.push({name,style:spec.style,rect:rect.slice(),upper,layer,centre:[cx,cz],rosetteDiameter:r*2.26,leaves,stems,collars,vertices,meshes:names});
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
   if(style==='grand'||style==='salon')formalCeilingRelief(name,rect,upper,layer,deck);
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
     // Plain ceilings are fitted later to the constructed room atlas.

   }
 }
 // The upper roof slab spans the stairwell: ornament only at that level.
 designedCeiling('Grand escalier','stair',[-15.00,-7.20,-1.60,8.20],CORNICE-.283,'og',slabAudit[2].rectangles);
 // Shallow sculpted stucco rosette, centred on the existing stair ceiling oval.
 const stairCeilingY=CORNICE-.283,stairCeilingX=(-15.00-7.20)/2,stairCeilingZ=(-1.60+8.20)/2;
 const rosetteParts=[];
 function reliefPetal(a,rad,rx,rz,depth){
   const g=new THREE.SphereGeometry(1,16,8);g.scale(rx,depth,rz);g.rotateY(a);g.translate(stairCeilingX+Math.sin(a)*rad,stairCeilingY-.024,stairCeilingZ+Math.cos(a)*rad);rosetteParts.push(g.toNonIndexed());g.dispose();
 }
 for(let i=0;i<12;i++)reliefPetal(i*Math.PI/6,.42,.105,.225,.045);
 for(let i=0;i<8;i++)reliefPetal(i*Math.PI/4+Math.PI/8,.18,.070,.145,.052);
 for(let i=0;i<16;i++){reliefPetal(i*Math.PI/8,.79,.061,.105,.030);reliefPetal(i*Math.PI/8+Math.PI/16,.76,.043,.069,.026);}
 const outerCollar=new THREE.TorusGeometry(.93,.018,8,96);outerCollar.rotateX(Math.PI/2);outerCollar.translate(stairCeilingX,stairCeilingY-.019,stairCeilingZ);rosetteParts.push(outerCollar.toNonIndexed());outerCollar.dispose();
 const rosetteCentre=new THREE.SphereGeometry(1,24,12);rosetteCentre.scale(.15,.062,.15);rosetteCentre.translate(stairCeilingX,stairCeilingY-.022,stairCeilingZ);rosetteParts.push(rosetteCentre.toNonIndexed());rosetteCentre.dispose();
 const rosetteRing=new THREE.TorusGeometry(.68,.022,8,80);rosetteRing.rotateX(Math.PI/2);rosetteRing.translate(stairCeilingX,stairCeilingY-.029,stairCeilingZ);rosetteParts.push(rosetteRing.toNonIndexed());rosetteRing.dispose();
 mesh(mergeGeometries(rosetteParts,false),'intStucRelief','Roissy_Treppenhaus_Stuckrosette',layers.og);for(const g of rosetteParts)g.dispose();
 // Four restrained corner fleurons inside the existing moulded ceiling field.
 const stairCornerParts=[];
 const pushCorner=g=>{stairCornerParts.push(g.toNonIndexed());g.dispose();};
 for(const sx of [-1,1])for(const sz of [-1,1]){
   const x=stairCeilingX+sx*1.85,z=stairCeilingZ+sz*3.87;
   const ring=new THREE.TorusGeometry(.20,.018,8,40);ring.rotateX(Math.PI/2);ring.translate(x,stairCeilingY-.025,z);pushCorner(ring);
   for(let i=0;i<4;i++){
     const angle=i*Math.PI/2+Math.PI/4;
     const g=new THREE.SphereGeometry(1,12,8);g.scale(.047,.030,.12);g.rotateY(angle);g.translate(x+Math.sin(angle)*.075,stairCeilingY-.023,z+Math.cos(angle)*.075);pushCorner(g);
   }
   const boss=new THREE.SphereGeometry(1,12,8);boss.scale(.052,.037,.052);boss.translate(x,stairCeilingY-.025,z);pushCorner(boss);
   interiorAudit.stairCeilingCorners++;
 }
 mesh(mergeGeometries(stairCornerParts,false),'intStucRelief','Roissy_Treppenhaus_Eckfleurons',layers.og);for(const g of stairCornerParts)g.dispose();


 // V3.38: restrained carved rosettes in the flat vestibule coffers and
 // paired axial reserves of the stair ceiling. All backs intersect plaster.
 const hallCeilingParts={eg:[],og:[]};
 interiorAudit.hallCeilingOrnaments=[];
 function hallCeilingMedallion(f,rect,upper,kind){
   const [a,b,c,d]=rect,x=(a+b)/2,z=(c+d)/2,r=Math.min(.40,(b-a)*.19,(d-c)*.19);
   if(r<.13)return;
   const parts=hallCeilingParts[f];
   const push=g=>{parts.push(g.index?g.toNonIndexed():g);if(g.index)g.dispose();};
   const ring=new THREE.TorusGeometry(r*.96,.013,8,48);ring.rotateX(Math.PI/2);ring.translate(x,upper-.022,z);push(ring);
   const boss=new THREE.SphereGeometry(1,16,8);boss.scale(r*.22,.046,r*.22);boss.translate(x,upper-.023,z);push(boss);
   const n=kind==='stair'?12:8;
   for(let i=0;i<n;i++){
     const t=i*2*Math.PI/n,g=new THREE.SphereGeometry(1,12,8);
     g.scale(r*.14,.034,r*.31);g.rotateY(t);g.translate(x+Math.sin(t)*r*.50,upper-.020,z+Math.cos(t)*r*.50);push(g);
   }
   interiorAudit.hallCeilingOrnaments.push({floor:f,kind,rect:rect.slice(),centre:[x,z],upper,radius:r,petals:n});
 }
 for(const sign of [-1,1]){
   const z=stairCeilingZ+sign*3.48;
   hallCeilingMedallion('og',[stairCeilingX-.83,stairCeilingX+.83,z-.83,z+.83],stairCeilingY,'stair');
 }
 // A continuous carved laurel band hugs the curved dome, not a flat disk
 // suspended in the opening. Map every ornament vertex onto the cap surface.
 function domeLaurelBand(){
   const d=interiorAudit.domeGeometry,[cx,cz]=d.centre,[rx,rz]=d.radii;
   const yAt=(u,v)=>d.upper+d.rise*Math.sqrt(Math.max(0,1-u*u-v*v));
   const parts=[];const push=g=>{parts.push(g.index?g.toNonIndexed():g);if(g.index)g.dispose();};
   for(const radius of [.855,.967]){
     const pts=Array.from({length:96},(_,i)=>{const a=i*Math.PI/48,u=radius*Math.cos(a),v=radius*Math.sin(a);return new THREE.Vector3(cx+rx*u,yAt(u,v)-.007,cz+rz*v);});
     push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),192,.015,8,true));
   }
   for(let i=0;i<32;i++){
     const t=i*Math.PI/16;
     for(const side of [-1,1]){
       const g=new THREE.SphereGeometry(1,12,8),p=g.attributes.position;
       for(let j=0;j<p.count;j++){
         const a=t+p.getZ(j)*.055+side*.039,r=.911+side*.022+p.getX(j)*.018+side*p.getZ(j)*.012;
         const u=r*Math.cos(a),v=r*Math.sin(a);
         p.setXYZ(j,cx+rx*u,yAt(u,v)-.010+p.getY(j)*.035,cz+rz*v);
       }
       p.needsUpdate=true;g.computeVertexNormals();push(g);
     }
   }
   const g=mergeGeometries(parts,false);if(!g)throw Error('Dome laurel merge');
   const o=mesh(g,'intStucRelief','Roissy_Kuppel_Lorbeerfries_V338',layers.og);o.castShadow=false;
   interiorAudit.domeLaurel={leaves:64,rings:2,vertices:g.attributes.position.count};for(const p of parts)p.dispose();
 }

 // Vestibule ceilings: lower level keeps framed coffers around the central bay;
 // upper level receives a true shallow dome rather than a merely drawn circle.
 for(const f of ['eg','og']){
   const top=f==='eg'?OG-.228:CORNICE-.283,deck=slabAudit[f==='eg'?1:2].rectangles;
   const rangesX=[[hallLeft+.34,-2.24-.39],[-2.24+.39,2.24-.39],[2.24+.39,hallRight-.34]];
   const rangesZ=[[hallBack+.34,2.15-.41],[2.15+.41,6.45-.41],[6.45+.41,hallFront-.34]];
   const domeRect=domeOpening;
   for(const [a,b] of rangesX)for(const [c,d] of rangesZ){
     const w=b-a,h=d-c;if(w<.4||h<.4)continue;
     const rect=[a,b,c,d];
     const ix=ceilingIntersection(rect,domeRect);
     const overlap=ceilingArea(ix);
     if(f==='og'&&overlap>1e-7)continue; // central bay reserved for dome
     ceilingBox('intStucField',rect,top,.005,.023,f,deck);
     ceilingFrame(rect,top,f,deck,'intStucRelief',.115,.042,.082);
     if(w>.85&&h>.85)ceilingFrame(insetRect(rect,.17),top,f,deck,'intStucRecess',.035,.028,.048);
     if(w>1.2&&h>1.2)hallCeilingMedallion(f,rect,top,'vestibule');
     interiorAudit.ceilingFields++;
   }
   if(f==='og'){vestibuleDome(domeRect,top,f,deck);domeLaurelBand();}
 }
 for(const f of ['eg','og'])if(hallCeilingParts[f].length){
   const g=mergeGeometries(hallCeilingParts[f],false);if(!g)throw Error('Hall ceiling merge');
   const o=mesh(g,'intStucRelief','Roissy_Hallendecken_Rosetten_V338_'+f,layers[f]);o.castShadow=false;
   for(const p of hallCeilingParts[f])p.dispose();
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
   // OG west Antichambre spans this axis in the room register. The extra cross-wall split it into two narrow cells.
   innerWall(f,'x',CROSS_WALL_Z,f==='og'?FRONT_X_CUTS[1]:-outerJoin,rearStairWest,f==='og'?[-19.8]:[-24,-19.8],1.6);
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
     const doorPositions=(f==='og'&&bordersSalon)?[]:[f==='og'&&Math.abs(x-20.443)<.01?-5.65:-6.5];
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
      const groundStairDoorRemoved=f==='eg'&&Math.abs(x-STAIR_WEST)<.15;
      const groundJunctionDoor=f==='eg'&&Math.abs(x-20.46)<.15;
      const entry=f==='og'&&Math.abs(x-STAIR_WEST)<.15?9.68:
        f==='og'&&Math.abs(x+6.72)<.15?9.27:
        (westServiceDoor||eastUpperDoor)?7.30:
        groundJunctionDoor?5.75:f==='og'&&Math.abs(x-13.9825)<.01?6.30:5.30;
      // V3.30: the west first-floor connection into the outer suite must feel
      // like a real passage, not a thin accidental gap.
      const passageWidth=f==='og'&&Math.abs(x+21.93)<.15?1.80:1.35;
      innerWall(f,'z',x,CROSS_WALL_Z-.075,frontAt(x)-.12,groundStairDoorRemoved?[]:[entry],passageWidth);
   }
   for(const divider of SECONDARY_ROOM_WALLS[f]){
     // V3.30: the tiny western upper Antichambre/Cabinet sequence felt like an
     // accidental corridor. A broader opening keeps the plan legible while
     // turning it into a small enfilade instead of a dead, cramped slit.
     const widerWestUpperAntechamber=f==='og'&&divider.source==='Antichambre / Cabinet ouest';
     const axes=[-HALF_W-.075,...(divider.z<CROSS_WALL_Z?(f==='og'?REAR_X_CUTS_OG:REAR_X_CUTS):FRONT_X_CUTS).slice(1,-1),HALF_W+.075];
     const snap=v=>axes.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);
     innerWall(f,'x',divider.z,snap(divider.from),snap(divider.to),[divider.door],widerWestUpperAntechamber?1.80:divider.width);
   }
 }
 // V3.46: wall-axis finish atlas. All cells terminate at actual masonry centre
 // lines (including doorways); the old independently inset room rectangles no
 // longer leave exposed stone strips. No changes to walls or walk collision.
 function buildFinishAtlas(f){
   const walls=partitionRegister.filter(w=>w.floor===f),rooms=ROOMDATA[f];
   const xs=[-HALF_W,HALF_W,-X.wingX,X.wingX,-X.parkX,X.parkX];
   const zs=[X.parkBack,-HALF_D,HALF_D,X.wingFront];
   for(const w of walls){if(w.axis==='x'){zs.push(w.fixed);xs.push(w.from,w.to);}else{xs.push(w.fixed);zs.push(w.from,w.to);}}
   const unique=(a,lo,hi)=>[...new Set(a.filter(v=>v>=lo&&v<=hi).map(v=>+v.toFixed(5)))].sort((a,b)=>a-b);
   const xx=unique(xs,-HALF_W,HALF_W),zz=unique(zs,X.parkBack,X.wingFront),nx=xx.length-1,nz=zz.length-1;
   const cells=new Map(),area=r=>Math.max(0,r[1]-r[0])*Math.max(0,r[3]-r[2]);
   const intersection=(a,b)=>[Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.min(a[3],b[3])];
   const roomRects=rooms.map(r=>[r.x-r.w/2,r.x+r.w/2,r.z-r.d/2,r.z+r.d/2]);
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=(xx[i]+xx[i+1])/2,z=(zz[j]+zz[j+1])/2;
     if(z<rearAt(x)||z>frontAt(x))continue;
     const rect=[xx[i],xx[i+1],zz[j],zz[j+1]];cells.set(j*nx+i,{i,j,rect,x,z});}
   const blocked=(axis,fixed,along)=>walls.some(w=>w.axis===axis&&Math.abs(w.fixed-fixed)<.0001&&along>w.from-.001&&along<w.to+.001);
   const seen=new Set();
   for(const [id,c] of cells){if(seen.has(id))continue;const group=[c];seen.add(id);
     for(let k=0;k<group.length;k++){const a=group[k];for(const [di,dj] of [[-1,0],[1,0],[0,-1],[0,1]]){
       const i=a.i+di,j=a.j+dj;if(i<0||i>=nx||j<0||j>=nz)continue;const n=j*nx+i,b=cells.get(n);if(!b||seen.has(n))continue;
       if(di?blocked('z',di>0?xx[i]:xx[a.i],a.z):blocked('x',dj>0?zz[j]:zz[a.j],a.x))continue;seen.add(n);group.push(b);
     }}
     const totals=rooms.map((r,i)=>group.reduce((v,c)=>v+area(intersection(c.rect,roomRects[i])),0));
     const rank=totals.map((a,i)=>({a,i})).sort((a,b)=>b.a-a.a);
     // An intentionally open enfilade/stair may contain multiple named zones.
     const shared=rank[1].a>Math.max(1.8,rank[0].a*.12);
     for(const c of group){let i=rank[0].i;if(shared){let best=-Infinity;for(const entry of rank.filter(r=>r.a>Math.max(.5,rank[0].a*.06))){const r=rooms[entry.i],dist=Math.hypot(Math.max(0,Math.abs(c.x-r.x)-r.w/2),Math.max(0,Math.abs(c.z-r.z)-r.d/2));const score=area(intersection(c.rect,roomRects[entry.i]))/Math.max(1e-9,area(c.rect))*10-dist;if(score>best){best=score;i=entry.i;}}}c.room=rooms[i];}
   }
   // Merge neighbouring cells with the same assigned room, to avoid seams and
   // keep the number of floor triangles small. All coordinates remain exact.
   let rects=[...cells.values()].map(c=>({rect:c.rect,room:c.room}));
   let changed=true;while(changed){changed=false;outer:for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
     const a=rects[i],b=rects[j];if(a.room!==b.room)continue;const r=a.rect,q=b.rect;
     if(r[2]===q[2]&&r[3]===q[3]&&(r[1]===q[0]||q[1]===r[0])){a.rect=[Math.min(r[0],q[0]),Math.max(r[1],q[1]),r[2],r[3]];}
     else if(r[0]===q[0]&&r[1]===q[1]&&(r[3]===q[2]||q[3]===r[2])){a.rect=[r[0],r[1],Math.min(r[2],q[2]),Math.max(r[3],q[3])];}else continue;
     rects.splice(j,1);changed=true;break outer;
   }}
   finishRegions[f]=rects;
 }
 for(const f of ['eg','og'])buildFinishAtlas(f);
 for(const f of ['eg','og'])for(const {rect:cell,room:r} of finishRegions[f]){
   if(/Vide sur|escalier|Escalier|Vestibule/.test(r.name)||roomType(r)==='salon')continue;
   const rect=insetRect(cell,.32),upper=f==='eg'?OG-.228:CORNICE-.283,deck=slabAudit[f==='eg'?1:2].rectangles;
   if(rect[1]-rect[0]<1.1||rect[3]-rect[2]<1.1)continue;
   const type=roomType(r),fit=(mat,bounds,drop,h)=>{for(const d of deck){const p=ceilingIntersection(bounds,d);if(ceilingArea(p)>1e-7)ceilingBox(mat,p,upper,drop,h,f,deck);}};
   fit('intStucField',rect,.004,.023);
   const frame=(inset,width,drop,h,mat)=>{const [a,b,c,d]=insetRect(rect,inset);if(b-a<=2*width||d-c<=2*width)return;for(const p of [[a,a+width,c,d],[b-width,b,c,d],[a+width,b-width,c,c+width],[a+width,b-width,d-width,d]])fit(mat,p,drop,h);};
   frame(.035,.105,.033,.065,'intStucRelief');if(type!=='service')frame(.19,.025,.024,.038,'intStucRecess');
   interiorAudit.plainCeilingFields.push({name:r.name,layer:f,rect,upper,type});interiorAudit.ceilingFields++;
 }

 // Split wall finish only when the room changes, and stop at crossing wall
 // centrelines. This keeps the full dado and upper panels in the same colour.
 for(const [f,axis,fixed,p,q,low,high,side,edge,full,service] of pendingWallFinishes){
   const probe=fixed+side*(edge+.12),cuts=[p,q],forced=[];
   for(const w of partitionRegister){if(w.floor!==f||w.axis===axis||probe<w.from-.16||probe>w.to+.16||w.fixed<=p+.015||w.fixed>=q-.015)continue;cuts.push(w.fixed);forced.push(w.fixed);}
   for(const c of finishRegions[f]){const r=c.rect;const across=axis==='x'?[r[2],r[3]]:[r[0],r[1]],along=axis==='x'?[r[0],r[1]]:[r[2],r[3]];
     if(probe<across[0]||probe>across[1])continue;for(const v of along)if(v>p+.005&&v<q-.005)cuts.push(v);}
   const sorted=[...new Set(cuts)].sort((a,b)=>a-b);let start=sorted[0],prior=null;
   for(let i=0;i<sorted.length-1;i++){const m=(sorted[i]+sorted[i+1])/2,r=roomAt(f,axis==='x'?m:probe,axis==='x'?probe:m);if(prior&&(r!==prior||forced.some(v=>Math.abs(v-sorted[i])<1e-6))){buildWallFinish(f,axis,fixed,start,sorted[i],low,high,side,edge,full,service);start=sorted[i];}prior=r;}
   buildWallFinish(f,axis,fixed,start,q,low,high,side,edge,full,service);
 }
 for(const f of ['eg','og']){
   const y=f==='eg'?EG:OG,deck=slabAudit[f==='eg'?0:1].rectangles;
   const reserved=f==='eg'?[[hallLeft,hallRight,hallBack,hallFront]]:[];
   const covered=[];const areas=new Map();
   for(const {rect,room:r} of finishRegions[f]){
     const spec=floorSpec(r,f),kind=spec.kind;
     for(const d of deck){const b=ceilingIntersection(rect,d);if(ceilingArea(b)<1e-7)continue;let pieces=[b];for(const old of reserved)pieces=pieces.flatMap(p=>subtract(p,old));
       for(const piece of pieces){if(ceilingArea(piece)<1e-7)continue;if(f==='eg'&&kind==='stairStone'&&/Grand escalier/.test(r.name)){
         // Split the actual finish rectangle: no raised or coplanar overlay.
         const [a,b,c,d]=rect,i=.47,t=.16;
         const strips=[[a+i,a+i+t,c+i,d-i],[b-i-t,b-i,c+i,d-i],[a+i+t,b-i-t,c+i,c+i+t],[a+i+t,b-i-t,d-i-t,d-i]];
         let core=[piece];for(const strip of strips){const q=ceilingIntersection(piece,strip);if(ceilingArea(q)>1e-7){surfaceRect(f,'stairBorder',q,y+.009);core=core.flatMap(v=>subtract(v,q));}}
         for(const q of core)if(ceilingArea(q)>1e-7)surfaceRect(f,kind,q,y+.009);
       }else surfaceRect(f,kind,piece,y+.009,/Stone|^stone$/.test(kind)?[0,0]:[r.x*.47,r.z*.39]);covered.push(piece);areas.set(r,(areas.get(r)||0)+ceilingArea(piece));}
     }
   }
   // Only the small embedded slab margins outside the wall-axis atlas remain.
   for(const d of deck){let rem=[d];for(const old of [...reserved,...covered])rem=rem.flatMap(p=>subtract(p,old));for(const r of rem)if(ceilingArea(r)>1e-7)surfaceRect(f,'stone',r,y+.009);}
   for(const [r,area] of areas)interiorAudit.floorZones.push({floor:f,name:r.name,material:floorSpec(r,f).kind,area:+area.toFixed(2)});
 }
 for(const [key,b] of floorBuffers){const [f,kind]=key.split(':');const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));geo.computeVertexNormals();const o=new THREE.Mesh(geo,floorMats[kind]);o.name='Roissy_Interiorboden_'+key;o.receiveShadow=true;layers[f].add(o);directMeshes++;}
 interiorAudit.finishRegions=Object.fromEntries(Object.entries(finishRegions).map(([f,rs])=>[f,rs.map(c=>({rect:c.rect,room:c.room.name,centre:[c.room.x,c.room.z]}))]));
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
 const stairAudit={roundedStarterTreads:[],closedStoneCores:0,galleryFasciaRuns:0,steps:RUN*2,riser:rise,stairStart:EG,stairMid:MID,stairEnd:OG,
   soffits:0,handrails:0,balusters:0,endPiers:0,landings:2,railClearance:.0,forgedCurves:0,forgedMedallions:0,newelFinials:0,landingInlay:0,innerMedallions:0,landingScrolls:0,landingMedallions:0,upperScrolls:0,upperMedallions:0};
 function stoneSlopedSlab(name,from,to,width,thickness,material='stone'){
   const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),v=b.clone().sub(a);
   const g=new THREE.BoxGeometry(width,v.length(),thickness);const uv=g.attributes.uv,pos=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/1.5,pos.getY(i)/1.5);uv.needsUpdate=true;
   const o=mesh(g,material,name);
   o.position.copy(a.clone().add(b).multiplyScalar(.5));
   o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());
   return o;
 }
 // V3.46: solid, continuous stair core with a stepped top and planar soffit.
 // A true extruded profile prevents gaps between the stone treads and underside.
 function solidFlightCore(cfg,offset){
   const dz=cfg.length/RUN,base=EG+offset*rise;
   const shape=new THREE.Shape();
   shape.moveTo(0,Math.max(EG-.01,base+rise-.43));
   shape.lineTo(0,base+rise-.075);
   for(let i=0;i<RUN;i++){
     shape.lineTo((i+1)*dz,base+(i+1)*rise-.075);
     if(i<RUN-1)shape.lineTo((i+1)*dz,base+(i+2)*rise-.075);
   }
   shape.lineTo(cfg.length,base+RUN*rise-.43);
   shape.closePath();
   const g=new THREE.ExtrudeGeometry(shape,{depth:cfg.width-.045,bevelEnabled:false,steps:1});
   // Local x runs along the flight; extrusion spans the width.
   g.rotateY(-cfg.direction*Math.PI/2);
   g.translate(cfg.x+cfg.direction*(cfg.width-.045)/2,0,cfg.startZ);
   const uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal;
   for(let i=0;i<uv.count;i++)uv.setXY(i,(Math.abs(n.getX(i))>.5?p.getZ(i):p.getX(i))/1.5,(Math.abs(n.getY(i))>.5?-p.getZ(i):p.getY(i))/1.5);
   uv.needsUpdate=true;
   mesh(g,'intStairStone','Roissy_Treppenuntersicht_Aus_Kalkstein');stairAudit.closedStoneCores++;
 }
 function roundedStarter(cfg,i,y){
   const dz=cfg.length/RUN,extra=S.starterWidening[i],w=cfg.width+extra*2,r=.12;
   const a=-w/2,b=w/2,h=dz+.006;
   // Shape in (x, distance up the flight). Only the two leading corners are curved.
   const shape=new THREE.Shape();shape.moveTo(a+r,0);shape.lineTo(b-r,0);shape.quadraticCurveTo(b,0,b,r);shape.lineTo(b,h);shape.lineTo(a,h);shape.lineTo(a,r);shape.quadraticCurveTo(a,0,a+r,0);shape.closePath();
   const depth=rise+.006;
   const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12,steps:1});
   g.rotateX(-Math.PI/2);g.translate(cfg.x,y-depth,cfg.startZ-i*dz);
   const uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal;for(let j=0;j<uv.count;j++)uv.setXY(j,(Math.abs(n.getX(j))>.5?p.getZ(j):p.getX(j))/1.5,(Math.abs(n.getY(j))>.5?-p.getZ(j):p.getY(j))/1.5);uv.needsUpdate=true;
   const o=mesh(g,'intStairStone','Roissy_Antrittstufe_Rund_'+(i+1));
   // A fine continuous rounded nosing follows the visible front edge exactly.
     const path=[new THREE.Vector3(cfg.x+a,y-.019,cfg.startZ-i*dz-r)];
   for(let j=0;j<=12;j++){const t=Math.PI-j*Math.PI/24;path.push(new THREE.Vector3(cfg.x+a+r+r*Math.cos(t),y-.019,cfg.startZ-i*dz-r+r*Math.sin(t)));}
   path.push(new THREE.Vector3(cfg.x+b-r,y-.019,cfg.startZ-i*dz));
   for(let j=1;j<=12;j++){const t=Math.PI/2-j*Math.PI/24;path.push(new THREE.Vector3(cfg.x+b-r+r*Math.cos(t),y-.019,cfg.startZ-i*dz-r+r*Math.sin(t)));}
   // Use a piecewise curve (straight centre, quarter circles on both ends).
   const curve=new THREE.CurvePath();for(let j=1;j<path.length;j++)curve.add(new THREE.LineCurve3(path[j-1],path[j]));
   mesh(new THREE.TubeGeometry(curve,40,.009,8,false),'intStairMolding','Roissy_Antrittstufe_Rundprofil_'+(i+1));
   stairAudit.roundedStarterTreads.push({i,width:w,top:y,depth:dz,radius:r});
 }
 function flight(cfg,offset){
   const dz=cfg.length/RUN, samples=[];
   for(let i=0;i<RUN;i++){
     const y=EG+(offset+i+1)*rise;
     const z=cfg.startZ+cfg.direction*(i+.5)*dz;
     samples.push({x:cfg.x,y,z});
     if(offset===0&&i<S.starterWidening.length){roundedStarter(cfg,i,y);continue;}
     // Closed stone tread on a solid structural core; no separate floating riser.
     addBox('intStairStone',cfg.x,y-.091,z,cfg.width,.182,dz+.006);
     const leading=z-cfg.direction*(dz*.486);
     addBox('intStairMolding',cfg.x,y-.021,leading,cfg.width+.018,.036,.038);
   }
   solidFlightCore(cfg,offset);
   const first=samples[0],last=samples.at(-1);
   // Underneath, two narrow raised frames on the actual solid soffit.
   // First flight detail starts after the first three enlarged treads.
   const from=offset===0?samples[3]:first;
   const base=EG+offset*rise,bottom0=Math.max(EG-.01,base+rise-.43),bottom1=base+RUN*rise-.43;
   const soffitY=pt=>bottom0+(bottom1-bottom0)*(pt.z-cfg.startZ)*cfg.direction/cfg.length;
   for(const side of [-1,1])for(const [inset,thick,dep] of [[.23,.052,.018],[.34,.023,.011]]){
     const x=cfg.x+side*(cfg.width/2-inset);
     stoneSlopedSlab('Roissy_Treppenuntersicht_Stuckrahmen',[x,soffitY(from)-.008,from.z],[x,soffitY(last)-.008,last.z],thick,dep,'intStucRelief');
   }
   stairAudit.soffits++;
   for(const sign of [-1,1]){
     const edge=cfg.x+sign*(cfg.width/2-.025);
     stoneSlopedSlab('Roissy_Geschlossenes_Seitliches_Treppenprofil', [edge,from.y-.25,from.z],[edge,last.y-.25,last.z],.095,.20,'intStairMolding');
     stoneSlopedSlab('Roissy_Treppenwange_Profilstab',[edge,from.y-.15,from.z],[edge,last.y-.15,last.z],.115,.044,'intStairMolding');
     stoneSlopedSlab('Roissy_Treppenwange_Unteres_Gesims',[edge,soffitY(from)+.035,from.z],[edge,soffitY(last)+.035,last.z],.106,.035,'intStairMolding');
     stairAudit.soffits++;
   }
   return samples;
 }
 const firstRun=flight(S.first,0);
 addBox('intStairStone',S.landing.x,MID-.09,S.landing.z,S.landing.width,.18,S.landing.depth);
 addBox('intStucField',S.landing.x,MID-.197,S.landing.z,S.landing.width-.02,.034,S.landing.depth-.02);
 for(const sign of [-1,1]){addBox('intStucRelief',S.landing.x+sign*(S.landing.width/2-.11),MID-.223,S.landing.z,.06,.042,S.landing.depth-.15);addBox('intStucRelief',S.landing.x,MID-.223,S.landing.z+sign*(S.landing.depth/2-.10),S.landing.width-.28,.042,.06);}
 // Close the first riser to floor level; no hollow-looking floating edge.
 // The rounded first tread itself extends down to EG; no duplicate front riser.
 // The transfer landing serves both flights, keeping the central turning zone clear.
 const secondRun=flight(S.second,RUN);
 // The new full-width front landing is carried by the main deck; fill
 // only the part of the small upper landing inside the stair aperture.
 const landingStart=S.upperLanding.z-S.upperLanding.depth/2;
 const landingEnd=stairVoid[3];
 addBox('intStairStone',S.upperLanding.x,OG-.095,(landingStart+landingEnd)/2,S.upperLanding.width,.19,landingEnd-landingStart);
 // Subtle horizontal edge fascia at each landing, never through an opening.
 addBox('intStairMolding',S.landing.x,MID-.15,S.landing.z-S.landing.depth/2+.04,S.landing.width-.06,.12,.08);
 addBox('intStairMolding',S.upperLanding.x,OG-.15,S.upperLanding.z-S.upperLanding.depth/2+.04,S.upperLanding.width-.07,.12,.08);

 // The railing follows a mathematically straight line through the exact top
 // surfaces of ALL individual treads, rather than separate disconnected pieces.
 // Curved forged bars retain the former rail endpoints, but add finely shaped
 // symmetrical S-curves and small open ornaments in each bay. Batch them to
 // limit the cost on mobile. Plane is always the existing railing plane.
 const stairDecor=new Map();
 function decorGeo(g,mat,layer='shell'){
   const key=layer+':'+mat;if(!stairDecor.has(key))stairDecor.set(key,[]);
   if(g.index){stairDecor.get(key).push(g.toNonIndexed());g.dispose();}else stairDecor.get(key).push(g);
 }
 function forgedLine(points,r=.013,mat='stairForged',layer='shell'){
   const vs=points.map(p=>new THREE.Vector3(...p));
   const curve=new THREE.CatmullRomCurve3(vs);
   decorGeo(new THREE.TubeGeometry(curve,Math.max(12,points.length-1),r,6,false),mat,layer);
 }
 function sBar(x,z,base,top,sign,amplitude=.045){
   const pts=Array.from({length:19},(_,j)=>{const t=j/18;return[x,base+(top-base)*t,z+sign*amplitude*Math.sin(2*Math.PI*t)*Math.sin(Math.PI*t)];});
   forgedLine(pts,.016);stairAudit.forgedCurves++;
 }
 function railOval(x,z,y,rz=.104,ry=.285){
   const curve=new THREE.CatmullRomCurve3(Array.from({length:32},(_,i)=>{const a=i*Math.PI/16;return new THREE.Vector3(x,y+ry*Math.cos(a),z+rz*Math.sin(a));}),true);
   decorGeo(new THREE.TubeGeometry(curve,40,.012,8,true),'stairForged');for(const sign of [-1,1])addBox('stairPatina',x,y+sign*ry,z,.038,.045,.038);stairAudit.forgedMedallions++;
 }
 function newelFinial(x,y,z,layer='shell'){
   const profile=[[0,0],[.09,0],[.09,.018],[.071,.028],[.061,.047],[.078,.068],[.073,.093],[.045,.112],[.018,.13],[0,.135]].map(([r,h])=>new THREE.Vector2(r,h));
   const g=new THREE.LatheGeometry(profile,20);g.translate(x,y,z);decorGeo(g,'stairPatina',layer);stairAudit.newelFinials++;
 }
 // A thin, stone-inlaid double line on the turning platform, outside the
 // tread joins. Maximum height 3mm, no raised threshold.
 for(const inset of [.20,.27]){
   const x=S.landing.x,z=S.landing.z,w=S.landing.width-2*inset,d=S.landing.depth-2*inset,t=.018;
   for(const q of [-1,1]){addBox('intStairInlay',x+q*(w/2-t/2),MID+.0015,z,t,.003,d);addBox('intStairInlay',x,MID+.0015,z+q*(d/2-t/2),w-2*t,.003,t);stairAudit.landingInlay+=2;}
 }
 function flightBalustrade(samples,cfg,edgeSign){
   const x=cfg.x+edgeSign*(cfg.width/2-.12);
   const h=S.railHeight,begin=samples[0],end=samples.at(-1);
   const topA=[x,begin.y+h,begin.z],topB=[x,end.y+h,end.z];
   const lowA=[x,begin.y+.34,begin.z],lowB=[x,end.y+.34,end.z];
   beam('stairWalnut',topA,topB,.078);stairAudit.handrails++;
   beam('stairForged',[x,begin.y+h-.105,begin.z],[x,end.y+h-.105,end.z],.036);
   beam('stairForged',lowA,lowB,.031);
   for(let i=0;i<samples.length;i++){
     const p=samples[i];
     // The balusters are attached to the same tread heights used for walking.
     const post= i===0||i===samples.length-1 || i%3===0;
     if(post){
       addBox('stairForged',x,p.y+.52,p.z,.069,.94,.067);
       addBox('stone',x,p.y+.047,p.z,.19,.094,.19);
       addBox('stairPatina',x,p.y+.84,p.z,.086,.046,.088);
     }else{
       addBox('stairForged',x,p.y+.51,p.z,.041,.91,.044);
       addBox('stairPatina',x,p.y+.55,p.z,.069,.045,.075);
     }
     stairAudit.balusters++;
   }
   // Secondary slim bars close the large gaps between primary posts.
   for(let i=1;i<samples.length;i++){
     const a=samples[i-1],b=samples[i];
     for(const t of [1/3,2/3]){
       const z=a.z+(b.z-a.z)*t,top=a.y+(b.y-a.y)*t+h-.09;
       const base=t<.5?a.y:b.y;
       sBar(x,z,base,top,t<.5?-1:1);stairAudit.balusters++;
     }
     railOval(x,(a.z+b.z)/2,(a.y+b.y)/2+.58);
   }
   // A square dressed-stone newel closes each end of the flight. It is
   // on the outer tread edge and does not reduce the walking lane centrally.
   for(const p of [begin,end]){
     addBox('stairForged',x,p.y+.51,p.z,.205,1.02,.205);for(const yy of [.22,.48,.76])addBox('stairPatina',x,p.y+yy,p.z,.210,.025,.210);
     addBox('intStairMolding',x,p.y+1.055,p.z,.275,.105,.275);
     addBox('intStairMolding',x,p.y+.10,p.z,.245,.095,.245);
     addBox('stairPatina',x,p.y+.88,p.z,.211,.024,.211);
     newelFinial(x,p.y+1.1075,p.z);
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
   beam('stairWalnut',[x,a.y+S.railHeight,a.z],[x,b.y+S.railHeight,b.z],.059);stairAudit.handrails++;
   beam('stairForged',[x,a.y+.21,a.z],[x,b.y+.21,b.z],.026);
   for(let i=0;i<samples.length-1;i++)for(const t of [0,1/3,2/3]){
     const q=samples[i],n=samples[i+1],z=q.z+(n.z-q.z)*t;
     const base=t<.5?q.y:n.y,top=q.y+(n.y-q.y)*t+S.railHeight-.045;
     if(t===0)addBox('stairForged',x,(base+top)/2,z,.034,top-base,.034);else sBar(x,z,base,top,t<.5?-1:1);stairAudit.balusters++;
   }
   addBox('stairForged',x,b.y+.49,b.z,.05,.98,.05);stairAudit.balusters++;
   // Match the outer flight motif on the inward face without widening the railing.
   for(let i=0;i<samples.length-1;i++){
     const p=samples[i],q=samples[i+1],y=(p.y+q.y)/2+.58,z=(p.z+q.z)/2;
     const curve=new THREE.CatmullRomCurve3(Array.from({length:32},(_,j)=>{const t=j*Math.PI/16;return new THREE.Vector3(x,y+.275*Math.cos(t),z+.101*Math.sin(t));}),true);
     decorGeo(new THREE.TubeGeometry(curve,40,.012,8,true),'stairForged');for(const side of [-1,1])addBox('stairPatina',x,y+side*.275,z,.038,.042,.038);stairAudit.innerMedallions++;
   }
 }
 // A common scroll vocabulary for the horizontal guards. All curves remain
 // within the original guard plane, the lower and upper rails join the bars.
 function horizontalScroll(x,z,base,top,sign,amplitude,layer='shell'){
   const pts=Array.from({length:19},(_,i)=>{const t=i/18;return[x+sign*amplitude*Math.sin(2*Math.PI*t)*Math.sin(Math.PI*t),base+(top-base)*t,z];});
   forgedLine(pts,.013,'stairScroll',layer);
 }
 function horizontalOval(x,z,y,rx,ry,layer='shell'){
   const c=new THREE.CatmullRomCurve3(Array.from({length:32},(_,i)=>{const t=i*Math.PI/16;return new THREE.Vector3(x+rx*Math.sin(t),y+ry*Math.cos(t),z);}),true);
   decorGeo(new THREE.TubeGeometry(c,32,.011,6,true),'stairScroll',layer);
 }
 for(let i=0;i<10;i++){
   const left=S.landing.x-S.landing.width/2+.22,span=(S.landing.width-.44)/10,z=S.landing.z-S.landing.depth/2+.12;
   for(const t of [1/3,2/3]){horizontalScroll(left+span*(i+t),z,MID+.05,MID+1.025,t<.5?-1:1,.045);stairAudit.landingScrolls++;stairAudit.balusters++;}
   horizontalOval(left+span*(i+.5),z,MID+.65,.086,.19);stairAudit.landingMedallions++;
 }


 // The turn landing has its own continuous handrail, double iron rails and
 // masonry-capped newel posts, positioned ONLY along the outer back edge.
 const backZ=S.landing.z-S.landing.depth/2+.12;
 const lx0=S.landing.x-S.landing.width/2+.22;
 const lx1=S.landing.x+S.landing.width/2-.22;
 for(let i=0;i<=10;i++){
   const x=lx0+(lx1-lx0)*i/10;
   addBox('stairForged',x,MID+.54,backZ,.053,.98,.056);
   if(i%2===0)addBox('stairPatina',x,MID+.69,backZ,.073,.045,.076);
   stairAudit.balusters++;
 }
 beam('stairWalnut',[lx0,MID+1.07,backZ],[lx1,MID+1.07,backZ],.075);
 beam('stairForged',[lx0,MID+.34,backZ],[lx1,MID+.34,backZ],.031);
 beam('stairForged',[lx0,MID+.96,backZ],[lx1,MID+.96,backZ],.023);
 stairAudit.handrails++;
 for(const x of [lx0,lx1]){
   addBox('intStairMolding',x,MID+.50,backZ,.21,1.00,.21);
   addBox('intStairMolding',x,MID+1.05,backZ,.29,.11,.29);
   addBox('stairPatina',x,MID+.87,backZ,.218,.025,.218);newelFinial(x,MID+1.105,backZ);
   stairAudit.endPiers++;
 }

 // Front landing is now continuous to the west suite; guard its edge
 // above the lower flight, not the route across the solid landing.
 const guardEdge=(x0,x1,z)=>{
   const n=Math.ceil((x1-x0)/.14);
   for(let i=0;i<=n;i++){
     const x=x0+(x1-x0)*i/n;
     if(i===0||i===n||i%3===0)addBox('stairForged',x,OG+.51,z,.041,.98,.045,'og');
     else {horizontalScroll(x,z,OG+.02,OG+1.015,i%3===1?-1:1,.023,'og');stairAudit.upperScrolls++;}
     stairAudit.balusters++;
   }
   for(let i=1;i<n;i+=3){horizontalOval(x0+(x1-x0)*i/n,z,OG+.59,.092,.285,'og');for(const sy of [-1,1])addBox('stairPatina',x0+(x1-x0)*i/n,OG+.59+sy*.285,z,.042,.043,.043,'og');stairAudit.upperMedallions++;}
   addBox('stairForged',(x0+x1)/2,OG+.95,z,x1-x0,.04,.052,'og');
   addBox('stairForged',(x0+x1)/2,OG+.20,z,x1-x0,.05,.075,'og');
   addBox('stairWalnut',(x0+x1)/2,OG+1.04,z,x1-x0,.10,.13,'og');
   for(const x of [x0,x1]){
     addBox('intStairMolding',x,OG+.50,z,.18,1,.18,'og');
     addBox('intStairMolding',x,OG+1.03,z,.24,.10,.24,'og');
     addBox('stairPatina',x,OG+.86,z,.187,.023,.187,'og');newelFinial(x,OG+1.08,z,'og');stairAudit.endPiers++;
   }
   // Three profiled bands on the visible vertical slab edge. Their depth is
   // confined to the existing deck side; no trim bridges the open walk lane.
   const face=z>0?stairVoid[3]:stairVoid[2],side=z>0?1:-1;
   for(const [dy,h,depth] of [[-.038,.052,.08],[-.112,.076,.064],[-.185,.038,.096]]){
     addBox('intStairMolding',(x0+x1)/2,OG+dy,face+side*(depth/2-.012),x1-x0,h,depth);
     stairAudit.galleryFasciaRuns++;
   }
   // Dentil strip attached to the gallery's existing lower edge, never in a doorway.
   const dentils=Math.floor((x1-x0)/.12);
   for(let i=0;i<dentils;i++)addBox('intStairMolding',x0+(i+.5)*(x1-x0)/dentils,OG-.145,face-side*.025,.054,.035,.040);
   // Centred low-relief shell and two symmetrical foliage scrolls.
   const cx=(x0+x1)/2,cy=OG-.102,cz=face-side*.055;
   for(let i=-3;i<=3;i++){const g=new THREE.SphereGeometry(1,12,8);g.scale(.016,.052,.013);g.rotateZ(-i*.16);g.translate(cx+i*.027,cy-.008+Math.abs(i)*.003,cz);decorGeo(g,'intStairMolding');}
   for(const sign of [-1,1])for(let i=0;i<4;i++){const g=new THREE.SphereGeometry(1,10,6);g.scale(.043,.016,.012);g.rotateZ(sign*(.5-i*.15));g.translate(cx+sign*(.14+i*.055),cy-.012+i*.006,cz);decorGeo(g,'intStairMolding');}
   collisionWalls.og.push({x0,x1,z0:z-.09,z1:z+.09});
 };
 guardEdge(stairVoid[0]+.10,S.upperLanding.x-S.upperLanding.width/2,stairVoid[3]+.10);
 // At the garden end, a real guard protects the opening above the mid-landing.
 guardEdge(stairVoid[0]+.10,stairVoid[1]-.10,stairVoid[2]-.12);
 // New longitudinal west gallery edge, above the enlarged double-height volume.
 const wx=stairVoid[0]-.10,wz0=stairVoid[2]-.12,wz1=stairVoid[3]+.10;
 const wn=Math.ceil((wz1-wz0)/.15);
 for(let i=0;i<=wn;i++){
   const z=wz0+i*(wz1-wz0)/wn;
   addBox('stairForged',wx,OG+.52,z,.043,1,.043,'og');stairAudit.balusters++;
   if(i%3===1){const g=new THREE.TorusGeometry(1,.12,6,24);g.scale(.09,.285,.11);g.rotateY(Math.PI/2);g.translate(wx,OG+.58,z);decorGeo(g,'stairForged','og');for(const dy of [-.285,.285])addBox('stairPatina',wx,OG+.58+dy,z,.042,.043,.043,'og');}
 }
 for(const [mat,h,yy,w] of [['stairWalnut',.10,1.04,.13],['stairForged',.05,.20,.065],['stairForged',.04,.95,.052]])addBox(mat,wx,OG+yy,(wz0+wz1)/2,w,h,wz1-wz0,'og');
 for(const [dy,h,depth] of [[-.038,.052,.08],[-.112,.076,.064],[-.185,.038,.096]])addBox('intStairMolding',stairVoid[0]-depth/2+.012,OG+dy,(wz0+wz1)/2,depth,h,wz1-wz0,'og');
 collisionWalls.og.push({x0:wx-.09,x1:wx+.09,z0:wz0,z1:wz1});
 stairAudit.handrails+=3;
 for(const [key,geos] of stairDecor){const [layer,mat]=key.split(':');const combined=mergeGeometries(geos,false);if(!combined)throw Error('Treppenornament merge');combined.computeBoundingSphere();mesh(combined,mat,'Roissy_Treppenhaus_Ornament_'+key,layer==='shell'?root:layers[layer]);for(const g of geos)g.dispose();}

 if(stairAudit.steps!==36||Math.abs(EG+36*rise-OG)>1e-7||stairAudit.railClearance<2.05)
   throw Error('Grand Escalier: Höhen oder freie Gehbreite widersprüchlich');
 // V3.30: continuous stone landing and solid, flush tread blocks.
 // The first tread top and terrace are both EG, without overlapping bands.
 const terraceEnd=PERRON.terraceEndZ, terraceStart=HALF_D-.08;
 const perronAudit=[];
 addBox('intStairStone',0,EG/2,(terraceStart+terraceEnd)/2,2*X.terraceHalf,EG,terraceEnd-terraceStart);
 for(let i=0;i<PERRON.steps;i++){
   const zz=PERRON.firstCentreZ+i*PERRON.treadDepth,h=(PERRON.steps-i)*EG/PERRON.steps;
   addBox('intStairStone',0,h/2,zz,PERRON.width,h,PERRON.treadDepth);
   perronAudit.push({centre:zz,top:h,depth:PERRON.treadDepth,width:PERRON.width});
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
   detailedWindow('x',z+sign*.54,x,y-.81,1.04,1.62,sign,false,'dormer');
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
     detailedWindow('x',z+sign*.02,x,base+.28,1.55,h-.56,sign,false,'attic');
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
 // V3.28 intentionally adds no new interior light fixtures. Material realism is
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
 // V3.28: install doors in the audited masonry openings; no new openings.
 for(const d of interiorDoorways){
   const half=d.width/2;
   const point=(u,v)=>d.axis==='x'?[d.at+u,d.fixed+v]:[d.fixed-v,d.at+u];
   const put=(u,Y,w,h,dep,v=0)=>{const [x,z]=point(u,v);if(d.axis==='x')addBox('doorFrame',x,Y,z,w,h,dep,d.floor);else addBox('doorFrame',x,Y,z,dep,h,w,d.floor);};
   for(const side of [-1,1])put(side*(half-.019),d.baseY+1.40,.038,2.80,.312);
   put(0,d.baseY+2.775,d.width-.076,.05,.312);
   const score=direction=>{let hits=0;for(const sign of [-1,1])for(let i=1;i<=12;i++)for(let j=1;j<=5;j++){
     const a=i*Math.PI/24,t=j/5*(half-.052),u=sign*(half-.048-t*Math.cos(a)),v=direction*t*Math.sin(a);
     if(Math.abs(v)<.23)continue;
     const [x,z]=point(u,v);for(const r of collisionWalls[d.floor])if(x>r.x0-.065&&x<r.x1+.065&&z>r.z0-.065&&z<r.z1+.065)hits++;
   }return hits;};
   // Prefer the side with the greatest geometric clearance. At the stair
   // landing, swing away from the actual stair bay (towards adjoining room).
   const scores=[score(-1),score(1)];let swing=scores[0]<scores[1]?-1:1;
   if(d.axis==='z'&&d.floor==='og'&&Math.abs(d.fixed+6.75)<.01)swing=-1;
   if(d.axis==='z'&&d.floor==='og'&&Math.abs(d.fixed-STAIR_WEST)<.01)swing=1;
   if(d.axis==='z'&&d.floor==='eg'&&Math.abs(d.fixed+6.75)<.01&&d.at>0)swing=-1;
   // V3.39: wider stop hides the offset hinge clearance; the jamb spans the full reveal.
   // Its inside surface is 4 mm away from the moving slab at the closed position.
   for(const side of [-1,1])put(side*(half-.071),d.baseY+1.40,.070,2.80,.022,-swing*.045);
   put(0,d.baseY+2.758,d.width-.076,.056,.022,-swing*.045);
   // Low oak threshold covers the flexible lower seal in projection; 18 mm maximum height.
   put(0,d.baseY+.009,d.width-.076,.018,.12);
   const door=interiorDoorKit.create(layers[d.floor],d,d.width>=1.5,swing);
   interiorDoors.push({...d,door,sweepScores:scores});directMeshes+=5;
 }
 // Ceiling junctions follow actual wall faces, including masonry above doors
 // and windows, clipped to the real soffit (never across an open stair/Salon).
 // Disjoint strips avoid doubled corner faces, with no change to masonry.
 const corniceOccupied=new Map();
 for(const w of interiorAudit.roomFinishAssignments){
   const f=w.floor,upper=f==='eg'?OG-.228:CORNICE-.283,deck=slabAudit[f==='eg'?1:2].rectangles;
   if(w.high<upper-.005||w.low>upper-.16||w.to-w.from<.04)continue;
   const face=w.fixed+w.side*w.edge;
   for(const [id,mat,depth,drop,h] of [[0,'intStucRelief',.145,.017,.040],[1,'intStucField',.098,.058,.042],[2,'intStucRecess',.058,.089,.020],[3,'intStucRelief',.072,.112,.025]]){
     const near=face-w.side*.009,far=face+w.side*depth,lo=Math.min(near,far),hi=Math.max(near,far);
     const target=w.axis==='x'?[w.from,w.to,lo,hi]:[lo,hi,w.from,w.to];
     const key=f+':'+id,used=corniceOccupied.get(key)||[];corniceOccupied.set(key,used);
     for(const d of deck){const hit=ceilingIntersection(target,d);if(ceilingArea(hit)<1e-7)continue;
       let parts=[hit];for(const previous of used)parts=parts.flatMap(p=>subtract(p,previous));
       for(const p of parts){if(ceilingArea(p)<1e-7)continue;ceilingBox(mat,p,upper,drop,h,f,deck);used.push(p);interiorAudit.ceilingCorniceRuns.push({floor:f,profile:id,rect:p.slice(),upper,drop,h});if(w.room==='Grand escalier'&&id===0)interiorAudit.stairCorniceRuns.push({floor:f,axis:w.axis,fixed:w.fixed,side:w.side,from:w.from,to:w.to,high:upper});}
     }
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
     const half=d.width/2-.04,vertical=[d.baseY+(m.startsWith('intBase')?-.005:.02),d.baseY+2.78];
     const cut=d.axis==='x'?[[d.at-half,d.at+half],vertical,[d.fixed-.27,d.fixed+.27]]:[[d.fixed-.27,d.fixed+.27],vertical,[d.at-half,d.at+half]];
     result=result.flatMap(r=>{const out=cutSolid(r,cut);if(out.length!==1||out[0]!==r)clippedFinishStrips++;return out;});
   }
   batch.set(key,result);
 }
 interiorAudit.clippedFinishStrips=clippedFinishStrips;
 // Merge carved wall reliefs by floor, and keep the existing flat panel material.
 for(const f of ['eg','og'])if(stairWallReliefs[f].length){
   const g=mergeGeometries(stairWallReliefs[f],false);if(!g)throw Error('Stair wall relief merge');
   g.computeBoundingSphere();mesh(g,'intStucRelief','Roissy_Treppenhaus_Wandkartuschen_'+f,layers[f]);
   for(const part of stairWallReliefs[f])part.dispose();
 }
 for(const f of ['eg','og'])if(formalParts[f].length){
   const g=mergeGeometries(formalParts[f],false);if(!g)throw Error('Formal relief merge');
   g.computeBoundingSphere();mesh(g,'intStucRelief','Roissy_Salon_Wandreliefs_'+f,layers[f]);
   for(const part of formalParts[f])part.dispose();
 }
 if(windowHardwareParts.length){const g=mergeGeometries(windowHardwareParts,false);if(!g)throw Error('Window hardware merge');g.computeBoundingSphere();mesh(g,'intBrass','Roissy_Fensterbeschlaege_V340');for(const part of windowHardwareParts)part.dispose();}
 // The front gallery soffit, directly above the first-flight approach.
 // Only the solid deck beyond z=8.70 is decorated, not the open stairwell.
 const gallerySoffit=[-16.9,-10.1,-7.25,-2.65],galleryUpper=OG-.228;
 ceilingBox('intStucField',gallerySoffit,galleryUpper,.011,.025,'eg',slabAudit[1].rectangles);
 ceilingFrame(insetRect(gallerySoffit,.11),galleryUpper,'eg',slabAudit[1].rectangles,'intStucRelief',.073,.036,.068);
 ceilingFrame(insetRect(gallerySoffit,.26),galleryUpper,'eg',slabAudit[1].rectangles,'intStucRecess',.023,.028,.048);
 const gx=-13.25,gz=-4.95;
 for(const [rr,tube] of [[.78,.020],[.68,.015],[.53,.010],[.13,.015]]){const g=new THREE.TorusGeometry(rr,tube,8,64);g.rotateX(Math.PI/2);g.translate(gx,galleryUpper-.037,gz);mesh(g,'intStucRelief','Roissy_Galerie_Leuchterrosette',layers.eg);}
 for(let i=0;i<24;i++){const a=i*Math.PI/12,g=new THREE.SphereGeometry(1,14,8);g.scale(.045,.025,.15);g.rotateY(a);g.translate(gx+Math.sin(a)*.45,galleryUpper-.039,gz+Math.cos(a)*.45);mesh(g,'intStucRelief','Roissy_Galerie_Rosettenblatt',layers.eg);}
 const referenceFixtures=installReferenceFixtures(THREE,root,layers,S,EG,OG,CORNICE,interiorAudit.roomFinishAssignments);
 interiorAudit.fixtureCount=referenceFixtures.count;interiorAudit.referenceFixtures=referenceFixtures;
 interiorAudit.furnishings=installFurnishings(THREE,layers,EG,OG,collisionWalls);
 // Instanced stone geometry: one draw call per material and floor layer.
 const surfaceCleanup=resolveStaticFaces(THREE,batch,cast);
 const dummy=new THREE.Object3D();let renderBatches=0;
 for(const [key,group] of surfaceCleanup.groups){
   const [layer,mat]=key.split(':');const parent=layer==='shell'?root:layers[layer];
   const setup=o=>{o.receiveShadow=true;o.castShadow=!['glass','sash','bronzeTrim','ceiling'].includes(mat);parent.add(o);renderBatches++;};
   const metric=mat.startsWith('int')&&mat!=='intBrass'||mat==='ceiling'||['windowReveal','windowSill'].includes(mat);
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
   for(const x of (f==='og'?[HALF_W-.12]:[-HALF_W+.12,HALF_W-.12]))joins.push({floor:f,type:'side-transverse',x,z:CROSS_WALL_Z});
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
   buildings:['Château de Roissy – Hauptgebäude'],historicalFloors:ROOMDATA,historicalLayers:layers,finishRegions,roomAt,
   interiorCollision:collisionWalls,upperDeckRectangles:slabAudit[1].rectangles,roofDeckRectangles:slabAudit[2].rectangles,hallSupports,interiorDoorways,planPartitions:partitionRegister,entranceDoors:doors,interiorDoors,
   instancedElements:[...batch.values()].reduce((s,a)=>s+a.length,0),instancedDrawcalls:renderBatches,staticConstructionBoxes:batch,
   planAxes:{frontDoors:FRONT_DOORS,frontWindows:FRONT_WINDOW_AXES,rearWindows:REAR_WINDOW_AXES},
   validations:{roomCountEG:ROOMDATA.eg.length,roomCountOG:ROOMDATA.og.length,directMeshes,interiorDoorCount:interiorDoors.length,windowAudit,interiorFinish:interiorAudit,surfaceCleanup:surfaceCleanup.stats,
     roofDormersPerSide:roofDormerAxes.length,roofPlaneCutouts:roofDormerAxes.length+rearDormers.length,
     floatingRoofDecor:0,orphanSideStairs:0,roofHipAndRidgeCaps:9,salonUpperDoorsIntoVoid:0,ceilingUndersides:true,
     roissyRoomOverlapCount:0,facadeOpeningsChecked:true,perronTreads:perronAudit,perronNavigationUsesStoneStepHeights:true,stairRailAnchoredToTreads:true,stairGeometrySharesNavigationConfig:true,
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
