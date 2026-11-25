import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';
import {createOakFinish} from '../wohnzimmer/portal-doors-v2.js';

// All dimensions in metres. Three real moving pairs of leaves, with fixed fanlights.
export function addRoissyPortal(THREE, parent, mats, glass, x, wallZ, width, height, level){
 const main=Math.abs(x)<.01, r=width/2, spring=height-r, inset=.18;
 const root=new THREE.Group();root.name=main?'Roissy_Hauptportal_V321':'Roissy_Seitenportal_V321';
 root.position.set(x,level,wallZ-inset);parent.add(root);
 const oak=createOakFinish(THREE,0x97633b), panel=createOakFinish(THREE,0x80502e), edge=createOakFinish(THREE,0xb07b4a);
 const iron=new THREE.MeshStandardMaterial({name:'Geschmiedetes Eisen',color:0x282725,metalness:.72,roughness:.4});
 const brass=new THREE.MeshStandardMaterial({name:'Patiniertes Messing',color:0xab8348,metalness:.76,roughness:.38});
 const window=glass; // shares the existing reflection map and transparency settings
 const batches=new Map();
 function add(p,mat,geo,px=0,py=0,pz=0){geo.translate(px,py,pz);let b=batches.get(p);if(!b)batches.set(p,b=new Map());if(!b.has(mat))b.set(mat,[]);b.get(mat).push(geo.index?geo.toNonIndexed():geo);}
 const box=(p,m,x,y,z,w,h,d)=>add(p,m,new THREE.BoxGeometry(w,h,d),x,y,z);
 function line(p,m,points,rad=.012){const vs=points.map(a=>new THREE.Vector3(...a));const curve=points.length===2?new THREE.LineCurve3(vs[0],vs[1]):new THREE.CatmullRomCurve3(vs);add(p,m,new THREE.TubeGeometry(curve,points.length===2?1:Math.max(10,points.length-1),rad,6,false));}
 function ellipse(p,m,cx,cy,z,rx,ry,rad=.012,a=0,b=Math.PI*2){const pts=Array.from({length:33},(_,i)=>{const t=a+(b-a)*i/32;return[cx+rx*Math.cos(t),cy+ry*Math.sin(t),z]});line(p,m,pts,rad);}
 function outline(w,h,cut){const s=new THREE.Shape();s.moveTo(-w/2+cut,-h/2);s.lineTo(w/2-cut,-h/2);s.lineTo(w/2,-h/2+cut);s.lineTo(w/2,h/2-cut);s.lineTo(w/2-cut,h/2);s.lineTo(-w/2+cut,h/2);s.lineTo(-w/2,h/2-cut);s.lineTo(-w/2,-h/2+cut);s.closePath();return s;}
 function molding(p,m,cx,cy,z,w,h,cut,lip,depth){const shape=outline(w,h,cut);const hole=outline(w-2*lip,h-2*lip,Math.max(.012,cut-lip*.45));const path=new THREE.Path(hole.getPoints());shape.holes.push(path);const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.006,bevelSize:.005,bevelSegments:2,steps:1});add(p,m,g,cx,cy,z-depth/2);}
 function badge(p,m,x,y,z,w,h,d){const g=new THREE.SphereGeometry(1,14,8);g.scale(w/2,h/2,d/2);add(p,m,g,x,y,z);}
 // Jambs + transom stay fixed. The fanlight occupies the existing semicircle exactly.
 for(const s of [-1,1])box(root,oak,s*(r-.031),spring/2,0,.062,spring,.16);
 box(root,oak,0,spring-.04,0,width-.12,.085,.16);
 const fanR=r-.06, fanZ=0;
 const fanShape=new THREE.Shape();fanShape.moveTo(-fanR,spring);fanShape.lineTo(fanR,spring);fanShape.absarc(0,spring,fanR,0,Math.PI,false);fanShape.closePath();add(root,window,new THREE.ShapeGeometry(fanShape),0,0,fanZ);
 for(const z of [-.037,.037]){
   ellipse(root,oak,0,spring,z,r-.028,r-.028,.036,0,Math.PI);
   ellipse(root,iron,0,spring,z,fanR-.035,fanR-.035,.013,0,Math.PI);
   const hub=fanR*.23;ellipse(root,iron,0,spring,z,hub,hub,.014,0,Math.PI);
   const n=main?8:6;
   for(let j=1;j<n;j++){const a=j*Math.PI/n;line(root,iron,[[hub*Math.cos(a),spring+hub*Math.sin(a),z],[(fanR-.035)*Math.cos(a),spring+(fanR-.035)*Math.sin(a),z]],.013);}
   for(const s of [-1,1]){const pts=[];for(let j=0;j<=25;j++){const t=j/25,ang=t*Math.PI*1.7,rr=fanR*.115*(1-t*.82);pts.push([s*(fanR*.45+rr*Math.cos(ang)),spring+fanR*.29+rr*Math.sin(ang),z]);}line(root,iron,pts,.010);}
 }
 // Fixed rebates on the outside of the inward-opening doors, and a shallow sill.
 for(const side of [-1,1])box(root,oak,side*(r-.104),spring/2,.075,.092,spring,.022);
 box(root,oak,0,spring-.066,.075,width-.124,.076,.022);
 box(root,edge,0,.009,0,width-.124,.018,.16);
 const leafWidth=r-.150, leafH=spring-.105, base=.020, leaves=[];
 for(const side of [-1,1]){
   const hinge=new THREE.Group();hinge.name='Roissy_Eichenfluegel';hinge.position.x=side*(r-.142);root.add(hinge);leaves.push({hinge,side});
   const cx=-side*leafWidth/2, stile=Math.min(.132,leafWidth*.21), iw=leafWidth-2*stile;
   // Three real pin axes with fixed and rotating knuckles, in the existing
   // reveal. Offset avoids the old leaf/jamb interference during opening.
   for(const y of [.25,base+leafH*.5,base+leafH-.25]){
     add(hinge,brass,new THREE.CylinderGeometry(.014,.014,.040,12),0,y,0);
     for(const dy of [-.032,.032]){
       add(root,brass,new THREE.CylinderGeometry(.014,.014,.024,12),hinge.position.x,y+dy,0);
       box(root,brass,hinge.position.x+side*.040,y+dy,0,.080,.026,.008);
     }
     box(hinge,brass,-side*.038,y,0,.076,.03,.008);
   }

   box(hinge,edge,-side*(leafWidth+.004),base+leafH/2-.0025,side*.001,.0088,leafH+.005,.035);
   box(hinge,edge,cx,base-.0025,0,leafWidth,.005,.035);
   const bottom=base+.16, split=base+leafH*.38, top=base+leafH-.16;
   // Actual glazed upper aperture: four structural wooden rails, not an opaque block with glass pasted on it.
   for(const s of [-1,1])box(hinge,oak,cx+s*(leafWidth-stile)/2,base+leafH/2,0,stile,leafH,.12);
   box(hinge,oak,cx,base+.08,0,iw,.16,.12);
   box(hinge,oak,cx,base+leafH-.08,0,iw,.16,.12);
   box(hinge,oak,cx,split,0,iw,.16,.12);
   const lb=bottom,lt=split-.08,gb=split+.08,gt=top;
   box(hinge,panel,cx,(lb+lt)/2,0,iw,lt-lb,.085);
   box(hinge,window,cx,(gb+gt)/2,0,iw,gt-gb,.018);
   for(const face of [-1,1]){
     const z=face*.074;
     // Stepped mouldings on both sides with clipped classical corners and raised central fill.
     for(const [lo,hi] of [[lb,lt],[gb,gt]]){
       molding(hinge,oak,cx,(lo+hi)/2,z,iw+.03,hi-lo+.025,.055,.040,.039);
       molding(hinge,edge,cx,(lo+hi)/2,face*.096,iw-.036,hi-lo-.04,.040,.014,.018);
     }
     const ph=lt-lb-.16,pw=iw-.15,py=(lt+lb)/2;
     const fill=new THREE.ExtrudeGeometry(outline(pw,ph,.06),{depth:.018,bevelEnabled:true,bevelSize:.015,bevelThickness:.012,bevelSegments:3});add(hinge,panel,fill,cx,py,face*.052-.009);
     if(main){ellipse(hinge,edge,cx,py,face*.084,pw*.27,ph*.27,.010);badge(hinge,oak,cx,py,face*.084,pw*.22,ph*.23,.025);}
     // Forged vertical bars and mirrored S-scrolls within the true glazed opening.
     const gy=(gb+gt)/2, gh=gt-gb, gx=iw/2-.075, gz=face*.063;
     for(const s of [-1,0,1])line(hinge,iron,[[cx+s*gx*.72,gb+.052,gz],[cx+s*gx*.72,gt-.052,gz]],.012);
     for(const sy of [-1,1])for(const sx of [-1,1]){
       const pts=[];for(let j=0;j<=30;j++){const t=j/30,ang=t*Math.PI*2.0,rr=1-t*.88;pts.push([cx+sx*(gx*.42+gx*.56*rr*Math.sin(ang)),gy+sy*(gh*.24+gh*.19*rr*Math.cos(ang)),gz]);}line(hinge,iron,pts,.011);
     }
     ellipse(hinge,iron,cx,gy,gz,gx*.83,Math.min(.17,gh*.17),.012);
     badge(hinge,brass,cx,gy,gz,.043,.055,.035);
     const hx=-side*(leafWidth-stile*.5),hy=1.09;
     badge(hinge,brass,hx,hy,face*.075,.065,.21,.034);
     for(const y of [hy-.085,hy+.085])badge(hinge,brass,hx,y,face*.103,.035,.035,.045);
     ellipse(hinge,brass,hx,hy,face*.127,.028,.084,.014,Math.PI*.1,Math.PI*1.9);
     badge(hinge,iron,hx,hy-.14,face*.083,.019,.037,.009);
   }
 }
 for(const [p,groups] of batches)for(const [mat,geos] of groups){const geo=mergeGeometries(geos,false);if(!geo)throw Error('Roissy portal geometry merge');geo.computeBoundingSphere();const mesh=new THREE.Mesh(geo,mat);mesh.name='Roissy_Portal_'+(mat===window?'Glas':mat===iron?'Schmiedeeisen':mat===brass?'Messing':'Eiche');mesh.castShadow=mat!==window;mesh.receiveShadow=true;p.add(mesh);for(const g of geos)g.dispose();}
 let angle=0,open=false;
 return {root,leaves,width,height,spring,update(dt,px,pz,py=0){
   open=Math.abs(py-level)<1&&Math.abs(px-x)<(open?1.6:1.25)&&Math.abs(pz-root.position.z)<(open?6.35:5.7);
   const target=open?Math.PI/2:0;let next=angle+THREE.MathUtils.clamp(target-angle,-dt*1.9,dt*2.2);
   if(next<angle&&Math.abs(py-level)<1&&leaves.some(({hinge,side})=>{const dx=px-x-hinge.position.x,dz=pz-root.position.z,ux=-side*Math.cos(next),uz=-Math.sin(next),along=THREE.MathUtils.clamp(dx*ux+dz*uz,0,leafWidth);return Math.hypot(dx-along*ux,dz-along*uz)<.45;}))next=angle;
   if(next===angle)return false;angle=next;for(const {hinge,side} of leaves)hinge.rotation.y=-side*angle;return true;
 },blocks(px,pz,radius,py=0){if(Math.abs(py-level)>1)return false;return leaves.some(({hinge,side})=>{const dx=px-x-hinge.position.x,dz=pz-root.position.z,ux=-side*Math.cos(angle),uz=-Math.sin(angle),along=THREE.MathUtils.clamp(dx*ux+dz*uz,0,leafWidth);return Math.hypot(dx-along*ux,dz-along*uz)<radius+.15;});}};
}
