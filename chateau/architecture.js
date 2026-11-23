// Château Grand 2027 · Erste MaxGame-Integration
// Real existing Herrenhaus asset supplies the sculpted original entrance portico.
// Only the ceremonial main frontage is advanced; rear ranges remain work-in-progress blocks.
import {addPorticoColumn} from '../wohnzimmer/portico-columns-v2.js';

export function buildChateau(THREE, scene, donor, mats, glass){
  const walls=[];
  const hall=new THREE.Group();hall.name='Chateau_Grand_MaxGame_Front';scene.add(hall);
  const boxG=new THREE.BoxGeometry(1,1,1);
  const add=(name,x,y,z,w,h,d,material,group=hall,cast=true)=>{
    const mesh=new THREE.Mesh(boxG,material);
    mesh.name=name;mesh.position.set(x,y,z);mesh.scale.set(w,h,d);
    mesh.castShadow=cast;mesh.receiveShadow=true;group.add(mesh);
    return mesh;
  };
  function wallX(lo,hi,bottom,top,z,mat=mats.facadeWall){
    if(hi-lo<=.008||top-bottom<=.008)return;
    add('Kalksteinmauer_Front', (lo+hi)/2,(bottom+top)/2,z,hi-lo,top-bottom,.64,mat);
  }
  function windowFrame(x,bottom,z,level,wide=false){
    const w=wide?2.65:2.38,h=level===0?2.92:3.06,top=bottom+h;
    // The opening is physically left out of the wall mesh. Opaque glazing back-plane
    // is a dark interior material, thin transparent glass in front of it.
    add('Dunkler_Leibungsgrund',x,bottom+h/2,z-.13,w-.09,h-.05,.025,mats.deepJoint,hall,false);
    add('MaxGame_Realglas',x,bottom+h/2,z+.03,w-.15,h-.14,.038,glass,hall,false);
    for(let sign of [-1,1]){
      add('Profilierte_Fensterlaibung',x+sign*(w/2+.08),bottom+h/2,z+.28,.19,h+.31,.48,mats.windowStone);
      add('Seitliches_Steinprofil',x+sign*(w/2+.20),bottom+h/2,z+.42,.075,h+.22,.21,mats.trim);
    }
    add('Fensterbank',x,bottom-.10,z+.38,w+.62,.18,.76,mats.windowStone);
    add('Fenstersturz',x,top+.12,z+.32,w+.62,.20,.65,mats.trim);
    add('Gesims_ueber_Fenster',x,top+.28,z+.36,w+.79,.10,.73,mats.windowStone);
    add('Mittelsprosse',x,bottom+h/2,z+.11,.070,h-.09,.11,mats.paintedSash);
    for(let yy of [.34,.68])add('Fensterquersteg',x,bottom+h*yy,z+.13,w-.15,.055,.12,mats.paintedSash);
    if(level===1){
      add('Fensterverdachung',x,top+.45,z+.45,w+.85,.12,.70,mats.trim);
      for(let s of [-1,1])add('Konsolstein',x+s*(w/2+.18),top+.22,z+.37,.19,.35,.37,mats.windowStone);
    }
  }
  function door(x,z){
    const y=.10,h=3.68,w=2.92;
    const wood=new THREE.MeshStandardMaterial({name:'MaxGame_Eiche',color:0x51321f,roughness:.70,metalness:0});
    const woodCarve=new THREE.MeshStandardMaterial({name:'MaxGame_Eichenprofil',color:0x8a5a31,roughness:.71});
    add('Zweifluegelige_Eichentuer',x,y+h/2,z-.05,w-.14,h-.08,.19,wood);
    for(let side of [-1,1]){
      const dx=x+side*.73;
      for(let k=0;k<3;k++){
        const yy=y+.67+1.09*k;
        add('Eiche_Kassettensteg',dx,yy,z+.08,1.07,.085,.075,woodCarve);
        for(let s of [-1,1])add('Eiche_Kassettenkante',dx+s*.48,yy,z+.08,.065,.78,.075,woodCarve);
      }
      const knob=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),mats.brass);
      knob.position.set(x+side*.12,2.03,z+.12);hall.add(knob);
    }
    for(let side of [-1,1])add('Eingangsgewande',x+side*(w/2+.16),2.05,z+.30,.37,4.19,.57,mats.dressedStone);
    add('Sturzprofil_Eingang',x,3.92,z+.32,w+.71,.26,.72,mats.windowStone);
    add('Gesims_Eingang',x,4.13,z+.37,w+.93,.13,.79,mats.trim);
  }
  // 94 m main front; three full storeys: original Herrenhaus source proportions retained.
  // Window openings are physically partitioned into piers, sills and heads.
  const xOuter=[-42,-36,-30,-24,-18,-12,12,18,24,30,36,42];
  const xCentral=[-6,0,6];
  const z=11.80, levels=[0,4.5,9.0];
  for(let level=0;level<3;level++){
    const y=levels[level],top=y+4.5;
    const bays=[...xOuter,...xCentral].sort((a,b)=>a-b);
    let cursor=-47;
    for(const x of bays){
      const isDoor=level===0&&xCentral.includes(x);
      const w=isDoor?3.05:2.60, left=x-w/2,right=x+w/2;
      wallX(cursor,left,y,top,z);
      const sill=isDoor?0:.71;
      const openH=isDoor?3.76:level===0?2.97:3.10;
      if(sill>0)wallX(left,right,y,y+sill,z);
      if(y+sill+openH<top)wallX(left,right,y+sill+openH,top,z);
      if(isDoor)door(x,z+.13);else windowFrame(x,y+sill,z+.13,level,level===1&&Math.abs(x)<10);
      cursor=right;
    }
    wallX(cursor,47,y,top,z);
  }
  // Three-dimensional framing and binding cornice, exactly aligned to the storey joints.
  for(const y of [0.37,4.47,8.96,13.44]){
    add('Durchgehendes_Fassadengesims',0,y,z+.40,94.55,.23,.96,mats.trim);
    add('Gesimsprofil',0,y+.19,z+.51,94.70,.105,.72,mats.windowStone);
  }
  for(const x of [-46.65,-39.00,-27.00,-15.00,15.00,27.00,39.00,46.65]){
    add('Steinpilaster',x,7.2,z+.38,.53,12.7,.64,mats.dressedStone);
    for(const y of [.64,4.55,9.0,13.10])add('Pilasterkapitell',x,y,z+.51,.78,.26,.75,mats.trim);
  }
  // Grounded stone basement/coping with stepped profiles.
  add('Steinsockel',0,.30,z+.33,94.7,.59,.83,mats.shade);
  add('Sockelkante',0,.67,z+.41,94.8,.16,.95,mats.windowStone);
  // Main eave above full façade, behind donor gable.
  add('Haupttraufe',0,13.59,z+.32,95,.30,1.15,mats.trim);

  // Side and rear massing are placeholders for following single-area iterations.
  const rear=-18.0;
  add('Hauptbau_Kellerplatte',0,-.3,(z+rear)/2,94,.60,z-rear,mats.shade);
  for(const sx of [-1,1]){
    add('Rueckwaertiger_Seitenbau_Wand',sx*36.1,6.72,-36.2,20.0,13.44,36.4,mats.facadeWall);
    add('Seitenwand_Hauptbau',sx*47,6.72,(rear+z)/2,.64,13.44,z-rear,mats.facadeWall);
  }
  add('Rueckseite_Hauptbau',0,6.72,rear,94,13.44,.64,mats.facadeWall);
  add('Quertrakt_unfertig',0,6.72,-57,94,13.44,15.0,mats.facadeWall);
  // Site-centred front architecture is modelled at high detail; simple slate roofs retained as context.
  function roof(cx,cz,w,d,base,ridge,inset=6){
    const mat=mats.roof.clone();mat.side=THREE.DoubleSide;
    const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
    const a=[x0,base,z0],b=[x1,base,z0],c=[x1,base,z1],e=[x0,base,z1];
    const f=[x0+inset,ridge,cz],g=[x1-inset,ridge,cz];
    const verts=[a,b,g,f, e,f,g,c, a,f,e, b,c,g];
    const faces=[[0,1,2],[0,2,3],[4,5,6],[4,6,7],[8,9,10],[11,12,13]];
    const pos=[];for(const face of faces)for(const i of face)pos.push(...verts[i]);
    const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geom.computeVertexNormals();
    const mesh=new THREE.Mesh(geom,mat);mesh.name='Schieferdach_Kontext';mesh.castShadow=mesh.receiveShadow=true;hall.add(mesh);
  }
  roof(0,(z+rear)/2,94,z-rear,13.65,17.60,5);
  roof(-36,-36.2,20,36.4,13.65,17.7,5);
  roof(36,-36.2,20,36.4,13.65,17.7,5);
  roof(0,-57,94,15,13.65,17.8,5);
  // Reuse the ACTUAL donor Herrenhaus portico meshes and parametric fluted columns.
  // The original Giebel, entablature, stair geometry, capitals and base meshes are not approximations.
  donor.updateMatrixWorld(true);
  const portico=new THREE.Group();portico.name='ORIGINAL_MAXGAME_HERRENHAUS_PORTIKUS';hall.add(portico);
  for(const name of ['Giebel',...Array.from({length:10},(_,i)=>'Cube'+(431+i))]){
    const obj=donor.getObjectByName(name);if(!obj||!obj.isMesh)continue;
    const part=obj.clone(false);
    obj.matrixWorld.decompose(part.position,part.quaternion,part.scale);
    const id=name==='Giebel'?-1:Number(name.slice(4));
    part.material=id>=433&&id<=438?mats.porticoPaving:(id===431?mats.soffit:(id===-1?mats.dressedStone:mats.trim));
    part.castShadow=part.receiveShadow=true;portico.add(part);
  }
  const beam=donor.getObjectByName('Cube431');
  if(!beam)throw Error('Original MaxGame Portikus fehlt: Cube431');
  const beamBox=new THREE.Box3().setFromObject(beam,true);
  const shafts=['Cone001','Cone007','Cone010','Cone013'];
  for(let i=0;i<4;i++){
    const base=donor.getObjectByName('Cube'+[419,423,425,427][i]);
    const abacus=donor.getObjectByName('Cube'+[420,424,426,428][i]);
    const shaft=donor.getObjectByName(shafts[i]);
    if(!base||!abacus||!shaft)throw Error('Original MaxGame-Saeule fehlt: '+i);
    const frontZ=new THREE.Box3().setFromObject(base,true).getCenter(new THREE.Vector3()).z;
    const rearZ=beamBox.min.z+beamBox.max.z-frontZ;
    for(const zPos of [frontZ,rearZ]){
      const col=new THREE.Group();col.name='MaxGame_original_kannelierte_Saeule';col.position.z=zPos-frontZ;portico.add(col);
      addPorticoColumn(THREE,col,shaft,mats);
      for(const obj of [base,abacus]){
        const part=obj.clone(false);obj.matrixWorld.decompose(part.position,part.quaternion,part.scale);
        part.material=mats.trim;part.castShadow=part.receiveShadow=true;col.add(part);
      }
    }
  }
  // Shared MaxGame original terrace sits at y=0..0.86. Extend entry walk with fitted limestone steps.
  for(let i=0;i<5;i++){
    const h=.86*(5-i)/6;add('Historische_Eingangsstufe',0,h/2,19.0+i*.32,17.0,h,.33,mats.porticoPaving);
  }
  return {front:hall,originalPortico:portico,facadeWidth:94,buildings:['Hauptbau','Seitenfluegel','Quertrakt']};
}
