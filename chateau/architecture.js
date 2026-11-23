/**
 * CHÂTEAU GRAND 2027 — PALAST 2.4 / DURCHGAENGIGER RUNDGANG
 * Monumental, courtyard-based French palace. Entire exterior is assembled with
 * instanced ashlar modules, real (non-decals) window holes, MaxGame PBR stone,
 * authentic donor portico geometry, and roof pavilions with copper domes.
 * Source units: metres. No generated 2D picture is substituted for geometry.
 */
import {addPorticoColumn} from '../wohnzimmer/portico-columns-v2.js';
import {addPortalDoors} from '../wohnzimmer/portal-doors-v2.js';

export function buildChateau(THREE, scene, donor, mats, glass){
  const palace=new THREE.Group();palace.name='CHATEAU_GRAND_2027_PALAST';scene.add(palace);
  const basis=new THREE.BoxGeometry(1,1,1);
  const geometryClasses=new Map();
  const batches=new Map();
  const bronze=new THREE.MeshStandardMaterial({color:0x303840,metalness:.59,roughness:.37,side:THREE.DoubleSide,name:'Dunkler_Kupfer_Dachdecker'});
  const bronzeEdge=new THREE.MeshStandardMaterial({color:0x596066,metalness:.65,roughness:.32,name:'Kuppel_Rippen'});
  const darkSlate=mats.roof;
  const foliage=new THREE.MeshStandardMaterial({color:0x254629,roughness:.95,name:'Zypressen_Grün'});
  const hedge=new THREE.MeshStandardMaterial({color:0x365c2e,roughness:.96,name:'Park_Hecke'});
  const water=new THREE.MeshStandardMaterial({color:0x658f9f,roughness:.15,metalness:.22,transparent:true,opacity:.87,name:'Brunnen_Wasser'});
  const litInterior=new THREE.MeshStandardMaterial({color:0x533826,emissive:0xd58945,emissiveIntensity:.38,roughness:.82,name:'Warmes_Abendlicht_hinter_Fenstern'});
  const gilt=new THREE.MeshStandardMaterial({color:0xd4ad59,metalness:.72,roughness:.26,name:'Patiniertes_Gold'});
  const stoneLight=mats.trim,stoneMid=mats.facadeWall,stoneWindow=mats.windowStone,stoneColumn=mats.dressedStone;
  const glassDark=new THREE.MeshStandardMaterial({color:0x111b23,roughness:.57,metalness:.05,name:'Glas_Hintergrund'});
  const wood=new THREE.MeshStandardMaterial({color:0x382016,roughness:.62,metalness:.02,name:'Eingangstüren_Nussbaumholz'});
  const woodTrim=new THREE.MeshStandardMaterial({color:0x71462d,roughness:.58,metalness:.02,name:'Profilierte_Türfüllungen'});
  const doorShadow=new THREE.MeshStandardMaterial({color:0x140f0c,roughness:.92,name:'Türfugen_und_Kassettenschatten'});
  const glow=new THREE.MeshStandardMaterial({color:0xf6c47e,emissive:0xff9a49,emissiveIntensity:.78,roughness:.58});
  const materialMap={wall:stoneMid,trim:stoneLight,win:stoneWindow,base:mats.shade,stone:stoneColumn,
    glass,behind:glassDark,interior:litInterior,sash:mats.paintedSash,roof:darkSlate,bronze,edge:bronzeEdge,gold:gilt,
    tree:foliage,hedge,water,light:glow,paving:mats.porticoPaving,wood,woodtrim:woodTrim,doorShadow};
  const geometryMap={box:basis,orb:new THREE.SphereGeometry(1,10,7),cone:new THREE.ConeGeometry(1,1,10),
    cyl:new THREE.CylinderGeometry(1,1,1,14),thinCyl:new THREE.CylinderGeometry(1,1,1,8)};
  function push(kind,mat,x,y,z,sx,sy,sz){
    if(!Number.isFinite(x+y+z+sx+sy+sz)||sx<=0||sy<=0||sz<=0)throw Error(`Ungültige Architekturmaße: ${kind}`);
    const key=kind+':'+mat;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push([x,y,z,sx,sy,sz]);
  }
  const cube=(mat,x,y,z,w,h,d)=>push('box',mat,x,y,z,w,h,d);
  // Separate architectural layer for each historical plan, so visibility is testable.
  const floorLayers={eg:new THREE.Group(),og:new THREE.Group()};
  floorLayers.eg.name='ROISSY_REZ_DE_CHAUSSEE';
  floorLayers.og.name='ROISSY_PREMIER_ETAGE';
  palace.add(floorLayers.eg,floorLayers.og);
  const planBatches=new Map(), rooms={eg:[],og:[]},collisionWalls={eg:[],og:[]};
  // Actual MaxGame automatic hinge-controlled doors. Door geometry lives outside
  // the GPU-instanced facade so it can rotate while the player walks through it.
  const entranceDoors=[];
  function planCube(f,mat,x,y,z,w,h,d){
    if (![x,y,z,w,h,d].every(Number.isFinite)||w<=0||h<=0||d<=0) throw Error('Ungültige Innenwand-Geometrie');
    const key=f+':'+mat;
    if(!planBatches.has(key))planBatches.set(key,[]);
    planBatches.get(key).push([x,y,z,w,h,d]);
  }
  const sphere=(mat,x,y,z,r)=>push('orb',mat,x,y,z,r,r,r);
  const cylinder=(mat,x,y,z,r,h)=>push('cyl',mat,x,y,z,r,h,r);
  const cone=(mat,x,y,z,r,h)=>push('cone',mat,x,y,z,r,h,r);
  function flush(){
    const dummy=new THREE.Object3D();
    for(const [key,records] of batches){
      const [kind,mat]=key.split(':');
      const mesh=new THREE.InstancedMesh(geometryMap[kind],materialMap[mat],records.length);
      mesh.name='Chateau_Module_'+key;mesh.receiveShadow=true;
      // Large foundation panels receive shadows; small stone detailing does not need
      // another expensive mobile shadow-map pass.
      mesh.castShadow=['box:wall','box:base','box:stone','box:trim','cyl:stone'].includes(key);
      mesh.frustumCulled=false;
      records.forEach(([x,y,z,sx,sy,sz],i)=>{
        dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);
        dummy.rotation.set(0,0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate=true;palace.add(mesh);
    }
    // Batch the room plan separately from the exterior for cutaway views.
    for(const [key,records] of planBatches){
      const [floor,mat]=key.split(':');
      const mesh=new THREE.InstancedMesh(basis,materialMap[mat],records.length);
      mesh.name='Historischer_Grundriss_'+key;
      mesh.castShadow=mat!=='glass';mesh.receiveShadow=true;mesh.frustumCulled=false;
      records.forEach(([x,y,z,w,h,d],i)=>{
        dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);
        dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate=true;floorLayers[floor].add(mesh);
    }
  }
  const ROOF_EAVE=23.5,ROOF_SHOULDER=30.8,ROOF_RIDGE=35.8;
  // Courtyard: main 224 × 41 m, wing ranges each 35 × 151 m,
  // west/east side wings end at -158; rear range 205 × 32 m.
  const main={x:0,z:0,w:224,d:42};
  const wings=[{x:-88,z:-89,w:35,d:138},{x:88,z:-89,w:35,d:138}];
  const rear={x:0,z:-177,w:211,d:39};
  const footprints=[main,...wings,rear];
  const levels=[{bottom:0,top:4.6,holeY:.87,holeH:2.55},
    {bottom:4.6,top:10.9,holeY:.90,holeH:4.76},
    {bottom:10.9,top:17.3,holeY:1.06,holeH:4.52},
    {bottom:17.3,top:23.5,holeY:1.13,holeH:4.20}];
  // Only THREE doors sit in intercolumnia: two outside and one precisely central.
  // The 12 original MaxGame columns are arranged on {-20.35,-12.21,-4.07,4.07,12.21,20.35} m.
  // Therefore the opening centers MUST be {-16.28,0,16.28}; no column stands in a doorway.
  const ENTRANCE_AXES=[-16.28,0,16.28];
  const DOOR_WIDTH=3.05;
  // Wall strips around openings. No wall boxes behind window glass.
  function masonryLine(axis,fixed,from,to,face,bayXs,{trimDetail=true,entrance=false,corps=false,passageXs=[]}={}){
    const fixedWall=fixed;
    const exterior=face; // +1 is outward toward positive X/Z.
    function stoneAlong(coord,bottom,w,h,depth=.72,mat='wall',offset=0){
      if(axis==='X')cube(mat,coord,bottom+h/2,fixedWall+offset*exterior,w,h,depth);
      else cube(mat,fixedWall+offset*exterior,bottom+h/2,coord,depth,h,w);
    }
    function window(coord,y,level,grandDoor,passage=false){
      const height=(grandDoor||passage)?5.35:levels[level].holeH;
      const width=passage?4.35:(grandDoor?DOOR_WIDTH:(level===0?2.6:3.25));
      const base=y+((grandDoor||passage)?.08:levels[level].holeY);
      const longSide=(axis==='X');
      const placeAt=(mat,along,long,vert,depth,offset,yy)=>{
        if(longSide)cube(mat,coord+along,yy,fixedWall+exterior*offset,long,vert,depth);
        else cube(mat,fixedWall+exterior*offset,yy,coord+along,depth,vert,long);
      };
      const place=(mat,long,vert,depth,offset,yy)=>placeAt(mat,0,long,vert,depth,offset,yy);
      // Two-sided true transparency: NO opaque 'behind' or emissive facade card.
      // The masonryLine loop already cuts real openings through each wall segment.
      // A lightly tinted thin PBR pane and timber muntins form the window.
      if(!grandDoor&&!passage)place('glass',width-.32,height-.20,.042,.13,base+height/2);
      if(grandDoor){
        // The historical fixed door panels used to block all three entrances.
        // Reuse the working MaxGame oak door system instead: genuine hinged
        // walnut leaves, mouldings and brass handles open when approached.
        if(!longSide)throw Error('Palast-Eingang muss auf der Vorderfassade liegen.');
        const door=addPortalDoors(THREE,palace,mats,glass,coord,fixedWall,exterior,
          width,height,wood,base,{inset:-.18,activationDistance:7.8});
        entranceDoors.push({x:coord,z:fixedWall,base,door});
        place('stone',width+.20,.24,.58,.41,base+height+.05);
        place('trim',width+.48,.20,.80,.49,base+height+.27);
      }else if(passage){
        // Generous walk-through connecting the main historical plan with both
        // wings and the transverse rear range. Absolutely no dark panel/glass.
        place('stone',width+.26,.22,.68,.42,base+height+.06);
      }else{
        place('sash',.085,height-.21,.17,.30,base+height/2);
        for(const s of [-.30,.30]){
          if(axis==='X')cube('sash',coord+s*width*.5,base+height/2,fixedWall+exterior*.31,.055,height-.21,.12);
          else cube('sash',fixedWall+exterior*.31,base+height/2,coord+s*width*.5,.12,height-.21,.055);
        }
        for(const t of [.31,.65])place('sash',width-.20,.075,.15,.32,base+height*t);
      }
      const m=width/2;
      for(const sign of [-1,1]){
        const along=coord+sign*(m+.07);
        if(axis==='X')cube('win',along,base+height/2,fixedWall+exterior*.31,.27,height+.32,.66);
        else cube('win',fixedWall+exterior*.31,base+height/2,along,.66,height+.32,.27);
      }
      place('trim',width+.66,.28,.82,.37,base+height+.15);
      place('win',width+.9,.125,.90,.43,base+height+.35);
      place('win',width+.53,.24,.82,.43,base-.14);
      place('trim',width+.85,.095,.82,.48,base-.28);
      // Stylistic distinction by floor: rustication, aristocratic piano nobile, crown.
      if(level===2 && !grandDoor){
        place('trim',width+.90,.15,.90,.43,base+height+.55);
        for(const s of [-1,1]){
          if(axis==='X')cube('stone',coord+s*(m+.12),base+height+.16,fixedWall+exterior*.53,.29,.43,.42);
          else cube('stone',fixedWall+exterior*.53,base+height+.16,coord+s*(m+.12),.42,.43,.29);
        }
      }
      if(level===3 && !grandDoor)place('trim',width+.63,.13,.80,.45,base+height+.52);
    }
    const bays=bayXs.filter(x=>x>from+3&&x<to-3).sort((a,b)=>a-b);
    levels.forEach((level,i)=>{
      const l=level.bottom,r=level.top;
      let last=from;
      for(const pos of bays){
        const door=entrance&&i===1&&ENTRANCE_AXES.some(x=>Math.abs(pos-x)<.01);
        const passage=i===1&&passageXs.some(x=>Math.abs(pos-x)<.01);
        const underPortico=entrance&&i===0&&ENTRANCE_AXES.some(x=>Math.abs(pos-x)<.01);
        const ww=passage?4.35:(door?DOOR_WIDTH:(i===0?2.6:3.25));
        if(underPortico)continue; // no subterranean glazing behind the entrance podium
        const left=pos-ww/2,right=pos+ww/2;
        if(left>last)stoneAlong((last+left)/2,l,left-last,r-l);
        const bottom=(door||passage)?l+.08:l+level.holeY;
        const high=(door||passage)?5.35:level.holeH;
        if(bottom>l+.01)stoneAlong(pos,l,ww,bottom-l);
        if(bottom+high<r-.01)stoneAlong(pos,bottom+high,ww,r-(bottom+high));
        window(pos,l,i,door,passage);
        last=right;
      }
      if(last<to)stoneAlong((to+last)/2,l,to-last,r-l);
    });
    // Four-storey classical courses & cornices. All continuous around the quadrangle.
    for(const y of [4.53,10.84,17.24,23.55]){
      stoneAlong((from+to)/2,y-.09,to-from+.60,.26,1.04,'trim',.44);
      stoneAlong((from+to)/2,y+.16,to-from+.64,.11,.85,'win',.50);
      stoneAlong((from+to)/2,y-.24,to-from+.50,.08,.78,'base',.33);
    }
    if(trimDetail){
      // Tall pilasters placed in piers, not on the glass.
      for(let j=1;j<bays.length;j+=3){
        const p=(bays[j-1]+bays[j])/2;
        if(Math.abs(p)<24&&corps)continue;
        stoneAlong(p,4.66,.66,18.4,1.06,'win',.36);
        for(const y of [4.72,10.9,17.3,23.14])stoneAlong(p,y-.13,.98,.26,1.20,'trim',.49);
      }
    }
    stoneAlong((from+to)/2,.33,to-from+.7,.63,1.11,'base',.40);
    return bays.length;
  }
  const grid=(start,end,step)=>{const a=[];for(let p=start;p<=end+.01;p+=step)a.push(+p.toFixed(3));return a;};
  // No filler windows behind the actual column bases: the entry three-bay grouping
  // is reserved for walnut doors and their aligned upper-floor windows.
  const frontAxes=[...grid(-103.5,103.5,6.9).filter(x=>Math.abs(x)>25),...ENTRANCE_AXES].sort((a,b)=>a-b);
  const mainRearAxes=grid(-103.5,103.5,6.9);
  masonryLine('X',21,-112,112,1,frontAxes,{entrance:true,corps:true});
  masonryLine('X',-21,-112,112,-1,mainRearAxes,{corps:true,passageXs:[-89.7,89.7]});
  // Both outermost short sides of the grand main façade.
  const crossAxes=grid(-16.5,16.5,6.6);
  masonryLine('Z',112,-21,21,1,crossAxes);
  masonryLine('Z',-112,-21,21,-1,crossAxes);
  for(const w of wings){
    const half=w.w/2,z0=w.z-w.d/2,z1=w.z+w.d/2;
    const zs=grid(-151,-27,6.9);
    // All 4 faces are genuinely modelled: outer + courtyard side.
    masonryLine('Z',w.x-half,z0,z1,-1,zs);
    masonryLine('Z',w.x+half,z0,z1,1,zs);
    const xs=grid(w.x-12,w.x+12,6);
    masonryLine('X',z0,w.x-half,w.x+half,-1,xs);
  }
  const rearZ0=rear.z-rear.d/2,rearZ1=rear.z+rear.d/2;
  const rearAxes=grid(-98,98,7);
  masonryLine('X',rearZ1,-rear.w/2,rear.w/2,1,rearAxes,{passageXs:[-91,91]});
  masonryLine('X',rearZ0,-rear.w/2,rear.w/2,-1,rearAxes);
  const rearSideAxes=grid(-191,-163,6.6);
  masonryLine('Z',rear.w/2,rearZ0,rearZ1,1,rearSideAxes);
  masonryLine('Z',-rear.w/2,rearZ0,rearZ1,-1,rearSideAxes);
  // Monumental stairs, shared plinth, complete ground-floor decks and slabs.
  for(const f of footprints){
    cube('base',f.x,-.36,f.z,f.w+.6,.72,f.d+.6);
    for(const yy of [4.61,10.96,17.35,23.22]){
      // Le Rouge's Premier Etage explicitly marks the central upper space
      // as 'Salon du Rez-de-Chaussee': preserve the double-height salon void.
      if(f===main&&yy===10.96){
        // Western range: real cut-out for the Grand Escalier (not a blocked stair).
        // Full-width west stair bay: slab is absent between flights; the
        // full-width landing survives at the front and at the rear.
        cube('base',-83.25,yy-.06,0,56.6,.16,41.2);
        cube('base',-41.5,yy-.06,-12.3,26.5,.16,16.0);
        cube('base',-41.5,yy-.06,18.15,26.5,.16,4.8);
        // The 1.OG stair landing needs a continuous east-side gallery to
        // the real doorway at x=-28, z=8.6. Without this it ended in midair.
        cube('base',-30.40,yy-.06,10.15,3.82,.16,18.9);
        cube('base',70.25,yy-.06,0,83.0,.16,41.2);
        // GALLERY around the central salon: real double-height open volume.
        cube('base',0,yy-.06,8.10,55.5,.16,24.9);
        cube('base',0,yy-.06,-20.02,55.5,.16,1.15);
      }else cube('base',f.x,yy-.06,f.z,f.w-.8,.16,f.d-.8);
    }
  }
  // V2.1: no more full-height stair boxes or black slab-like staircase cheeks.
  // Twenty-six individual slim tread stones (0.15 m) over a recessed RAKED
  // structural stringer: shallow in elevation and credible from both sides.
  const STEP_COUNT=26, RISER=4.50/STEP_COUNT, TREAD=.80, STAIR_START=38.07;
  for(let i=0;i<STEP_COUNT;i++){
    const width=51.6+.225*i;
    const top=(STEP_COUNT-i)*RISER;
    const z=STAIR_START+i*TREAD;
    cube('paving',0,top-.076,z,width,.152,.84);
    cube('trim',0,top+.008,z+.37,width+.045,.028,.11);
    cube('stone',0,top-RISER*.5,z+.41,width-.08,RISER,.115);
  }
  // Invisible from frontal view but visible obliquely: a tapered stone substructure,
  // recessed from both edges. Its outer walls slope to the lawn, not straight down.
  const stairWedge=new THREE.BufferGeometry();
  const q=[
    [-23.45,0,37.57],[23.45,0,37.57],
    [-23.45,4.14,37.57],[23.45,4.14,37.57],
    [-25.65,0,58.50],[25.65,0,58.50],
    [-25.65,.045,58.50],[25.65,.045,58.50]
  ];
  const v=[]; const face=(a,b,c,d)=>{for(const j of [a,b,c,a,c,d])v.push(...q[j]);};
  face(3,2,6,7);face(2,0,4,6);face(1,3,7,5);face(0,1,3,2);face(4,6,7,5);
  stairWedge.setAttribute('position',new THREE.Float32BufferAttribute(v,3));stairWedge.computeVertexNormals();
  const under=new THREE.Mesh(stairWedge,stoneMid);
  under.name='Monumentaltreppe_schraege_unterstuetzung_ohne_Vollblock';
  under.castShadow=under.receiveShadow=true;palace.add(under);
  // A single uninterrupted narrow raked profile on each side of the stair.
  for(const sign of [-1,1]){
    const edge=new THREE.LineCurve3(new THREE.Vector3(sign*26.04,4.56,37.69),new THREE.Vector3(sign*28.83,.11,58.95));
    const stringer=new THREE.Mesh(new THREE.TubeGeometry(edge,30,.11,6,false),stoneLight);
    stringer.name=sign<0?'Geschwungene_linke_Treppenwange':'Geschwungene_rechte_Treppenwange';
    stringer.castShadow=true;palace.add(stringer);
  }
  // Roissy floor plans: revised against the user-supplied high-resolution engraving.
  // Input: chateau/docs/CHATEAU-DE-ROISSY-REFERENZ-HOCHAUFLOESEND.jpg
  // Historical drawing's seven primary rear room-bays and the asymmetrical
  // front-side service suites now guide the partitions, independently on both levels.
  // The 224 × 42 m fantasy shell and central portico differ from the historic palace.
  // Geometry here is an adaptation, not a traced 1:1 archival reconstruction.
  function buildRoissyFloor(f){
    const isEG=f==='eg', base=isEG?4.72:11.05,top=isEG?10.78:17.15;
    const H=top-base, t=.48;
    const roomDefs=isEG ? [
      // REZ-DE-CHAUSSEE — garden side, left-to-right as on the engraving.
      ['Cabinet',-111.0,-89.4,-20.3,-4.2],
      ['Chambre à coucher',-89.0,-54.8,-20.3,-4.2],
      ['Antichambre',-54.4,-28.2,-20.3,-4.2],
      ['Salon',-27.8,27.8,-20.3,-4.2],
      ['Antichambre',28.2,51.8,-20.3,-4.2],
      ['Chambre de parade',52.2,84.6,-20.3,-4.2],
      // Grand Cabinet d'Assemblée occupies both rear and part of the front bay.
      ['Grand Cabinet d’Assemblée',85.0,111.0,-20.3,8.2],
      // REZ-DE-CHAUSSEE — arrival/working side, more finely resolved from plate.
      ['Garde-robe',-111.0,-91.6,-3.7,2.7],
      ['Logement du concierge',-111.0,-91.6,3.1,9.5],
      ['Conciergerie',-111.0,-91.6,9.9,20.1],
      ['Lingerie',-91.1,-55.0,-3.7,8.1],
      ['Passage',-91.1,-55.0,8.5,20.1],
      ['Grand escalier',-54.6,-28.2,-3.7,20.1],
      ['Vestibule',-27.8,27.8,-3.7,20.1],
      ['Salle à manger',28.2,57.8,-3.7,20.1],
      ['Escalier secondaire',58.2,84.6,-3.7,2.3],
      ['Antichambre',58.2,84.6,2.7,20.1],
      ['Cabinet de musique',85.0,111.0,8.6,20.1],
    ] : [
      // PREMIER ETAGE — the Salon du Rez-de-Chaussee is represented as a VOID.
      ['Chambre à coucher (aile ouest)',-111.0,-89.4,-20.3,-7.2],
      ['Chambre à coucher',-89.0,-54.8,-20.3,-4.2],
      ['Antichambre',-54.4,-28.2,-20.3,-4.2],
      ['Vide sur le Salon du Rez-de-Chaussée',-27.8,27.8,-20.3,-4.2],
      ['Antichambre commune',28.2,57.8,-20.3,-4.2],
      ['Chambre à coucher',58.2,84.6,-20.3,-4.2],
      ['Cabinet (aile est)',85.0,111.0,-20.3,-12.8],
      ['Garde-robe (aile est)',85.0,111.0,-12.4,-4.2],
      // PREMIER ETAGE — below the rear row on the plan.
      ['Antichambre (aile ouest)',-111.0,-91.6,-6.8,-1.4],
      ['Cabinet (aile ouest)',-111.0,-91.6,-1.0,5.0],
      ['Chambre à coucher (aile ouest)',-111.0,-91.6,5.4,20.1],
      ['Chambre à coucher (escalier ouest)',-91.1,-55.0,-3.7,20.1],
      ['Grand escalier',-54.6,-28.2,-3.7,20.1],
      ['Vestibule / galerie',-27.8,27.8,-3.7,20.1],
      ['Garde-robe',28.2,57.8,-3.7,4.0],
      ['Chambre à coucher',28.2,57.8,4.4,20.1],
      ['Passage',58.2,84.6,-3.7,3.4],
      ['Garde-robe',58.2,84.6,3.8,9.1],
      ['Cabinet',58.2,84.6,9.5,20.1],
      ['Chambre à coucher (aile est)',85.0,111.0,-3.7,8.4],
      ['Cabinet (aile est, sud)',85.0,111.0,8.8,20.1],
    ];
    roomDefs.forEach(([name,x0,x1,z0,z1])=>rooms[f].push({name,x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,level:isEG?0:1}));
    // Stone or timber doorways are real gaps; each split section gets a framed lintel.
    function wallX(x0,x1,z,doorXs=[]){
      const W=3.25,dh=3.45;let last=x0;
      const doors=doorXs.filter(x=>x>x0+W/2+.3&&x<x1-W/2-.3).sort((a,b)=>a-b);
      function block(a,b){if(b-a>.035){planCube(f,'wall',(a+b)/2,base+H/2,z,b-a,H,t);collisionWalls[f].push({x0:a,x1:b,z0:z-t/2,z1:z+t/2});}}
      for(const x of doors){block(last,x-W/2);planCube(f,'wall',x,base+dh+(H-dh)/2,z,W,H-dh,t);last=x+W/2;
        for(const xx of [x-W/2,x+W/2])planCube(f,'win',xx,base+dh/2,z,.19,dh+.15,.69);
        planCube(f,'trim',x,base+dh+.11,z,W+.38,.21,.75);
        // Thin inlaid threshold gives a visual door line, without blocking walking.
        planCube(f,'paving',x,base+.02,z,W,.035,.65);
      }
      block(last,x1);
    }
    function wallZ(x,z0,z1,doorZs=[]){
      const W=3.3,dh=3.45;let last=z0;
      const doors=doorZs.filter(z=>z>z0+W/2+.25&&z<z1-W/2-.25).sort((a,b)=>a-b);
      function block(a,b){if(b-a>.035){planCube(f,'wall',x,base+H/2,(a+b)/2,t,H,b-a);collisionWalls[f].push({x0:x-t/2,x1:x+t/2,z0:a,z1:b});}}
      for(const z of doors){block(last,z-W/2);planCube(f,'wall',x,base+dh+(H-dh)/2,z,t,H-dh,W);last=z+W/2;
        for(const zz of [z-W/2,z+W/2])planCube(f,'win',x,base+dh/2,zz,.70,dh+.15,.20);
        planCube(f,'trim',x,base+dh+.11,z,.78,.21,W+.38);
        planCube(f,'paving',x,base+.02,z,.64,.035,W);
      }
      block(last,z1);
    }
    // The 1776 engraving puts large reception rooms on the rear/garden side;
    // front row is vestibule/stair and services. Do not fill every connection.
    if(isEG){
      // The large eastern assembly cabinet spans the rear/front cross-line.
      wallX(-111.4,84.8,-3.90,[-97,-72,-42,0,40,71]);
    }else{
      // In the upper plan this is a balustraded gallery above the salon, not
      // a thick solid wall separating vestibule from the void.
      wallX(-111.4,-28.1,-3.90,[-97,-72,-42]);
      wallX(28.1,111.4,-3.90,[40,71,98]);
    }
    // Rear enfilade room dividers, with doors through the x partitions.
    for(const x of [-89,-54.6,-28,28,52,85]){
      // The first floor double-height Salon is open, but its SIDE walls remain.
      wallZ(x,-20.5,-4.10,[-12.0]);
    }
    // Front suite: different room boundaries between floors, per historical plate.
    const frontDividers=isEG?[-91.3,-54.8,-28,28,58,85]:[-91.3,-55,-28,28,58,85];
    // A second aligned doorway in the huge front range creates an actual
    // connected east-west passage without removing historical room partitions.
    for(const x of frontDividers)wallZ(x,-3.70,20.55,[8.6,12.5]);
    // Subdivided service quarters and first-floor dressing rooms, visible in plan.
    if(isEG){
      wallX(-111.2,-91.5,2.9,[-101,-97]);
      wallX(-111.2,-91.5,9.7,[-101,-97]);
      wallX(-91.1,-54.8,8.3,[-73]);
      wallX(58.0,84.7,2.5,[71]);
      wallX(84.8,111.2,8.4,[98]);
    }else{
      wallX(-111.2,-91.5,-7.0,[-101]);
      wallX(-111.2,-91.5,-1.2,[-101]);
      wallX(-111.2,-91.5,5.2,[-101]);
      wallX(28.1,57.9,4.2,[43]);
      wallX(58.1,84.7,3.6,[70]);
      wallX(58.1,84.7,9.3,[70]);
      wallX(84.8,111.2,-12.6,[98]);
      wallX(84.8,111.2,8.6,[98]);
    }
    // Continuous outer walking surface is already provided by main palace slabs.
    // Room borders get visible noble-stone skirting on both sides.
    for(const z of [-3.9]){
      for(const x of [-91.5,-72,-42,0,40,71,98]){
        planCube(f,'trim',x,base+.16,z,1.10,.26,.80);
      }
    }
    // The Grand Escalier occupies its historically identifiable western bay.
    // Start as an actual walkable 3D staircase; a future step will refine balusters.
    const stairW=6.8, sx1=-47.3, sx2=-35.2, stepsEach=12;
    const rise=(11.05-4.72)/(2*stepsEach);
    if(isEG){
      // Real U-return staircase, following the horseshoe form on the scan.
      for(let i=0;i<stepsEach;i++){
        const ya=base+(i+1)*rise;
        const za=14.1-i*1.20;
        planCube(f,'paving',sx1,ya-.13,za,stairW,.24,1.23);
        planCube(f,'trim',sx1,ya+.018,za+.53,stairW+.03,.036,.12);
        const yb=base+(stepsEach+i+1)*rise;
        const zb=.2+i*1.20;
        planCube(f,'paving',sx2,yb-.13,zb,stairW,.24,1.23);
        planCube(f,'trim',sx2,yb+.018,zb+.53,stairW+.03,.036,.12);
      }
      // Half-height turnaround landing joins the two flights.
      planCube(f,'paving',-41.25,base+stepsEach*rise-.12,-1.05,20.7,.24,2.3);
      for(const xx of [sx1-stairW/2-.22,sx2+stairW/2+.22]){
        planCube(f,'win',xx,base+3.2,6.7,.21,6.0,15.4);
      }
    }else{
      // A full-size landing at first-floor elevation; the stair void below
      // is retained by the separately split structural floor plate.
      planCube(f,'paving',-41.25,base+.04,16.35,21.9,.15,7.20);
      planCube(f,'paving',-30.40,base+.04,10.15,3.82,.15,18.9);
      for(const xx of [-52.2,-30.3]){
        planCube(f,'trim',xx,base+1.08,5.0,.20,.18,20.4);
        for(let z=-3.0;z<14.9;z+=1.34)
          planCube(f,'stone',xx,base+.54,z,.17,1.08,.17);
      }
    }
    // First-floor mezzanine guard rail around the salon's 48x16 m open volume.
    if(!isEG){
      const railY=base+1.10;
      for(const x of [-24.0,24.0]){
        planCube(f,'trim',x,railY,-12.5,.25,.20,14.4);
        for(let z=-19;z<-5;z+=1.55)planCube(f,'stone',x,base+.56,z,.17,1.05,.17);
      }
      planCube(f,'trim',0,railY,-4.9,48.2,.20,.25);
      for(let x=-23;x<23;x+=1.8)planCube(f,'stone',x,base+.56,-4.9,.17,1.05,.17);
    }
    // Warm historic marble floors; separate texture accents identify major rooms.
    const tint=isEG?'paving':'trim';
    for(const room of rooms[f]){
      if(room.name.startsWith('Vide'))continue;
      const inset=1.1;
      // very thin floor inset; top slab itself remains solid below it
      planCube(f,tint,room.x,base+.007,room.z,Math.max(.6,room.w-inset),.028,Math.max(.6,room.d-inset));
      const w=Math.max(.5,room.w-1.6),d=Math.max(.5,room.d-1.6);
      // Inlaid perimeter border, not a solid panel blocking movement.
      for(const xx of [room.x-w/2,room.x+w/2])planCube(f,'win',xx,base+.035,room.z,.075,.035,d);
      for(const zz of [room.z-d/2,room.z+d/2])planCube(f,'win',room.x,base+.035,zz,w,.035,.075);
    }
    // Named room labels only shown in floor-plan views, not blocking the walk camera.
    for(const room of rooms[f]){
      if(room.w<10||room.d<7||room.name.startsWith('Vide'))continue;
      const c=document.createElement('canvas');c.width=512;c.height=128;
      const c2=c.getContext('2d');c2.clearRect(0,0,512,128);
      c2.fillStyle='rgba(32,45,50,.80)';c2.fillRect(5,8,502,108);
      c2.strokeStyle='rgba(231,214,179,.75)';c2.strokeRect(6,9,500,106);
      c2.fillStyle='#fff0d9';c2.font='bold 36px Georgia, serif';c2.textAlign='center';c2.textBaseline='middle';
      let label=room.name.length>24?room.name.slice(0,23)+'…':room.name;
      c2.fillText(label,256,65,460);
      const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
      const material=new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
      const labelMesh=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(24,Math.max(8,room.w*.75)),2.3),material);
      labelMesh.name='Historischer_Raumname_'+room.name;
      labelMesh.rotation.x=-Math.PI/2;
      labelMesh.position.set(room.x,base+.085,room.z);
      labelMesh.renderOrder=10;
      labelMesh.userData.floorPlanLabel=true;
      floorLayers[f].add(labelMesh);
    }
  }
  buildRoissyFloor('eg');
  buildRoissyFloor('og');

  // Roof construction: two-pitch mansard with real hipped upper slopes,
  // a continuous eave, crest and properly fitted diagonal planes.
  function roof(x,z,w,d,base=ROOF_EAVE,mid=ROOF_SHOULDER,top=ROOF_RIDGE,inset=5.7){
    const xa=x-w/2,xb=x+w/2,za=z-d/2,zb=z+d/2;
    const ia=xa+inset,ib=xb-inset,ja=za+inset,jb=zb-inset;
    const parts=[
      [ [xa,base,zb],[xb,base,zb],[ib,mid,jb],[ia,mid,jb] ],
      [ [xb,base,za],[xa,base,za],[ia,mid,ja],[ib,mid,ja] ],
      [ [xb,base,zb],[xb,base,za],[ib,mid,ja],[ib,mid,jb] ],
      [ [xa,base,za],[xa,base,zb],[ia,mid,jb],[ia,mid,ja] ]
    ];
    const alongX=(ib-ia)>=(jb-ja);
    if(alongX){
      const aa=ia+(jb-ja)*.47,bb=ib-(jb-ja)*.47;
      parts.push([[ia,mid,jb],[ib,mid,jb],[bb,top,z],[aa,top,z]]);
      parts.push([[ib,mid,ja],[ia,mid,ja],[aa,top,z],[bb,top,z]]);
      parts.push([[ia,mid,ja],[ia,mid,jb],[aa,top,z]]);
      parts.push([[ib,mid,jb],[ib,mid,ja],[bb,top,z]]);
    }else{
      const aa=ja+(ib-ia)*.47,bb=jb-(ib-ia)*.47;
      parts.push([[ib,mid,jb],[ib,mid,ja],[x,top,aa],[x,top,bb]]);
      parts.push([[ia,mid,ja],[ia,mid,jb],[x,top,bb],[x,top,aa]]);
      parts.push([[ia,mid,ja],[ib,mid,ja],[x,top,aa]]);
      parts.push([[ib,mid,jb],[ia,mid,jb],[x,top,bb]]);
    }
    const pts=[];
    for(const part of parts){
      const tris=part.length===4?[[0,1,2],[0,2,3]]:[[0,1,2]];
      for(const tri of tris)for(const index of tri)pts.push(...part[index]);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,bronze);m.name='Mansard_Deckflaechen';m.castShadow=m.receiveShadow=true;palace.add(m);
    // Solid cornice and black zinc gutter, no disconnected roof bars.
    cube('trim',x,base+.06,zb+.25,w+.4,.30,.7);
    cube('trim',x,base+.06,za-.25,w+.4,.30,.7);
    cube('trim',xa-.25,base+.06,z,.70,.30,d+.4);
    cube('trim',xb+.25,base+.06,z,.70,.30,d+.4);
  }
  for(const f of footprints)roof(f.x,f.z,f.w,f.d);
  function dormerX(x,z,front=true,s=1){
    const sign=front?1:-1;
    const y=27.30,zz=z+sign*.15;
    // Hollow limestone dormer: no opaque block behind the front glass.
    for(const dx of [-1.39,1.39])cube('win',x+dx*s,y,zz,.37*s,3.9*s,2.30*s);
    for(const dy of [-1.77,1.77])cube('win',x,y+dy*s,zz,2.50*s,.37*s,2.30*s);
    // Removed opaque dormer backing: true window transparency.
    cube('glass',x,y,zz+sign*1.31*s,2.22*s,2.78*s,.06*s);
    cube('sash',x,y,zz+sign*1.38*s,.09*s,2.7*s,.13*s);
    cube('sash',x,y+.15*s,zz+sign*1.38*s,2.25*s,.10*s,.13*s);
    for(const dx of [-1.40,1.40])cube('trim',x+dx*s,y,zz+sign*1.43*s,.32*s,3.45*s,.44*s);
    cube('trim',x,y-2.00*s,zz+sign*1.40*s,3.70*s,.30*s,2.10*s);
    cone('bronze',x,y+2.75*s,zz,2.10*s,2.25*s); // faceted dormer cap
    sphere('gold',x,y+4.15*s,zz,.18*s);
  }
  function dormerZ(x,z,side=1,s=1){
    const y=27.55;
    // Hollow side-facing dormer, framed round an actual glazed opening.
    for(const dz of [-1.36,1.36])cube('win',x,y,z+dz*s,2.25*s,3.8*s,.38*s);
    for(const dy of [-1.72,1.72])cube('win',x,y+dy*s,z,2.25*s,.36*s,2.42*s);
    // Removed opaque dormer backing: true window transparency.
    cube('glass',x+side*1.30*s,y,z,.07*s,2.78*s,2.16*s);
    for(const dz of [-1.3,1.3])cube('trim',x+side*1.34*s,y,z+dz*s,.40*s,3.45*s,.30*s);
    cube('trim',x+side*1.35*s,y-2*s,z,1.80*s,.26*s,3.55*s);
    cone('bronze',x,y+2.60*s,z,2.10*s,2.25*s);
    sphere('gold',x,y+4.0*s,z,.16*s);
  }
  for(const x of grid(-98,98,9.8))if(Math.abs(x)>25){dormerX(x,18.7,true,.95);dormerX(x,-18.7,false,.88);}
  for(const wing of wings){
    for(const z of grid(-148,-29,10.8)){
      dormerZ(wing.x+Math.sign(wing.x)*14.9,z,Math.sign(wing.x),.87);
      dormerZ(wing.x-Math.sign(wing.x)*14.9,z,-Math.sign(wing.x),.85);
    }
  }
  for(const x of grid(-90,90,9.8)){dormerX(x,rearZ0+2,false,.86);dormerX(x,rearZ1-2,true,.86);}
  // A stately central dome: fully supported by a real drum, dark segmented copper,
  // 16 curved standing ribs, lantern and gilded finial.
  function grandDome(x,z,r,drumBase,drumH,pavilion=false){
    const rim=drumBase+drumH;
    // Real punched openings in the curved stone drum. Old solid cylinder
    // plus black window spheres made the glazing opaque from both sides.
    const drumPts=[],glassPts=[];
    const circum=128, rings=[0,.30,.73,1];
    const angularGap=(a,b)=>Math.abs(((a-b+Math.PI*3)%(Math.PI*2))-Math.PI);
    function point(a,t,offset=0){const rr=r*(.94+.06*t)+offset;return [x+Math.cos(a)*rr,drumBase+drumH*t,z+Math.sin(a)*rr];}
    const addTri=(target,p,q,r0)=>target.push(...p,...q,...r0);
    const addQuad=(target,a,b,c,d)=>{addTri(target,a,b,c);addTri(target,a,c,d);};
    const centerAngles=Array.from({length:8},(_,i)=>i*Math.PI/4+Math.PI/16);
    for(let i=0;i<circum;i++){
      const a=i*2*Math.PI/circum,b=(i+1)*2*Math.PI/circum,mid=(a+b)/2;
      const isHole=centerAngles.some(h=>angularGap(mid,h)<.113);
      for(let j=0;j<rings.length-1;j++){
        if(j===1&&isHole){
          // Transparent, slightly offset curved window pane; no stone behind it.
          addQuad(glassPts,point(a,rings[j],.055),point(b,rings[j],.055),point(b,rings[j+1],.055),point(a,rings[j+1],.055));
          continue;
        }
        addQuad(drumPts,point(a,rings[j]),point(b,rings[j]),point(b,rings[j+1]),point(a,rings[j+1]));
      }
    }
    const drumGeo=new THREE.BufferGeometry();drumGeo.setAttribute('position',new THREE.Float32BufferAttribute(drumPts,3));drumGeo.computeVertexNormals();
    const drumMat=stoneColumn.clone();drumMat.side=THREE.DoubleSide;
    const drums=new THREE.Mesh(drumGeo,drumMat);
    drums.name='Kuppeltambour_mit_echten_Fensteroeffnungen';
    drums.castShadow=drums.receiveShadow=true;palace.add(drums);
    const curveGlassGeo=new THREE.BufferGeometry();curveGlassGeo.setAttribute('position',new THREE.Float32BufferAttribute(glassPts,3));curveGlassGeo.computeVertexNormals();
    const domeGlass=new THREE.Mesh(curveGlassGeo,glass);
    domeGlass.name='Beidseitig_transparente_Kuppelfenster';domeGlass.castShadow=false;palace.add(domeGlass);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(r,48,24,0,2*Math.PI,0,Math.PI/2),bronze);
    cap.name='Originale_3D_Kuppelschale';cap.position.set(x,rim,z);
    cap.castShadow=cap.receiveShadow=true;palace.add(cap);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r+.14,.32,8,64),stoneLight);
    ring.position.set(x,rim,z);ring.rotation.x=Math.PI/2;palace.add(ring);
    const baseBand=new THREE.Mesh(new THREE.TorusGeometry(r+.22,.30,8,64),stoneLight);
    baseBand.position.set(x,drumBase+.38,z);baseBand.rotation.x=Math.PI/2;palace.add(baseBand);
    for(let i=0;i<16;i++){
      const a=i*Math.PI/8;
      const px=x+Math.cos(a)*(r+.20),pz=z+Math.sin(a)*(r+.20);
      cylinder('trim',px,drumBase+drumH*.51,pz,.25,drumH*.90);
      const arch=new THREE.CatmullRomCurve3(Array.from({length:14},(_,k)=>{
        const t=k/13*Math.PI/2;
        return new THREE.Vector3(x+(r+.12)*Math.cos(t)*Math.cos(a),rim+(r+.12)*Math.sin(t),z+(r+.12)*Math.cos(t)*Math.sin(a));
      }));
      const rib=new THREE.Mesh(new THREE.TubeGeometry(arch,20,pavilion?.085:.11,4,false),bronzeEdge);
      rib.name='Geschwungene_Kuppelrippe';palace.add(rib);
      // Kuppel-Glasflächen liegen zwischen den Rippen und haben reale
      // Öffnungen; keine schwarzen Dekorkugeln vor geschlossenem Stein.
    }
    const top=rim+r;
    cylinder('trim',x,top+.40,z,1.95,.85);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      cylinder('stone',x+Math.cos(a)*1.23,top+1.54,z+Math.sin(a)*1.23,.16,1.95);
    }
    cylinder('bronze',x,top+2.61,z,1.63,.34);
    cone('gold',x,top+3.18,z,.72,.85);
    sphere('gold',x,top+3.93,z,.44);
    return {top:top+4.5};
  }
  // Main dome: drum intersects raised roof crown, preventing any hovering base.
  // Corresponding roof range remains intact and underneath the genuine 3D dome.
  grandDome(0,-1.5,16.8,32.0,7.4,false);
  for(const x of [-99,99]){
    for(const z of [9,-176]){
      // A full-size palace pavilion with its own limestone drum and curved slate cupola.
      cube('stone',x,25.8,z,20.2,5.3,20.2);
      for(const hh of [23.55,28.60]){
        cube('trim',x,hh,z+10.2,20.9,.35,.73);
        cube('trim',x,hh,z-10.2,20.9,.35,.73);
        cube('trim',x+10.2,hh,z,.73,.35,20.9);
        cube('trim',x-10.2,hh,z,.73,.35,20.9);
      }
      grandDome(x,z,9.1,28.0,3.9,true);
    }
  }
  grandDome(0,-176,10.5,31.0,4.6,true);
  // Sculptural stone roof balustrade. Many separate posts are batched into only
  // a small number of WebGL drawcalls through the InstancedMesh factory.
  function parapet(frontZ,xmin,xmax){
    cube('win',(xmin+xmax)/2,24.25,frontZ,xmax-xmin,.30,.64);
    cube('trim',(xmin+xmax)/2,26.08,frontZ,xmax-xmin,.18,.73);
    for(let x=xmin+1;x<xmax-1;x+=2.8){
      cube('stone',x,25.18,frontZ,.37,1.73,.39);
      cylinder('trim',x,24.69,frontZ,.25,.23);
      cylinder('trim',x,25.75,frontZ,.27,.21);
    }
  }
  parapet(21.6,-108,-24);parapet(21.6,24,108);
  parapet(rearZ0-.5,-103,-15);parapet(rearZ0-.5,15,103);
  // Massive quoins at all exposed corners – alternated blocks, no skinny floating rods.
  for(const [x,z] of [[-112,21],[112,21],[-112,-21],[112,-21],[-105.5,-158],[-70.5,-158],[70.5,-158],[105.5,-158],[-105.5,-196.5],[105.5,-196.5]]){
    for(let k=0;k<28;k++){
      const y=.49+k*.80;
      if(y>=23.1)break;
      cube(k%2?'stone':'win',x,y,z,k%2?1.25:1.02,.64,k%2?1.06:1.25);
    }
  }
  // A ceremonial forecourt and full internal French parterre; strictly 3D objects.
  const walk=(x,z,w,d)=>cube('paving',x,.018,z,w,.07,d);
  walk(0,93,15,113);walk(0,-88,9,129);
  for(const zz of [68,105])for(const sx of [-1,1]){
    cube('hedge',sx*25,.25,zz,32,.50,14);
    cube('paving',sx*25,.28,zz,30,.07,12);
    for(const xx of [-39,-11]){
      const cx=sx*25+(xx+25)*.28;
      cube('hedge',cx,.47,zz,.62,.75,11.5);
    }
    for(const end of [-5,5])cube('hedge',sx*25,.40,zz+end,30,.48,.67);
  }
  function fountain(x,z,r){
    const disk=new THREE.Mesh(new THREE.CylinderGeometry(r,r,0.45,48),stoneWindow);
    disk.name='Brunnenbecken_Kalkstein';disk.position.set(x,.24,z);palace.add(disk);
    const pool=new THREE.Mesh(new THREE.CylinderGeometry(r-.43,r-.43,.14,48),water);
    pool.position.set(x,.55,z);palace.add(pool);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(r-.06,.24,8,48),stoneLight);
    rim.rotation.x=Math.PI/2;rim.position.set(x,.57,z);palace.add(rim);
    cylinder('stone',x,1.05,z,.83,1.22);sphere('win',x,1.91,z,.91);
    cylinder('gold',x,2.45,z,.10,.86);
  }
  fountain(0,-80,10.2);fountain(0,-126,5.9);
  for(const x of [-46,-29,29,46])for(const z of [-49,-113]){
    cube('hedge',x,.38,z,22,.66,20);
    cube('paving',x,.40,z,20,.08,18.2);
    for(const xx of [-9.5,9.5])cube('hedge',x+xx,.72,z,.74,.68,18);
    for(const zz of [-8.5,8.5])cube('hedge',x,.72,z+zz,19,.68,.74);
  }
  // Cypress trees at the parterre intersections. Casts are disabled for mobile cost.
  for(const x of [-58,-20,20,58])for(const z of [-32,-64,-96,-136]){
    cylinder('stone',x,.55,z,.70,1.1);
    cylinder('hedge',x,1.22,z,.36,1.5);
    cone('tree',x,6.48,z,1.65,9.8);
  }
  // Ornate roof finials and chimney stacks at intervals along the monumental facade.
  for(const x of grid(-94,94,13.6)){
    cube('stone',x,36.1,-9,1.75,2.8,1.48);
    cube('trim',x,37.54,-9,2.15,.31,1.9);
  }
  // Exterior uplights: emissive meshes, only a handful of actual point lights.
  for(const x of grid(-105,105,7)){
    if(Math.abs(x)<26)continue;
    sphere('light',x,1.08,22.10,.13);
    cylinder('gold',x,.59,22.10,.15,.91);
  }
  const nightUplightXs=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches?[-24,24]:[-50,-24,0,24,50];
  for(const x of nightUplightXs){
    const lum=new THREE.PointLight(0xffce91,.58,43,2.0);
    lum.position.set(x,5.9,26.6);palace.add(lum);
  }
  // Authentic MaxGame portico reused at 2× monumental height, reassembled with
  // TWELVE original fluted donor pillars, not repeated low-poly cylinder substitutes.
  donor.updateMatrixWorld(true);
  const portico=new THREE.Group();portico.name='ORIGINAL_MAXGAME_PORTIKUS_MONUMENTAL';
  portico.scale.set(2.75,2.03,1.79);
  portico.position.set(0,3.0,21-11.8*1.79+.48);
  palace.add(portico);
  const cloneDonor=(obj,mat,into=portico)=>{
    const part=obj.clone(false);
    obj.matrixWorld.decompose(part.position,part.quaternion,part.scale);
    part.material=mat;part.castShadow=part.receiveShadow=true;into.add(part);
    return part;
  };
  // The source Cube433–Cube438 are solid donor podium/stair blocks: OMIT THEM.
  // Their extra thickness caused the visible 2 m+ layered slab at the entrance.
  for(const name of ['Giebel','Cube431','Cube432','Cube439','Cube440']){
    const obj=donor.getObjectByName(name);
    if(!obj||!obj.isMesh)continue;
    const id=name==='Giebel'?-1:Number(name.slice(4));
    cloneDonor(obj,id===431?mats.soffit:(id===-1?mats.dressedStone:mats.trim));
  }
  // Base four shafts derive from the donor. Six copies per row share the original
  // polygonal geometries, shifted along the length for dense 12-column colonnade.
  const samples=['Cone001','Cone007','Cone010','Cone013'];
  const bases=[419,423,425,427],caps=[420,424,426,428];
  const originalXs=[-7.4,-2.47,2.47,7.4];
  const targetXs=[-7.4,-4.44,-1.48,1.48,4.44,7.4];
  const frontBase=donor.getObjectByName('Cube419');
  const baseZ=new THREE.Box3().setFromObject(frontBase,true).getCenter(new THREE.Vector3()).z;
  const beam=donor.getObjectByName('Cube431');
  const beamBounds=new THREE.Box3().setFromObject(beam,true);
  const rearZ=beamBounds.min.z+beamBounds.max.z-baseZ;
  for(const rowZ of [baseZ,rearZ]){
    targetXs.forEach(tx=>{
      let nearest=0,best=Infinity;
      originalXs.forEach((ox,j)=>{const err=Math.abs(tx-ox);if(err<best){best=err;nearest=j;}});
      const shaft=donor.getObjectByName(samples[nearest]);
      const foot=donor.getObjectByName('Cube'+bases[nearest]);
      const abacus=donor.getObjectByName('Cube'+caps[nearest]);
      if(!shaft||!foot||!abacus)throw Error('MaxGame donor pillars are missing.');
      const col=new THREE.Group();col.name='MaxGame_Echte_kannelierte_Saeule';
      // Correct non-uniform donor scaling: shafts stay ROUND in world space.
      // The facade is widened to 2.75x, while column diameter retains a 1.79x
      // isotropic scale. This also creates >1 m clear jamb-to-pedestal spacing.
      const circularScale=portico.scale.z/portico.scale.x;
      col.scale.x=circularScale;
      col.position.set(tx-originalXs[nearest]*circularScale,0,rowZ-baseZ);portico.add(col);
      addPorticoColumn(THREE,col,shaft,mats);
      cloneDonor(foot,mats.trim,col);cloneDonor(abacus,mats.trim,col);
    });
  }
  if(portico.children.length<17)throw Error('MaxGame donor portico incomplete.');
  // Recessed architectural podium. A 32 cm stone landing above an inset masonry
  // foundation replaces the former flush 4.5 m dark box around the staircase.
  cube('wall',0,2.18,28.45,48.1,4.36,14.4);
  cube('paving',0,4.47,28.66,53.2,.30,18.0);
  cube('trim',0,4.66,28.66,53.45,.12,18.14);
  // Accessible threshold: landing top is y=4.72, walnut doors start at y=4.68.
  // Six framed blind arches articulate the recessed foundation side faces.
  for(const sign of [-1,1]){
    const xx=sign*24.23;
    for(const zz of [24.4,28.7,33.0]){
      cube('base',xx+sign*.065,1.98,zz,.14,2.55,2.78);
      cube('win',xx+sign*.18,1.98,zz,.085,2.12,2.30);
      for(const dz of [-1.13,1.13])cube('trim',xx+sign*.28,2.07,zz+dz,.20,1.98,.19);
      const arch=new THREE.Mesh(new THREE.TorusGeometry(1.13,.090,7,20,0,Math.PI),stoneLight);
      arch.name='Bogenförmige_Podiumsblende';
      arch.rotation.y=Math.PI/2;
      arch.position.set(xx+sign*.30,3.06,zz);
      arch.castShadow=false;palace.add(arch);
    }
    // Slim terrace balustrade on the podium's outer edges.
    cube('trim',sign*26.48,5.30,28.6,.34,.17,13.4);
    for(let z=22.8;z<=35.0;z+=1.45){
      cylinder('stone',sign*26.48,4.96,z,.13,.69);
      sphere('win',sign*26.48,5.12,z,.15);
    }
  }
  // Four wall lanterns in the masonry bays, clear of all three doors.
  for(const x of [-24.5,-8.3,8.3,24.5]){
    cube('bronze',x,7.35,21.91,.34,1.21,.29);
    cube('gold',x,7.92,22.03,.45,.11,.50);
    cube('gold',x,6.78,22.03,.45,.10,.48);
    cube('light',x,7.36,22.11,.23,.68,.21);
    sphere('gold',x,8.04,22.01,.15);
  }
  // Stone cartouche set into the original MaxGame gable, plus modest cornice finials.
  const crest=new THREE.Mesh(new THREE.TorusGeometry(.88,.12,8,26),gilt);
  crest.name='Wappenring_im_Original_Giebel';crest.position.set(0,30.45,34.87);crest.castShadow=false;palace.add(crest);
  sphere('stone',0,30.45,34.90,.46);
  for(const sign of [-1,1]){
    cube('stone',sign*23.0,27.85,34.7,1.06,.74,1.06);
    sphere('win',sign*23.0,28.48,34.7,.58);
    cone('gold',sign*23.0,29.05,34.7,.15,.43);
  }
  flush();
  return {front:palace,originalPortico:portico,facadeWidth:224,
    entranceAudit:{doors:[-16.28,0,16.28],doorWidth:DOOR_WIDTH,columns:[-20.35,-12.21,-4.07,4.07,12.21,20.35],shaftScaleUniform:1.79,stairRisers:26,stairTotalRise:4.50},
    palaceDimensions:{width:224,depth:217,height:64},
    buildings:['Corps de logis','Westfluegel','Ostfluegel','Rueckwaertiger Quertrakt'],
    historicalFloors:rooms,historicalLayers:floorLayers,interiorCollision:collisionWalls,entranceDoors,
    instancedDrawcalls:batches.size+planBatches.size,instancedElements:[...batches.values(),...planBatches.values()].reduce((n,a)=>n+a.length,0)};
}
