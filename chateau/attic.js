import {CORNICE,HALF_D,HALF_W} from './roissy-config.js?v=roissy363';
import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export const ATTIC={
  floor:CORNICE-.055+.025,
  halfWidth:22.8,
  halfDepth:9.8,
  entry:{x:-17.8,z:-3.4,yaw:-1.36}
};

export function buildAttic(T,root,deck,materials,roof){
  const {floor,halfWidth:w,halfDepth:d}=ATTIC;
  const group=new T.Group();
  group.name='Roissy_Dachgeschoss_Mansardengalerie';
  root.add(group);
  const {oak,parquet,plaster,stone,iron}=materials;
  const brass=new T.MeshStandardMaterial({name:'Mansarde · patiniertes Messing',color:0x876343,metalness:.64,roughness:.40});
  const timber=oak.clone();
  timber.name='Mansarde · handgehobelte Eiche';
  timber.color.setHex(0x9b7450);
  timber.onBeforeCompile=oak.onBeforeCompile;
  timber.customProgramCacheKey=oak.customProgramCacheKey;
  timber.roughness=.73;
  timber.envMapIntensity=.24;
  const paleOak=oak.clone();
  paleOak.name='Mansarde · geölte Eiche am Fenster';
  paleOak.color.setHex(0xc9aa82);
  paleOak.roughness=.66;
  const paintedTrim=plaster.clone();
  paintedTrim.name='Mansarde · lackierte Wandprofile';
  paintedTrim.color.setHex(0xf1e9db);
  paintedTrim.roughness=.80;
  const insetPanel=plaster.clone();
  insetPanel.name='Mansarde · Leinenfarbener Kalkputz';
  insetPanel.color.setHex(0xd3c8b6);
  const flame=new T.MeshStandardMaterial({color:0xffe7b8,emissive:0xffad52,emissiveIntensity:2.8});
  const lining=plaster.clone();
  lining.name='Mansarde · heller Kalkputz an der Dachschräge';
  lining.side=T.BackSide;
  lining.color.setHex(0xf3ebdc);
  lining.normalScale.set(.08,.08);
  const batches=new Map();
  function add(material,geometry){
    if(!batches.has(material))batches.set(material,[]);
    const part=geometry.index?geometry.toNonIndexed():geometry;
    if(part!==geometry)geometry.dispose();
    batches.get(material).push(part);
  }
  function box(material,x,y,z,sx,sy,sz){
    const geo=new T.BoxGeometry(sx,sy,sz);
    geo.translate(x,y,z);
    add(material,geo);
  }
  function beam(from,to,width,depth=width,material=timber){
    const start=new T.Vector3(...from),end=new T.Vector3(...to),delta=end.clone().sub(start);
    const geo=new T.BoxGeometry(width,delta.length(),depth);
    geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));
    geo.translate(...start.lerp(end,.5).toArray());
    // Grain follows the long axis of each piece of timber.
    const uv=geo.attributes.uv, length=Math.hypot(...from.map((value,i)=>to[i]-value));
    for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*length/2.4);
    add(material,geo);
  }

  // The oak floor is fitted exclusively to the actual load-bearing deck.
  const surface=parquet.clone();
  surface.name='Mansarde · geölte Eichendielen';
  surface.roughness=.78;
  surface.roughnessMap=null;
  surface.specularIntensity=.26;
  surface.clearcoat=.018;
  surface.clearcoatRoughness=.82;
  surface.envMapIntensity=.20;
  surface.color.setHex(0xeedcc2);
  const border=surface.clone();
  border.name='Mansarde · Eichenfries';
  border.color.setHex(0xbca17f);
  const floorParts=new Map([[surface,[]],[border,[]]]);
  for(const [x0,x1,z0,z1] of deck){
    const l=Math.max(x0,-w),r=Math.min(x1,w),s=Math.max(z0,-d),n=Math.min(z1,d);
    if(r<=l||n<=s)continue;
    const cuts=[s,...[-d+.38,d-.38].filter(z=>z>s&&z<n),n];
    for(let i=0;i<cuts.length-1;i++){
      const a=cuts[i],b=cuts[i+1],edge=Math.abs((a+b)/2)>d-.38;
      for(const [x,z] of [[l,a],[l,b],[r,a],[r,a],[l,b],[r,b]])
        floorParts.get(edge?border:surface).push(x,floor,z);
    }
  }
  for(const [material,positions] of floorParts){
    const uv=[];
    for(let i=0;i<positions.length;i+=3){
      const x=positions[i],z=positions[i+2];
      uv.push(...(material===border?[z/3.2,-x/2.2]:[x/3.2,z/2.2]));
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geo.computeVertexNormals();
    add(material,geo);
  }

  const {eaves,shoulder,ridge,inset,panels,windowEdges}=roof;
  const shoulderZ=HALF_D-inset;
  function roofHeight(x,z){
    const s=Math.abs(z);
    if(s>shoulderZ)return shoulder-(s-shoulderZ)*(shoulder-eaves)/inset;
    return Math.min(ridge-s*(ridge-shoulder)/shoulderZ,
      ridge-Math.max(0,Math.abs(x)-(HALF_W-7))*(ridge-shoulder)/(7-inset));
  }
  for(const panel of panels){
    const geo=panel.geometry.clone();
    geo.translate(0,-.048,0);
    add(lining,geo);
  }
  const capY=floor+.789;
  const capOuter=HALF_D-inset*(capY+.048-eaves)/(shoulder-eaves)+.03;
  // A fitted horizontal return closes the space between the dressed knee
  // wall and the real sloping roof below the dormer sills.
  for(const side of [-1,1]){
    box(paintedTrim,0,capY-.026,side*(d+capOuter)/2,2*w,.052,capOuter-d);
    box(paleOak,0,capY-.019,side*(d+.013),2*w,.045,.113);
  }
  const windowCasing=paintedTrim.clone();
  windowCasing.name='Mansarde · Laibungsfasche';
  for(const frame of windowEdges){
    const [a,b,c,d]=frame.map(p=>new T.Vector3(...p));
    const across=b.clone().sub(a).normalize(), up=d.clone().sub(a).normalize();
    const inner=[a,b,c,d];
    const outer=inner.map((p,i)=>p.clone().addScaledVector(across,(i===0||i===3)?-.044:.044)
      .addScaledVector(up,i<2?-.044:.044));
    // The casing is applied to the plaster face and stays outside the cutout.
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      const vertices=[inner[i],outer[i],outer[j],inner[i],outer[j],inner[j]];
      if(a.z>0)vertices.reverse();
      const geo=new T.BufferGeometry();
      geo.setAttribute('position',new T.Float32BufferAttribute(vertices.flatMap(p=>[
        p.x,p.y-(inner.includes(p)?.003:.019),p.z
      ]),3));
      geo.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap(p=>[p.x/2,p.y/2]),2));
      geo.computeVertexNormals();
      add(windowCasing,geo);
    }
  }
  for(const side of [-1,1]){
    const wallZ=side*(d+.096);
    box(plaster,0,floor+.39,wallZ,2*w,.78,.19);
    box(stone,0,floor+.061,side*(d+.025),2*w,.12,.22);
    
    box(stone,0,floor+.740,side*(d-.016),2*w,.020,.082);
    const bay=2*w/20;
    for(let i=0;i<20;i++){
      const x=-w+(i+.5)*bay,faceZ=side*(d-.020);
      box(stone,x,floor+.43,faceZ,bay-.21,.47,.042);
      box(insetPanel,x,floor+.43,side*(d-.044),bay-.36,.338,.014);
      for(const edge of [-1,1])box(paintedTrim,x+edge*(bay-.26)/2,floor+.426,side*(d-.067),.011,.365,.018);
      for(const edge of [-1,1]){
        box(paintedTrim,x+edge*(bay-.23)/2,floor+.43,side*(d-.048),.026,.49,.035);
        box(paintedTrim,x,floor+.43+edge*.233,side*(d-.048),bay-.23,.024,.035);
      }
    }
    // Hipped end walls rise to the roof and have a timber base and head.
    const hipBreak=shoulderZ*(ridge-roofHeight(w,0))/(ridge-shoulder);
    const stations=[-capOuter,-shoulderZ,-hipBreak,hipBreak,shoulderZ,capOuter];
    for(let i=0;i<stations.length-1;i++){
      const z0=stations[i],z1=stations[i+1],x=side*w;
      const vertices=[[x,floor,z0],[x,roofHeight(w,z0)-.055,z0],
        [x,roofHeight(w,z1)-.055,z1],[x,floor,z1]];
      if(side>0)vertices.reverse();
      const geo=new T.BufferGeometry();
      const points=[0,1,2,0,2,3].map(index=>vertices[index]);
      geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
      geo.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(([,y,z])=>[z/1.2,y/1.2]),2));
      geo.computeVertexNormals();
      add(plaster,geo);
    }
    box(stone,side*(w-.05),floor+.065,0,.13,.13,2*d);
    const face=side*(w-.024);
    const panelCenters=[-6.5,-3.3,0,3.3,6.5];
    for(const z of panelCenters){
      const width=z===0?3.27:2.86;
      const top=Math.min(floor+2.58,roofHeight(w,Math.abs(z)+width/2)-.27);
      const bottom=floor+.88, height=top-bottom, mid=(bottom+top)/2;
      box(insetPanel,face,mid,z,.036,height,width);
      for(const edge of [-1,1]){
        box(stone,face-side*.027,mid,z+edge*width/2,.050,height+.05,.064);
        box(stone,face-side*.027,mid+edge*height/2,z,.050,.064,width);
        box(paleOak,face-side*.049,mid,z+edge*(width/2-.058),.022,height-.116,.016);
        box(paleOak,face-side*.049,mid+edge*(height/2-.058),z,.022,.016,width-.116);
      }
    }
    box(paleOak,face-side*.035,floor+.745,0,.094,.058,2*d);
    box(stone,face-side*.025,floor+.688,0,.080,.075,2*d);
  }

  // Each principal rafter follows one continuous section. Matching joints
  // share their cross-section, including at the hip and mansard breaks.
  const tie=shoulder-.24;
  const bays=[-22.67,-15.00,-7.05,7.05,15.00,22.67];
  function continuousRafter(x,path){
    const vertices=[],uv=[];
    const offset=[-.092,.092];
    let distance=0;
    for(let i=0;i<path.length-1;i++){
      const [z,y]=path[i],[nextZ,nextY]=path[i+1];
      const end=distance+Math.hypot(nextZ-z,nextY-y);
      const corners=[
        [x+offset[0],y,z],[x+offset[1],y,z],[x+offset[1],y-.235,z],[x+offset[0],y-.235,z],
        [x+offset[0],nextY,nextZ],[x+offset[1],nextY,nextZ],[x+offset[1],nextY-.235,nextZ],[x+offset[0],nextY-.235,nextZ]
      ];
      for(const quad of [[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]]){
        for(const k of [0,2,1,0,3,2]){
          const index=quad[k];
          vertices.push(...corners[index]);
          uv.push(k===0||k===1?0:1,(index<4?distance:end)/2.5);
        }
      }
      distance=end;
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geo.computeVertexNormals();
    add(timber,geo);
  }
  // Light oak purlins cover the true roof-plane joints at both hip ends.
  beam([-(HALF_W-7),ridge-.068,0],[HALF_W-7,ridge-.068,0],.13,.13);
  for(const side of [-1,1])for(const end of [-1,1]) {
    const shoulderX=end*Math.min(w,HALF_W-inset);
    const amount=(Math.abs(shoulderX)-(HALF_W-7))/(7-inset);
    beam([end*(HALF_W-7),ridge-.063,0],
      [shoulderX,ridge-(ridge-shoulder)*amount-.063,side*shoulderZ*amount],.108,.119);
  }
  for(const x of bays){
    const hip=shoulderZ*(ridge-roofHeight(x,0))/(ridge-shoulder);
    const zs=[-capOuter,-shoulderZ,...(hip>.001?[-hip,hip]:[0]),shoulderZ,capOuter];
    continuousRafter(x,zs.map(z=>[z,roofHeight(x,z)-.026]));
    // Rectangular tie beam ends overlap the continuous rafters at the shoulder.
    const tieEnd=shoulderZ+.064;
    beam([x,tie,-tieEnd],[x,tie,tieEnd],.223,.248);
    for(const side of [-1,1]){
      const jointZ=side*(shoulderZ-.17);
      const shoeZ=side*(capOuter-.16);
      box(timber,x,capY-.032,shoeZ,.292,.144,.33);
      box(iron,x,capY+.027,shoeZ,.272,.029,.30);
      for(const face of [-1,1]){
        box(iron,x+face*.116,tie-.010,jointZ,.014,.118,.28);
        for(const offset of [-.079,.079]){
          const bolt=new T.CylinderGeometry(.021,.021,.017,6);
          bolt.rotateZ(Math.PI/2);
          bolt.translate(x+face*.128,tie-.01,jointZ+offset);
          add(brass,bolt);
        }
      }
    }
  }
  // Glazed bronze lanterns on the four middle ties. The light pools stay
  // broad and soft on the matte oak instead of producing bright reflections.
  const glass=new T.MeshPhysicalMaterial({name:'Mansarde · klares Laternenglas',color:0xf2e6d4,
    transparent:true,opacity:.13,depthWrite:false,roughness:.24,side:T.DoubleSide,forceSinglePass:true});
  const lights=[];
  for(const [i,x] of bays.slice(1,-1).entries()){
    const y=tie-.61;
    box(iron,x,tie-.234,0,.024,.24,.024);
    box(brass,x,y+.244,0,.38,.049,.38);
    box(brass,x,y-.209,0,.34,.048,.34);
    box(iron,x,y-.241,0,.224,.028,.224);
    const crown=new T.CylinderGeometry(.094,.209,.14,4);
    crown.rotateY(Math.PI/4);crown.translate(x,y+.327,0);add(brass,crown);
    for(const u of [-.16,.16])for(const v of [-.16,.16])box(iron,x+u,y+.014,v,.021,.44,.021);
    for(const side of [-1,1])for(const axis of ['x','z']){
      const pane=new T.PlaneGeometry(.307,.408);
      if(axis==='x')pane.rotateY(Math.PI/2);
      pane.translate(x+(axis==='x'?side*.157:0),y+.014,axis==='z'?side*.157:0);
      add(glass,pane);
    }
    const candle=new T.CylinderGeometry(.035,.039,.19,12);
    candle.translate(x,y-.089,0);add(paintedTrim,candle);
    const tip=new T.SphereGeometry(1,10,8);
    tip.scale(.025,.051,.025).translate(x,y+.053,0);add(flame,tip);
    lights.push({name:'Roissy_Mansardengalerie_Laterne_'+(i+1),position:[x,y+.02,0],
      intensity:15,distance:9.3,color:0xffdfb7});
  }

  // Existing château artwork and woven textile assets give the long room
  // an end point, while the centre remains a continuous walking axis.
  function texture(file){
    if(typeof document==='undefined')return null;
    const map=new T.TextureLoader().load('./assets/furnishing/'+file+'.jpg');
    map.colorSpace=T.SRGBColorSpace;
    map.anisotropy=4;
    return map;
  }
  const runner=new T.MeshStandardMaterial({name:'Mansarde · Wollteppich der Leseecke',
    map:texture('savonnerie'),color:0xe2d3bd,roughness:.99});
  const carpet=new T.PlaneGeometry(3.8,4.9);
  carpet.rotateX(-Math.PI/2);
  carpet.translate(19.85,floor+.007,1.05);
  add(runner,carpet);
  for(const side of [-1,1]){
    const artwork=new T.MeshStandardMaterial({name:'Mansarde · Landschaftsgemälde '+side,
      color:0xebe0cf,map:texture(side===1?'landscape_1':'landscape_2'),roughness:.83});
    const centreY=floor+1.80,x=side*(w-.10),wide=1.08,tall=1.34;
    const canvas=new T.PlaneGeometry(wide,tall);
    canvas.rotateY(-side*Math.PI/2);
    canvas.translate(x-side*.014,centreY,0);
    add(artwork,canvas);
    for(const sign of [-1,1]){
      box(timber,x,centreY+sign*(tall+.092)/2,0,.058,.092,wide+.184);
      box(timber,x,centreY,sign*(wide+.092)/2,.058,tall,.092);
      box(brass,x-side*.032,centreY+sign*(tall+.018)/2,0,.012,.018,wide+.036);
      box(brass,x-side*.032,centreY,sign*(wide+.018)/2,.012,tall,.018);
    }
  }
  // Shallow joinery at the east end gives the reading area real storage.
  const furnitureBounds=[];
  const backOak=timber.clone();
  backOak.color.setHex(0x805e43);
  backOak.name='Mansarde · Eichenrückwand';
  backOak.onBeforeCompile=timber.onBeforeCompile;
  backOak.customProgramCacheKey=timber.customProgramCacheKey;
  const bookColours=[0x6b3e34,0x526459,0x7b6650,0x3e4d5e,0x53463c]
    .map(color=>new T.MeshStandardMaterial({name:'Mansarde · Buchleder '+color,color,roughness:.86}));
  for(const z of [-2.58,2.58]){
    const x=w-.36,width=1.85,depth=.47;
    box(backOak,x+.205,floor+.80,z,.043,1.52,width);
    box(timber,x,floor+.081,z,depth+.052,.156,width+.06);
    for(const side of [-1,1]){
      box(timber,x,floor+.80,z+side*(width/2-.028),depth,1.44,.057);
      box(timber,x-.244,floor+.80,z+side*(width/2-.038),.039,1.44,.093);
    }
    for(const y of [.20,.63,1.05,1.49]){
      box(timber,x,floor+y,z,depth,.044,width-.086);
      box(paleOak,x-.247,floor+y,z,.035,.030,width-.086);
    }
    box(timber,x-.006,floor+1.544,z,depth+.093,.063,width+.12);
    box(paleOak,x-.014,floor+1.582,z,depth+.111,.023,width+.141);
    for(const [shelf,y] of [.224,.654,1.074].entries()){
      let cursor=z-.76;
      for(let i=0;i<15;i++){
        const thickness=.048+((i*7+shelf*11)%11)*.005;
        const height=.204+((i*11+shelf*7)%13)*.006+((i*5)%7)*.010;
        const position=cursor+thickness/2;
        const face=x-.127+((i*7)%4)*.017;
        box(bookColours[(i+shelf*2)%bookColours.length],face+.095,floor+y+height/2,position,.19,height,thickness);
        for(const fraction of [.18,.79])box(brass,face-.001,floor+y+height*fraction,position,.003,.007,thickness*.79);
        cursor+=thickness+(i%5===4?.077:.01);
      }
    }
    furnitureBounds.push({x0:x-.307,x1:x+.278,z0:z-width/2-.071,z1:z+width/2+.071});
  }
  for(const [material,parts] of batches){
    const geometry=mergeGeometries(parts,false);
    for(const part of parts)part.dispose();
    if(!geometry)throw Error('Dachgeschoss: inkompatible Geometrie für '+material.name);
    geometry.computeBoundingSphere();
    const mesh=new T.Mesh(geometry,material);
    mesh.name='Roissy_Dachgeschoss_'+material.name;
    mesh.castShadow=material!==lining&&material!==flame&&material!==glass&&material!==runner&&material!==windowCasing;
    mesh.receiveShadow=material!==glass&&material!==flame&&material!==windowCasing;
    group.add(mesh);
  }
  return {group,lights,furnitureBounds};
}
