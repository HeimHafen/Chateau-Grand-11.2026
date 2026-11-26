import {CORNICE,HALF_D,HALF_W} from './roissy-config.js?v=roissy358';
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
  function beam(from,to,width,depth=width){
    const start=new T.Vector3(...from),end=new T.Vector3(...to),delta=end.clone().sub(start);
    const geo=new T.BoxGeometry(width,delta.length(),depth);
    geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));
    geo.translate(...start.lerp(end,.5).toArray());
    add(oak,geo);
  }

  // The oak floor is fitted exclusively to the actual load-bearing deck.
  const surface=parquet.clone();
  surface.name='Mansarde · geölte Eichendielen';
  const boardPositions=[],boardUVs=[];
  for(const [x0,x1,z0,z1] of deck){
    const l=Math.max(x0,-w),r=Math.min(x1,w),s=Math.max(z0,-d),n=Math.min(z1,d);
    if(r<=l||n<=s)continue;
    for(const [x,z] of [[l,s],[l,n],[r,s],[r,s],[l,n],[r,n]]){
      boardPositions.push(x,floor,z);
      boardUVs.push(x/3.2,z/2.2);
    }
  }
  const boards=new T.BufferGeometry();
  boards.setAttribute('position',new T.Float32BufferAttribute(boardPositions,3));
  boards.setAttribute('uv',new T.Float32BufferAttribute(boardUVs,2));
  boards.computeVertexNormals();
  add(surface,boards);

  const {eaves,shoulder,ridge,inset,panels}=roof;
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
      box(plaster,x,floor+.43,side*(d-.044),bay-.36,.338,.014);
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
  }

  // Transverse oak trusses follow the mansard profile and leave the passage clear.
  const tie=shoulder-.23;
  for(const x of [-21.9,-15.15,-7.05,7.05,15.15,21.9]){
    beam([x,tie,-shoulderZ],[x,tie,shoulderZ],.24,.28);
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
    lights.push({name:'Roissy_Mansardengalerie_Laterne',position:[x,y,0],intensity:34,distance:6.2,color:0xffdbab});
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
  return {group,lights};
}
