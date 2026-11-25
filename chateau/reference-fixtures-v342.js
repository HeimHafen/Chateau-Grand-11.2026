import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';
// Small, physically modelled brass/crystal fixtures inspired by the user's reference.
// Geometry is batched by material; no external models or photographic overlays.
export function installReferenceFixtures(T,root,layers,stair,EG,OG,CORNICE,wallAssignments){
 const brass=new T.MeshStandardMaterial({color:0xb9944f,metalness:.72,roughness:.31});
 const crystal=new T.MeshPhysicalMaterial({color:0xf4f0e5,metalness:.12,roughness:.13,clearcoat:.8,clearcoatRoughness:.1,transparent:true,opacity:.73,depthWrite:false});
 const candle=new T.MeshStandardMaterial({color:0xfff5dc,roughness:.8});
 const flame=new T.MeshStandardMaterial({color:0xffdf9e,emissive:0xffbc65,emissiveIntensity:2.4,roughness:.45});
 let count=0;const fixtures=[];
 function make(parent,name,centre,build,rot=0){const group=new T.Group();group.name=name;group.position.set(...centre);group.rotation.y=rot;const parts=new Map();
  const add=(m,g,x=0,y=0,z=0)=>{g.translate(x,y,z);if(g.index){const q=g.toNonIndexed();g.dispose();g=q;}if(!parts.has(m))parts.set(m,[]);parts.get(m).push(g);};
  const tube=(m,pts,r=.012)=>{add(m,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),Math.max(10,pts.length*3),r,6,false));};
  const ring=(m,r,y,t=.009)=>{const g=new T.TorusGeometry(r,t,7,48);g.rotateX(Math.PI/2);add(m,g,0,y,0);};
  const gem=(x,y,z,r=.028,h=.085)=>{const g=new T.OctahedronGeometry(1,0);g.scale(r,h/2,r);add(crystal,g,x,y,z);};
  const wax=(x,y,z,h=.12)=>{add(brass,new T.CylinderGeometry(.037,.024,.022,12),x,y-.011,z);add(candle,new T.CylinderGeometry(.018,.020,h,10),x,y+h/2,z);const g=new T.SphereGeometry(1,8,6);g.scale(.014,.036,.014);add(flame,g,x,y+h+.024,z);};
  build({add,tube,ring,gem,wax});for(const [m,gs] of parts){const geo=mergeGeometries(gs,false);for(const g of gs)g.dispose();if(!geo)throw Error('fixture merge');const mesh=new T.Mesh(geo,m);mesh.name=name+'_'+(m===brass?'Messing':m===crystal?'Kristall':m===flame?'Flammen':'Kerzen');mesh.receiveShadow=true;mesh.castShadow=false;group.add(mesh);}parent.add(group);count++;return group;
 }
 function chandelier(parent,name,x,z,ceiling,h,r){const g=make(parent,name,[x,ceiling,z],({add,tube,ring,gem,wax})=>{
  add(brass,new T.CylinderGeometry(.12,.15,.035,24),0,-.018,0);add(brass,new T.CylinderGeometry(.014,.014,h*.23,10),0,-h*.13,0);
  add(brass,new T.CylinderGeometry(.045,.045,h*.49,16),0,-h*.51,0);ring(brass,r*.30,-h*.35,.017);ring(brass,r*.70,-h*.70,.015);ring(brass,r*.52,-h*.89,.013);
  for(let i=0;i<12;i++){const a=i*Math.PI/6,c=Math.cos(a),s=Math.sin(a),rad=t=>[c*t,s*t];
   tube(brass,[[c*r*.15,-h*.59,s*r*.15],[c*r*.55,-h*.84,s*r*.55],[c*r*.94,-h*.74,s*r*.94],[c*r,-h*.56,s*r]],.014);wax(c*r,-h*.56,s*r,.11);
   for(let j=0;j<7;j++){const t=j/6,rr=r*(.20+.50*t);gem(c*rr,-h*(.29+.43*t),s*rr,.019,.045);}
   for(let j=0;j<4;j++){const t=j/3,rr=r*(.68-.32*t);gem(c*rr,-h*(.73+.19*t),s*rr,.023,.070);}
   gem(c*r*.69,-h*.84,s*r*.69,.029,.105);
  }
  gem(0,-h*.98,0,.064,.13);
 });fixtures.push({name,x,z,ceiling,bottom:ceiling-h-.065,radius:r});return g;}
 // The actual intermediate landing is too low for the reference-sized light.
 // Hang the lower chandelier in the adjoining garden-side antechamber instead.
 chandelier(layers.eg,'Roissy_Kristallleuchter_Gartenantichambre',-9.98,-5.0,OG-.252,1.05,.52);
 // Upper stair hall: high above all traversable surfaces.
 chandelier(layers.og,'Roissy_Kristallleuchter_GrandEscalier',-9.98,3.65,CORNICE-.40,1.17,.59);
 const used=[];for(const w of wallAssignments){if(w.floor!=='eg'||w.room!=='Grand escalier'||w.high-w.low<3.5||w.to-w.from<1.5)continue;const at=(w.from+w.to)/2,face=w.fixed+w.side*(w.edge+.035);const x=w.axis==='x'?at:face,z=w.axis==='x'?face:at;
  if(used.some(q=>Math.hypot(x-q[0],z-q[1])<2.3)||used.length>=4)continue;
  // Only wall-mounted above standing eye level, never in a portal.
  used.push([x,z]);make(layers.eg,'Roissy_Messing_Wandleuchter',[x,EG+2.75,z],({add,tube,gem,wax})=>{
    const g=new T.SphereGeometry(1,16,10);g.scale(.105,.23,.034);add(brass,g);for(const sign of [-1,1]){tube(brass,[[0,-.13,.025],[sign*.12,-.20,.09],[sign*.19,-.08,.17],[sign*.19,.07,.19]],.013);wax(sign*.19,.07,.19,.12);gem(sign*.19,-.15,.19,.023,.075);}
  },w.axis==='x'?(w.side>0?0:Math.PI):(w.side>0?Math.PI/2:-Math.PI/2));}
 return {count,fixtures,sconces:used.length};
}
