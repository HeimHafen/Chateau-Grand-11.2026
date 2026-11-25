import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';
// V3.46: French gilt bronze and cut crystal; shared static meshes, real mount axes.
export function installReferenceFixtures(T,root,layers,stair,EG,OG,CORNICE,wallAssignments){
 const brass=new T.MeshStandardMaterial({name:'Roissy_V345_Ormolu',color:0xc39a50,metalness:.78,roughness:.27});
 const darkBrass=new T.MeshStandardMaterial({name:'Roissy_V345_Patine',color:0x79552a,metalness:.75,roughness:.37});
 const crystal=new T.MeshPhysicalMaterial({name:'Roissy_V345_Facettierter_Kristall',color:0xfff8e9,roughness:.105,metalness:.12,ior:1.52,clearcoat:1,clearcoatRoughness:.06,transparent:true,opacity:.86,depthWrite:false});
 const candle=new T.MeshStandardMaterial({color:0xfff0d6,roughness:.69});
 const flame=new T.MeshStandardMaterial({color:0xffe4b8,emissive:0xffbd65,emissiveIntensity:3.3,roughness:.4});
 const wick=new T.MeshStandardMaterial({color:0x362821,roughness:.95});
 let count=0;const fixtures=[],sconces=[],lights=[];
 function make(parent,name,centre,build,rot=0){const group=new T.Group();group.name=name;group.position.set(...centre);group.rotation.y=rot;const parts=new Map();
  const add=(m,g,x=0,y=0,z=0)=>{g.translate(x,y,z);if(g.index){const q=g.toNonIndexed();g.dispose();g=q;}if(!parts.has(m))parts.set(m,[]);parts.get(m).push(g);};
  const tube=(m,pts,r=.012)=>{add(m,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),Math.max(12,pts.length*4),r,7,false));};
  const ring=(m,r,y,t=.009)=>{const g=new T.TorusGeometry(r,t,8,56);g.rotateX(Math.PI/2);add(m,g,0,y,0);};
  const lathe=(m,profile,x,y,z,n=24)=>add(m,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),n),x,y,z);
  const gem=(x,y,z,r=.028,h=.085)=>{const g=new T.LatheGeometry([[0,-h*.5],[r*.55,-h*.30],[r,-h*.06],[r*.64,h*.30],[0,h*.5]].map(p=>new T.Vector2(...p)),6);g.computeVertexNormals();const q=g.toNonIndexed();g.dispose();q.computeVertexNormals();add(crystal,q,x,y,z);};
  const wax=(x,y,z,h=.13)=>{lathe(brass,[[.021,-.034],[.047,-.027],[.054,-.012],[.045,0],[.024,.008]],x,y,z);lathe(candle,[[.021,0],[.023,.012],[.020,h-.007],[.015,h]],x,y,z,14);add(wick,new T.CylinderGeometry(.003,.003,.012,6),x,y+h,z);const g=new T.SphereGeometry(1,10,8);g.scale(.013,.035,.013);add(flame,g,x,y+h+.028,z);};
  const bead=(x,y,z,r=.013)=>gem(x,y,z,r,r*2.3);
  const chain=(points,r=.014)=>{for(let i=0;i<points.length;i++){const p=points[i];bead(...p,r);}};
  build({add,tube,ring,gem,wax,lathe,chain});let triangles=0;
  for(const [m,gs] of parts){const geo=mergeGeometries(gs,false);for(const g of gs)g.dispose();if(!geo)throw Error('fixture merge');const mesh=new T.Mesh(geo,m);mesh.name=name+'_'+m.name;mesh.receiveShadow=true;mesh.castShadow=false;group.add(mesh);triangles+=geo.attributes.position.count/3;}
  parent.add(group);group.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(group);count++;return {group,bounds,triangles};
 }
 function chandelier(parent,name,x,z,ceiling,h,r,arms){const upper=Math.round(arms/2);const result=make(parent,name,[x,ceiling,z],({add,tube,ring,gem,wax,lathe,chain})=>{
   // Solid canopy touches the rosette. Turned stem, chain links and basket crown.
   lathe(brass,[[.055,-.105],[.08,-.075],[.15,-.046],[.155,-.024],[.132,.015],[0,.015]],0,0,0);
   for(let i=0;i<7;i++){const g=new T.TorusGeometry(.025,.005,7,16);g.scale(1,1.55,1);if(i%2)g.rotateY(Math.PI/2);add(brass,g,0,-.12-i*.055,0);}
   lathe(brass,[[.016,-h*.70],[.072,-h*.68],[.11,-h*.60],[.042,-h*.51],[.065,-h*.39],[.038,-h*.29],[.09,-h*.25],[.018,-h*.20]],0,0,0);
   for(const [rr,y,t] of [[.22,.29,.017],[.37,.43,.012],[.73,.72,.018],[.68,.77,.013],[.48,.90,.014],[.16,.97,.012]])ring(brass,r*rr,-h*y,t);
   for(let i=0;i<arms;i++){const a=i*2*Math.PI/arms,c=Math.cos(a),s=Math.sin(a),p=(rr,y)=>[c*r*rr,-h*y,s*r*rr];
     tube(brass,[p(.12,.57),p(.36,.70),p(.70,.80),p(.95,.70),p(1,.55)],.014);
     tube(darkBrass,[p(.34,.70),p(.60,.66),p(.74,.63),p(.80,.68),p(.70,.72)],.009);
     wax(...p(1,.55),.13);
     // Connected strings of faceted beads form the French tent-and-basket profile.
     const strand=[];for(let j=0;j<=15;j++){const t=j/15;strand.push(p(.22+.51*Math.pow(t,.88),.29+.43*t));}chain(strand,.018);
     const swag=[];for(let j=0;j<=9;j++){const t=j/9,b=a+2*Math.PI/arms*t,rr=r*(.98-.06*Math.sin(Math.PI*t));swag.push([Math.cos(b)*rr,-h*(.64+.10*Math.sin(Math.PI*t)),Math.sin(b)*rr]);}chain(swag,.013);
     for(let j=0;j<8;j++){const t=j/7;gem(...p(.71-.51*t,.75+.20*t),.022,.054);}
     gem(...p(.97,.70),.030,.126);gem(...p(.78,.84),.028,.12);gem(...p(.51,.94),.026,.104);
   }
   for(let i=0;i<upper;i++){const a=(i+.5)*2*Math.PI/upper,c=Math.cos(a),s=Math.sin(a),p=(rr,y)=>[c*r*rr,-h*y,s*r*rr];tube(brass,[p(.12,.36),p(.38,.49),p(.59,.45),p(.63,.34)],.011);wax(...p(.63,.34),.11);gem(...p(.58,.53),.025,.095);}
   gem(0,-h*.99,0,.065,.15);
 });const {bounds,triangles}=result;fixtures.push({name,x,z,ceiling,bottom:bounds.min.y,radius:r,candles:arms+upper,triangles,bounds:[bounds.min.toArray(),bounds.max.toArray()]});lights.push({name,position:[x,ceiling-h*.55,z],intensity:name.includes('UnterGalerie')?45:58,distance:6.8,color:0xffdfb3});}
 chandelier(layers.eg,'Roissy_Kristallleuchter_UnterGalerie',-11.49,9.90,OG-.2515,1.65,.78,18);
 // Match the existing upper central stucco rosette exactly.
 chandelier(layers.og,'Roissy_Kristallleuchter_GrandEscalier',(-12.65-7.20)/2,(-1.60+8.20)/2,CORNICE-.283-.045,1.72,.84,20);
 // Explicitly selected full-height wall fields, not the first four arbitrary matches.
 const sites=[
  {f:'eg',axis:'x',fixed:11.5,at:-10.2,y:EG+2.82},
  {f:'eg',axis:'z',fixed:-13.2102,at:7.9,y:EG+2.92},
  {f:'eg',axis:'z',fixed:-6.75,at:3.25,y:EG+2.72},
  {f:'eg',axis:'z',fixed:-6.75,at:9.87,y:EG+2.82},
  {f:'og',axis:'x',fixed:11.5,at:-10.2,y:OG+2.64},
  {f:'og',axis:'z',fixed:-13.2102,at:7.90,y:OG+2.66},
  {f:'og',axis:'z',fixed:-6.75,at:7.40,y:OG+2.66}
 ];
 for(const site of sites){const w=wallAssignments.find(w=>w.floor===site.f&&w.room==='Grand escalier'&&w.axis===site.axis&&Math.abs(w.fixed-site.fixed)<.001&&w.from+.32<site.at&&w.to-.32>site.at&&w.low<site.y-.43&&w.high>site.y+.46);if(!w)throw Error('no solid wall for sconce '+JSON.stringify(site));
   const a=w.from+.22,b=w.to-.22,n=Math.max(1,Math.round((b-a)/2.2)),bay=(b-a)/n,at=a+(Math.max(0,Math.min(n-1,Math.floor((site.at-a)/bay)))+.5)*bay;
   const face=w.fixed+w.side*(w.edge+.031),x=w.axis==='x'?at:face,z=w.axis==='x'?face:at,rot=w.axis==='x'?(w.side>0?0:Math.PI):(w.side>0?Math.PI/2:-Math.PI/2),name='Roissy_Messing_Wandleuchter_'+site.f+'_'+(sconces.length+1);
   const result=make(layers[site.f],name,[x,site.y,z],({add,tube,gem,wax,lathe})=>{
     // Oval cast backplate, beaded rim, acanthus leaves and three curved arms.
     const plate=new T.SphereGeometry(1,20,12);plate.scale(.098,.235,.025);add(darkBrass,plate,0,0,.017);
     const rim=new T.TorusGeometry(1,.035,7,36);rim.scale(.098,.228,.23);add(brass,rim,0,0,.028);
     for(let i=0;i<7;i++)for(const sign of [-1,1]){const a=i/6*Math.PI,leaf=new T.SphereGeometry(1,10,6);leaf.scale(.022,.066,.012);leaf.rotateZ(sign*(.3+.42*Math.sin(a)));add(brass,leaf,sign*.075*Math.sin(a),-.14+.29*i/6,.039);}
     for(const sign of [-1,0,1]){const xx=sign*.205,zz=sign===0?.27:.22,yy=sign===0?.19:.075;
      tube(brass,[[0,-.15,.041],[xx*.45,-.20,.12],[xx,-.10,zz],[xx,yy,zz]],.014);
      tube(darkBrass,[[xx*.24,-.145,.085],[xx*.75,-.11,zz*.8],[xx*.84,-.04,zz*.9]],.008);
      wax(xx,yy,zz,.12);gem(xx,yy-.125,zz,.026,.101);gem(xx,yy-.068,zz,.015,.039);
     }
     gem(0,-.29,.075,.023,.11);
   },rot);
   const normal=[Math.sin(rot),0,Math.cos(rot)],p=[x+normal[0]*.29,site.y+.22,z+normal[2]*.29];
   sconces.push({name,floor:site.f,axis:w.axis,fixed:w.fixed,at,side:w.side,edge:w.edge,anchor:[x,site.y,z],normal,wall:[w.from,w.to,w.low,w.high],bounds:[result.bounds.min.toArray(),result.bounds.max.toArray()],candles:3,triangles:result.triangles});lights.push({name,position:p,intensity:7.5,distance:2.75,color:0xffd8a5});
 }
 return {count,fixtures,sconces:sconces.length,sconcePositions:sconces.filter(s=>s.floor==='eg').map(s=>[s.anchor[0],s.anchor[2]]),sconceDetails:sconces,lights};
}
