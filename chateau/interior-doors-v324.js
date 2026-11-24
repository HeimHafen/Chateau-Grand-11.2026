import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';
import {createOakFinish} from '../wohnzimmer/portal-doors-v2.js';

// A single kit shares geometry and materials between equal-sized doors. All
// measurements are metres. The leaf model is built from actual stiles, rails,
// inset panels and bevelled mouldings, rather than a texture of a door.
export function createInteriorDoorKit(THREE){
 const oak=createOakFinish(THREE,0xb68b64);oak.name='Roissy_Innentuer_Gewachste_Eiche';oak.vertexColors=true;oak.roughness=.63;
 const frame=createOakFinish(THREE,0x98734e);frame.name='Roissy_Innentuer_Eichenzarge';
 const brass=new THREE.MeshStandardMaterial({name:'Roissy_Innentuer_Messing_Patiniert',color:0xb28a50,metalness:.66,roughness:.38});
 const cache=new Map();
 function shape(w,h,cut){const s=new THREE.Shape();s.moveTo(-w/2+cut,-h/2);s.lineTo(w/2-cut,-h/2);s.lineTo(w/2,-h/2+cut);s.lineTo(w/2,h/2-cut);s.lineTo(w/2-cut,h/2);s.lineTo(-w/2+cut,h/2);s.lineTo(-w/2,h/2-cut);s.lineTo(-w/2,-h/2+cut);s.closePath();return s;}
 function geometry(width,height,side,grand){
  const key=[width,height,side,grand].join(':');if(cache.has(key))return cache.get(key);
  const wood=[],metal=[];const cx=-side*width/2,stile=.095,inner=width-2*stile;
  function add(list,g,x,y,z,tint=0xffffff){g.translate(x,y,z);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}if(list===wood){const color=new THREE.Color(tint),p=g.attributes.position,uv=g.attributes.uv;const arr=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){arr.set([color.r,color.g,color.b],i*3);uv.setXY(i,p.getX(i)*1.7,p.getY(i)*.72);}g.setAttribute('color',new THREE.BufferAttribute(arr,3));}list.push(g);}
  const box=(list,x,y,z,w,h,d,tint)=>add(list,new THREE.BoxGeometry(w,h,d),x,y,z,tint);
  function relief(w,h,cut,lip,depth,x,y,z,tint){const s=shape(w,h,cut),hole=shape(w-2*lip,h-2*lip,Math.max(.006,cut-lip*.6));s.holes.push(new THREE.Path(hole.getPoints().reverse()));const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1,steps:1,curveSegments:2});add(wood,g,x,y,z-depth/2,tint);}
  const bottom=.020,top=bottom+height;
  for(const sign of [-1,1])box(wood,cx+sign*(width-stile)/2,bottom+height/2,0,stile,height,.060,0xe7d9c8);
  const bars=[[bottom+.070,.140],[.94,.115],[1.96,.115],[top-.070,.140]];
  for(const [y,h] of bars)box(wood,cx,y,0,inner,h,.060,0xe7d9c8);
  const panels=[[bottom+.140,.94-.0575],[.94+.0575,1.96-.0575],[1.96+.0575,top-.14]];
  for(const [lo,hi] of panels){const h=hi-lo,cy=(lo+hi)/2;
   box(wood,cx,cy,0,inner,h,.040,0xbca68c);
   for(const face of [-1,1]){
    relief(inner-.008,h-.008,grand?.034:.017,.024,.010,cx,cy,face*.027,0xf3e2cf);
    relief(inner-.063,h-.063,grand?.022:.010,.010,.008,cx,cy,face*.035,0xbda78e);
    const g=new THREE.ExtrudeGeometry(shape(inner-.093,h-.093,grand?.020:.010),{depth:.010,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1,steps:1});
    add(wood,g,cx,cy,face*.027-.005,0xd9c6ad);
   }
  }
  // Flexible closing strips hide the central and lower light gaps without rigid interlocking.
  box(wood,-side*(width+.002),bottom+height/2-.0025,side*.001,.0048,height+.005,.024,0x645242);
  box(wood,cx,bottom-.0025,0,width,.005,.024,0x645242);
  // Matching brass lever and escutcheon on both faces, one per leaf.
  const hx=-side*(width-.050);
  for(const face of [-1,1]){
   const plate=new THREE.SphereGeometry(1,12,8);plate.scale(.023,.085,.008);add(metal,plate,hx,1.065,face*.037);
   box(metal,hx,1.09,face*.060,.026,.027,.046);
   box(metal,hx+side*.047,1.09,face*.081,.094,.022,.023);
   const end=new THREE.SphereGeometry(.012,8,6);add(metal,end,hx+side*.094,1.09,face*.081);
   box(metal,hx,1.025,face*.047,.009,.026,.008);
  }
  for(const y of [.23,1.42,2.49]){const g=new THREE.CylinderGeometry(.014,.014,.085,10);add(metal,g,side*.008,y,0);}
  const merged=[mergeGeometries(wood,false),mergeGeometries(metal,false)];for(const g of [...wood,...metal])g.dispose();for(const g of merged){if(!g)throw Error('Interior door merge failed');g.computeBoundingSphere();}cache.set(key,merged);return merged;
 }
 function create(parent,d,grand,swing){
  const root=new THREE.Group();root.name='Roissy_Innentuer_V325';root.position.set(d.axis==='x'?d.at:d.fixed,d.baseY,d.axis==='x'?d.fixed:d.at);root.rotation.y=d.axis==='x'?0:-Math.PI/2;parent.add(root);
  const hingeAt=d.width/2-.048,leafWidth=hingeAt-.004,height=d.clearHeight-.078,leaves=[];
  for(const side of [-1,1]){const hinge=new THREE.Group();hinge.name='Roissy_Kassettenfluegel';hinge.position.x=side*hingeAt;root.add(hinge);const geos=geometry(leafWidth,height,side,grand);for(const [i,m] of [oak,brass].entries()){const mesh=new THREE.Mesh(geos[i],m);mesh.name=i?'Roissy_Innentuer_Beschlaege':'Roissy_Innentuer_Eichenkassetten';mesh.receiveShadow=true;mesh.castShadow=false;hinge.add(mesh);}leaves.push({side,hinge});}
  let angle=0;const local=(x,z)=>d.axis==='x'?[x-d.at,z-d.fixed]:[z-d.at,d.fixed-x];
  function blocked(u,v,r,a){return leaves.some(({side})=>{const dx=u-side*hingeAt,ux=-side*Math.cos(a),uz=swing*Math.sin(a),t=THREE.MathUtils.clamp(dx*ux+v*uz,0,leafWidth);return Math.hypot(dx-t*ux,v-t*uz)<r+.105;});}
  return {root,leaves,swing,leafWidth,hingeAt,get angle(){return angle;},update(dt,x,z,foot){const [u,v]=local(x,z);const same=Math.abs(foot-d.baseY)<.45;const near=same&&Math.abs(u)<(angle>.01?1.6:1.15)&&Math.abs(v)<(angle>.01?3.8:3.05);const goal=near?Math.PI/2:0;let next=angle+THREE.MathUtils.clamp(goal-angle,-dt*1.7,dt*3.6);if(next<angle&&same&&blocked(u,v,.30,next))next=angle;if(next===angle)return false;angle=next;for(const {side,hinge} of leaves)hinge.rotation.y=side*swing*angle;return true;},blocks(x,z,r,foot){if(Math.abs(foot-d.baseY)>.45)return false;const [u,v]=local(x,z);return blocked(u,v,r,angle);}};
 }
 return {create,frame,cache};
}
