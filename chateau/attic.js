import {CORNICE,HALF_D,HALF_W} from './roissy-config.js?v=roissy362';
import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export const ATTIC={
  floor:CORNICE-.055+.025,
  halfWidth:22.8,
  halfDepth:9.8,
  entry:{x:-18,z:0,yaw:-Math.PI/2}
};

export function buildAttic(T,root,deck,materials,roof){
  const {floor,halfWidth:w,halfDepth:d}=ATTIC;
  const group=new T.Group();
  group.name='Roissy_Dachgeschoss_Mansardengalerie';
  root.add(group);
  const {oak,parquet,plaster,stone,iron}=materials;
  const brass=new T.MeshStandardMaterial({name:'Mansarde · patiniertes Messing',color:0xc39855,metalness:.67,roughness:.36});
  const paleOak=oak.clone();
  paleOak.name='Mansarde · geölte Eiche am Fenster';
  paleOak.color.setHex(0xbb936b);
  const insetPanel=plaster.clone();
  insetPanel.name='Mansarde · Leinenfarbener Kalkputz';
  insetPanel.color.setHex(0xded6c8);
  const flame=new T.MeshStandardMaterial({color:0xffe7b8,emissive:0xffad52,emissiveIntensity:2.8});
  const lining=plaster.clone();
  lining.name='Mansarde · heller Kalkputz an der Dachschräge';
  lining.side=T.BackSide;
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
  function beam(from,to,width,depth=width,material=oak){
    const start=new T.Vector3(...from),end=new T.Vector3(...to),delta=end.clone().sub(start);
    const geo=new T.BoxGeometry(width,delta.length(),depth);
    geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));
    geo.translate(...start.lerp(end,.5).toArray());
    add(material,geo);
  }

  // The oak floor is fitted exclusively to the actual load-bearing deck.
  const surface=parquet.clone();
  surface.name='Mansarde · geölte Eichendielen';
  const border=surface.clone();
  border.name='Mansarde · Eichenfries';
  border.color.setHex(0xc5a17b);
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
  for(const frame of windowEdges){
    const sign=Math.sign(frame[0][2]);
    const outward=(point,x,y,z)=>[point[0]+x,point[1]+y,point[2]+sign*z];
    const [left,right,topRight,topLeft]=frame;
    // Keep each profile on the lining side of the opening.
    beam(outward(left,-.019,-.023,0),outward(right,.019,-.023,0),.051,.083,stone);
    beam(outward(left,-.025,0,0),outward(topLeft,-.025,.018,0),.039,.047,paleOak);
    beam(outward(right,.025,0,0),outward(topRight,.025,.018,0),.039,.047,paleOak);
    beam(outward(topRight,.046,.023,0),outward(topLeft,-.046,.023,0),.041,.048,paleOak);
    beam(outward(left,-.065,-.065,-.012),outward(right,.065,-.065,-.012),.022,.049,paleOak);
  }
  for(const side of [-1,1]){
    const wallZ=side*(d+.096);
    box(plaster,0,floor+.39,wallZ,2*w,.78,.19);
    box(stone,0,floor+.061,side*(d+.025),2*w,.12,.22);
    box(oak,0,floor+.792,wallZ,2*w,.064,.29);
    box(stone,0,floor+.740,side*(d-.016),2*w,.020,.082);
    const bay=2*w/20;
    for(let i=0;i<20;i++){
      const x=-w+(i+.5)*bay,faceZ=side*(d-.020);
      box(stone,x,floor+.43,faceZ,bay-.21,.47,.042);
      box(insetPanel,x,floor+.43,side*(d-.044),bay-.36,.338,.014);
      for(const edge of [-1,1])box(oak,x+edge*(bay-.26)/2,floor+.426,side*(d-.067),.011,.365,.018);
      for(const edge of [-1,1]){
        box(oak,x+edge*(bay-.23)/2,floor+.43,side*(d-.048),.026,.49,.035);
        box(oak,x,floor+.43+edge*.233,side*(d-.048),bay-.23,.024,.035);
      }
    }
    // Hipped end walls rise to the roof and have a timber base and head.
    const hipBreak=shoulderZ*(ridge-roofHeight(w,0))/(ridge-shoulder);
    const stations=[-d,-shoulderZ,-hipBreak,hipBreak,shoulderZ,d];
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

  // Transverse oak trusses follow the mansard profile and leave the passage clear.
  const tie=shoulder-.23;
  for(const x of [-21.9,-15.15,-7.05,7.05,15.15,21.9]){
    beam([x,tie,-shoulderZ],[x,tie,shoulderZ],.24,.28);
    for(const side of [-1,1]){
      const jointZ=side*(shoulderZ-.21);
      for(const face of [-1,1]){
        box(iron,x+face*.122,tie-.028,jointZ,.018,.126,.30);
        for(const offset of [-.085,.085])
          box(iron,x+face*.135,tie-.028,jointZ+offset,.012,.035,.035);
      }
    }
    for(const side of [-1,1]){
      beam([x,floor+.79,side*d],[x,roofHeight(x,shoulderZ)-.18,side*shoulderZ],.19);
      const roofZ=side*Math.max(0,(ridge-roofHeight(x,0))*shoulderZ/(ridge-shoulder));
      if(Math.abs(roofZ)>.01)beam([x,roofHeight(x,0)-.18,roofZ],[x,roofHeight(x,0)-.18,0],.19);
      beam([x,roofHeight(x,shoulderZ)-.18,side*shoulderZ],
        [x,roofHeight(x,0)-.18,roofZ],.19);
      beam([x,tie-.11,side*(shoulderZ-.35)],[x,tie+.70,side*(shoulderZ-3.45)],.12);
    }
  }
  // Low-poly lanterns hang from the same timber bays that support the roof.
  const lights=[];
  for(const x of [-15.15,-7.05,7.05,15.15]){
    const y=tie-.57;
    box(iron,x,tie-.21,0,.034,.22,.034);
    box(brass,x,y+.26,0,.35,.09,.35);
    box(brass,x,y-.22,0,.31,.075,.31);
    for(const u of [-.141,.141])for(const v of [-.141,.141])box(iron,x+u,y+.02,v,.023,.48,.023);
    box(flame,x,y-.044,0,.046,.19,.046);
    lights.push({name:'Roissy_Mansardengalerie_Laterne',position:[x,y,0],intensity:28,distance:7.6,color:0xffdbab});
  }
  for(const [material,parts] of batches){
    const geometry=mergeGeometries(parts,false);
    for(const part of parts)part.dispose();
    if(!geometry)throw Error('Dachgeschoss: inkompatible Geometrie für '+material.name);
    geometry.computeBoundingSphere();
    const mesh=new T.Mesh(geometry,material);
    mesh.name='Roissy_Dachgeschoss_'+material.name;
    mesh.castShadow=material!==lining&&material!==flame;
    mesh.receiveShadow=true;
    group.add(mesh);
  }
  return {group,lights,furnitureBounds:[]};
}
