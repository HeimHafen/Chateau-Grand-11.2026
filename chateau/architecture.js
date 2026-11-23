/**
 * CHÂTEAU GRAND 2027 — PALAST 2.0
 * Monumental, courtyard-based French palace. Entire exterior is assembled with
 * instanced ashlar modules, real (non-decals) window holes, MaxGame PBR stone,
 * authentic donor portico geometry, and roof pavilions with copper domes.
 * Source units: metres. No generated 2D picture is substituted for geometry.
 */
import {addPorticoColumn} from '../wohnzimmer/portico-columns-v2.js';

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
  const glow=new THREE.MeshStandardMaterial({color:0xf6c47e,emissive:0xff9a49,emissiveIntensity:.78,roughness:.58});
  const materialMap={wall:stoneMid,trim:stoneLight,win:stoneWindow,base:mats.shade,stone:stoneColumn,
    glass,behind:glassDark,interior:litInterior,sash:mats.paintedSash,roof:darkSlate,bronze,edge:bronzeEdge,gold:gilt,
    tree:foliage,hedge,water,light:glow,paving:mats.porticoPaving};
  const geometryMap={box:basis,orb:new THREE.SphereGeometry(1,10,7),cone:new THREE.ConeGeometry(1,1,10),
    cyl:new THREE.CylinderGeometry(1,1,1,14),thinCyl:new THREE.CylinderGeometry(1,1,1,8)};
  function push(kind,mat,x,y,z,sx,sy,sz){
    if(!Number.isFinite(x+y+z+sx+sy+sz)||sx<=0||sy<=0||sz<=0)throw Error(`Ungültige Architekturmaße: ${kind}`);
    const key=kind+':'+mat;
    if(!batches.has(key))batches.set(key,[]);
    batches.get(key).push([x,y,z,sx,sy,sz]);
  }
  const cube=(mat,x,y,z,w,h,d)=>push('box',mat,x,y,z,w,h,d);
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
  // Wall strips around openings. No wall boxes behind window glass.
  function masonryLine(axis,fixed,from,to,face,bayXs,{trimDetail=true,entrance=false,corps=false}={}){
    const fixedWall=fixed;
    const exterior=face; // +1 is outward toward positive X/Z.
    function stoneAlong(coord,bottom,w,h,depth=.72,mat='wall',offset=0){
      if(axis==='X')cube(mat,coord,bottom+h/2,fixedWall+offset*exterior,w,h,depth);
      else cube(mat,fixedWall+offset*exterior,bottom+h/2,coord,depth,h,w);
    }
    function window(coord,y,level,grandDoor){
      const height=grandDoor?5.35:levels[level].holeH;
      const width=grandDoor?4.2:level===0?2.6:3.25;
      const base=y+(grandDoor?.08:levels[level].holeY);
      const longSide=(axis==='X');
      const place=(mat,long,vert,depth,offset,yy)=>{
        if(longSide)cube(mat,coord,yy,fixedWall+exterior*offset,long,vert,depth);
        else cube(mat,fixedWall+exterior*offset,yy,coord,depth,vert,long);
      };
      // Deep window reveal; recessed dark glass and one thin transparent pane.
      place(!grandDoor && ((Math.abs(Math.round(coord*10))+level*13)%7<3)?'interior':'behind',width-.22,height-.15,.09,0,base+height/2);
      if(!grandDoor)place('glass',width-.32,height-.20,.05,.13,base+height/2);
      if(grandDoor){
        place('base',width-.35,height-.15,.25,.15,base+height/2);
        place('win',.085,height-.25,.21,.42,base+height/2);
        for(const yy of [.2,.46,.72])place('trim',width-.45,.075,.26,.40,base+height*yy);
        for(const dd of [-.27,.27]){
          const gg=new THREE.SphereGeometry(.085,8,6);
          const oo=new THREE.Mesh(gg,gilt);
          if(longSide)oo.position.set(coord+dd,base+2.4,fixedWall+exterior*.57);
          else oo.position.set(fixedWall+exterior*.57,base+2.4,coord+dd);
          palace.add(oo);
        }
      }else{
        place('sash',.085,height-.21,.17,.30,base+height/2);
        for(const s of [-.30,.30]){
          // slim mullion half-way to the reveals
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
        const door=entrance&&i===1&&Math.abs(pos)<13;
        const ww=door?4.2:(i===0?2.6:3.25);
        const left=pos-ww/2,right=pos+ww/2;
        if(left>last)stoneAlong((last+left)/2,l,left-last,r-l);
        const bottom=door?l+.08:l+level.holeY;
        const high=door?5.35:level.holeH;
        if(bottom>l+.01)stoneAlong(pos,l,ww,bottom-l);
        if(bottom+high<r-.01)stoneAlong(pos,bottom+high,ww,r-(bottom+high));
        window(pos,l,i,door);
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
  const frontAxes=grid(-103.5,103.5,6.9);
  const mainRearAxes=frontAxes;
  masonryLine('X',21,-112,112,1,frontAxes,{entrance:true,corps:true});
  masonryLine('X',-21,-112,112,-1,mainRearAxes,{corps:true});
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
  masonryLine('X',rearZ1,-rear.w/2,rear.w/2,1,rearAxes);
  masonryLine('X',rearZ0,-rear.w/2,rear.w/2,-1,rearAxes);
  const rearSideAxes=grid(-191,-163,6.6);
  masonryLine('Z',rear.w/2,rearZ0,rearZ1,1,rearSideAxes);
  masonryLine('Z',-rear.w/2,rearZ0,rearZ1,-1,rearSideAxes);
  // Monumental stairs, shared plinth, complete ground-floor decks and slabs.
  for(const f of footprints){
    cube('base',f.x,-.36,f.z,f.w+.6,.72,f.d+.6);
    for(const yy of [4.61,10.96,17.35,23.22])cube('base',f.x,yy-.06,f.z,f.w-.8,.16,f.d-.8);
  }
  // 22 broad treads rise to the original MaxGame podium, now at piano-nobile level.
  for(let i=0;i<22;i++){
    const width=44+1.05*i,height=.205*(22-i);
    cube('paving',0,height/2,38.1+i*.91,width,height,.94);
    cube('trim',0,height+.035,38.1+i*.91,width+.04,.055,.95);
  }
  for(const x of [-27.1,27.1]){
    cube('base',x,2.27,29,1.6,4.54,13.2);
    for(let i=0;i<6;i++)sphere('win',x,4.68,23.4+i*2.15,.28);
  }
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
    cube('win',x,y,zz,3.15*s,3.9*s,2.30*s);
    cube('behind',x,y,zz+sign*1.23*s,2.35*s,2.85*s,.12*s);
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
    cube('win',x,y,z,2.25*s,3.8*s,3.1*s);
    cube('behind',x+side*1.21*s,y,z,.11*s,2.85*s,2.25*s);
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
    const drums=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.94,drumH,48,1,true),stoneColumn);
    drums.name='Geschlossener_steinerner_Kuppeltambour';drums.position.set(x,drumBase+drumH/2,z);
    drums.castShadow=drums.receiveShadow=true;palace.add(drums);
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
      if(i%2===0){
        // Arched, glass-like drum opening framed by limestone pilasters.
        const p=x+Math.cos(a)*(r+.35),q=z+Math.sin(a)*(r+.35);
        const win=new THREE.Mesh(new THREE.SphereGeometry(.78,8,8),glassDark);
        win.scale.set(.7,1.33,.21);win.position.set(p,drumBase+drumH*.56,q);palace.add(win);
      }
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
  portico.scale.set(2.32,2.03,1.79);
  portico.position.set(0,3.0,21-11.8*1.79+.48);
  palace.add(portico);
  const cloneDonor=(obj,mat,into=portico)=>{
    const part=obj.clone(false);
    obj.matrixWorld.decompose(part.position,part.quaternion,part.scale);
    part.material=mat;part.castShadow=part.receiveShadow=true;into.add(part);
    return part;
  };
  for(const name of ['Giebel',...Array.from({length:10},(_,i)=>'Cube'+(431+i))]){
    const obj=donor.getObjectByName(name);
    if(!obj||!obj.isMesh)continue;
    const id=name==='Giebel'?-1:Number(name.slice(4));
    cloneDonor(obj,id>=433&&id<=438?mats.porticoPaving:(id===431?mats.soffit:(id===-1?mats.dressedStone:mats.trim)));
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
      col.position.set(tx-originalXs[nearest],0,rowZ-baseZ);portico.add(col);
      addPorticoColumn(THREE,col,shaft,mats);
      cloneDonor(foot,mats.trim,col);cloneDonor(abacus,mats.trim,col);
    });
  }
  if(portico.children.length<17)throw Error('MaxGame donor portico incomplete.');
  // One stepped ceremonial podium binds source portico, high stairs and facade.
  cube('base',0,2.25,29,52.0,4.50,16.9);
  cube('paving',0,4.56,29,52,.27,17.5);
  cube('trim',0,4.75,29,52.5,.13,17.9);
  flush();
  return {front:palace,originalPortico:portico,facadeWidth:224,
    palaceDimensions:{width:224,depth:217,height:64},
    buildings:['Corps de logis','Westfluegel','Ostfluegel','Rueckwaertiger Quertrakt'],
    instancedDrawcalls:batches.size,instancedElements:[...batches.values()].reduce((n,a)=>n+a.length,0)};
}
