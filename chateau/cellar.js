import {HALF_W,HALF_D,EXTERIOR as X,FACADE_SEGMENTS,frontAt,rearAt} from './roissy-config.js?v=roissy362';
import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

const passages=[-22,-14,-7,0,7,14,22];
const divider=[-3.82,3.82];
const wingCentres=[-(HALF_W+X.wingX)/2,(HALF_W+X.wingX)/2];
const opening=1.34;
const wallDepth=.62;
const outer=.24;
export const CELLAR={
  floor:-5.45,
  entry:{x:-23.9,z:0,yaw:-Math.PI/2},
  footprint:[
    [-HALF_W,HALF_W,-HALF_D,HALF_D],
    [-HALF_W,-X.wingX,HALF_D,X.wingFront],
    [X.wingX,HALF_W,HALF_D,X.wingFront],
    [-X.parkX,X.parkX,X.parkBack,-HALF_D]
  ]
};
const wallRows=[
  ...divider.map(z=>({z,left:-HALF_W,right:HALF_W,centres:passages})),
  {z:HALF_D,left:-HALF_W,right:-X.wingX,centres:[wingCentres[0]]},
  {z:HALF_D,left:X.wingX,right:HALF_W,centres:[wingCentres[1]]},
  {z:-HALF_D,left:-X.parkX,right:X.parkX,centres:[-3.6,0,3.6]}
];
const near=(a,b,r)=>Math.abs(a-b)<r;
export function cellarBlocks(x,z,r){
  // Check the whole movement envelope at the stepped corners of the footprint.
  for(const edgeX of [x-r,x,x+r]){
    if(Math.abs(edgeX)>=HALF_W-outer||z+r>frontAt(edgeX)-outer||z-r<rearAt(edgeX)+outer)return true;
  }
  if(wallRows.some(row=>x+r>row.left&&x-r<row.right&&near(z,row.z,wallDepth/2+r)&&
    !row.centres.some(centre=>near(x,centre,opening-r))))return true;
  return [-25.9,25.9].some(end=>near(x,end,.37+r)&&near(z,0,1.43+r));
}
export function cellarPlace(x,z){
  if(z>HALF_D)return x<0?'Keller · Westliches Pavillongewölbe':'Keller · Östliches Pavillongewölbe';
  if(z<-8.8&&Math.abs(x)<X.parkX)return 'Keller · Parkgewölbe';
  if(z<divider[0])return 'Keller · Vorratsgewölbe';
  if(z>divider[1])return 'Keller · Fassgewölbe';
  return 'Keller · Große Gewölbegalerie';
}

export function buildCellar(T,parent,mats,shaft){
  const root=new T.Group();
  root.name='Roissy_Untergeschoss';
  parent.add(root);
  const floor=CELLAR.floor,top=-.12,spring=floor+2.25;
  const batches=new Map();
  const stone=mats.dressedStone,trim=mats.windowStone;
  const granite=new T.MeshStandardMaterial({name:'Keller · Blaustein',color:0x464d50,roughness:.83});
  const sandstone=new T.MeshStandardMaterial({name:'Keller · warmer Sandstein',color:0xb28f6b,roughness:.88});
  const vaultStone=mats.facadeWall;
  const iron=new T.MeshStandardMaterial({name:'Keller · Schmiedeeisen',color:0x332820,metalness:.68,roughness:.46});
  const flame=new T.MeshStandardMaterial({name:'Keller · Laternenlicht',color:0xffedc3,emissive:0xff9e48,emissiveIntensity:3.1});
  function append(mat,g){
    if(!batches.has(mat))batches.set(mat,[]);
    const part=g.index?g.toNonIndexed():g;
    if(part!==g)g.dispose();
    batches.get(mat).push(part);
  }
  function box(mat,x,y,z,w,h,d){
    const g=new T.BoxGeometry(w,h,d);
    g.translate(x,y,z);
    append(mat,g);
  }
  function floorPanel(x0,x1,z0,z1){
    // World-metric random bond, with recessed joints over an opaque subfloor.
    box(granite,(x0+x1)/2,floor-.14,(z0+z1)/2,x1-x0,.235,z1-z0);
    for(let z=z0,row=0;z<z1-1e-6;z+=.67,row++){
      const endZ=Math.min(z+.67,z1),spanZ=endZ-z;
      for(let x=x0;x<x1-1e-6;){
        const length=Math.min(x1-x,x===x0&&row%2?.49:.98);
        if(length>.022&&spanZ>.02){
          const field=Math.abs(z)<1.15&&Math.abs(x)<25.5;
          const mat=field?trim:(Math.round((x-x0)*2+row)%6===0?sandstone:stone);
          box(mat,x+length/2,floor-.013,z+spanZ/2,length-.012,.026,spanZ-.012);
        }
        x+=length;
      }
    }
  }
  for(const [x0,x1,z0,z1] of CELLAR.footprint)floorPanel(x0,x1,z0,z1);

  // Outer retaining walls follow the full stepped outline of the palace.
  for(const {axis,fixed,a,b,normal} of FACADE_SEGMENTS){
    const x=axis==='x'?(a+b)/2:fixed+normal*.015;
    const z=axis==='x'?fixed+normal*.015:(a+b)/2;
    const span=b-a+.08;
    box(stone,x,(floor+top)/2,z,axis==='x'?span:.51,top-floor,axis==='x'?.51:span);
    const dx=axis==='x'?0:normal*.23,dz=axis==='x'?normal*.23:0;
    for(const [height,h,depth,mat] of [[.18,.36,.20,granite],[.372,.044,.224,sandstone],[2.126,.048,.175,sandstone],[2.22,.13,.24,trim],[2.304,.039,.208,stone]]){
      box(mat,x-dx,floor+height,z-dz,axis==='x'?span:depth,h,axis==='x'?depth:span);
    }
  }

  function polygon(mat,points){
    const g=new T.BufferGeometry(),uv=points.flatMap(([x,y,z])=>[x/2+z/2,y/2]);
    g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    g.computeVertexNormals();
    append(mat,g);
  }
  const ringPoint=(cx,cy,rx,ry,t)=>[cx+rx*Math.cos(t),cy+ry*Math.sin(t)];
  function masonryProfile(mat,outline,z,depth){
    const shape=new T.Shape(outline.map(p=>new T.Vector2(...p)));
    const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:1});
    geo.translate(0,0,z-depth/2);
    append(mat,geo);
  }
  for(const {z,left,right,centres} of wallRows){
    let start=left;
    for(const cx of centres){
      const l=cx-opening,r=cx+opening;
      box(stone,(start+l)/2,(top+floor)/2,z,l-start,top-floor,wallDepth);
      const archSpring=floor+1.92,archRise=1.19;
      const curve=Array.from({length:19},(_,i)=>ringPoint(cx,archSpring,opening,archRise,Math.PI-i*Math.PI/18));
      masonryProfile(stone,[...curve,[r,top],[l,top]],z,wallDepth);
      for(let i=0;i<18;i++){
        const a=(i+.013)*Math.PI/18,b=(i+.987)*Math.PI/18;
        masonryProfile(i===8||i===9?trim:sandstone,[
          ringPoint(cx,archSpring,opening,archRise,a),
          ringPoint(cx,archSpring,opening+.225,archRise+.225,a),
          ringPoint(cx,archSpring,opening+.225,archRise+.225,b),
          ringPoint(cx,archSpring,opening,archRise,b)
        ],z,wallDepth+.17);
      }
      for(const side of [-1,1]){
        box(sandstone,cx+side*(opening+.115),floor+.97,z,.23,1.94,wallDepth+.17);
        box(trim,cx+side*(opening+.14),archSpring-.075,z,.28,.15,wallDepth+.25);
        box(granite,cx+side*(opening+.17),floor+.10,z,.34,.20,wallDepth+.25);
      }
      start=r;
    }
    box(stone,(start+right)/2,(top+floor)/2,z,right-start,top-floor,wallDepth);
  }

  // Elliptic barrels with true stone voussoir ribs and continuous spring lines.
  function barrel(axis,lo,hi,centre,radius,rise,ribs){
    const pos=(along,across,y)=>axis==='x'?[along,y,across]:[across,y,along];
    const ring=(along,t,inset=0)=>pos(along,centre+(radius-inset)*Math.cos(t),spring+(rise-inset)*Math.sin(t));
    const quad=(mat,a,b,c,d)=>{
      const points=axis==='x'?[a,c,b,a,d,c]:[a,b,c,a,c,d];
      polygon(mat,points);
    };
    const count=24;
    // Surface normals face the occupied volume.
    for(let i=0;i<count;i++){
      const a=i*Math.PI/count,b=(i+1)*Math.PI/count;
      // The shaft interrupts the southern barrel exactly at its four edges.
      if(axis==='x'&&centre>0&&shaft){
        const [x0,x1,z0,z1]=shaft,cut=t=>Math.acos(Math.max(-1,Math.min(1,(t-centre)/radius)));
        const cutA=Math.max(a,cut(z1)),cutB=Math.min(b,cut(z0));
        if(cutA<cutB){
          for(const [u,v,p,q] of [[lo,hi,a,cutA],[lo,x0,cutA,cutB],[x1,hi,cutA,cutB],[lo,hi,cutB,b]]){
            if(v>u&&q>p)quad(vaultStone,ring(u,p),ring(v,p),ring(v,q),ring(u,q));
          }
        }else quad(vaultStone,ring(lo,a),ring(hi,a),ring(hi,b),ring(lo,b));
      }else quad(vaultStone,ring(lo,a),ring(hi,a),ring(hi,b),ring(lo,b));
      for(const x of ribs){
        quad(i%3===0?trim:sandstone,ring(x-.13,a,.12),ring(x+.13,a,.12),ring(x+.13,b,.12),ring(x-.13,b,.12));
        // End caps along the length of the aisle close the underside profile.
        const p=ring(x-.13,a,.12),q=ring(x-.13,b,.12),r=ring(x-.13,b),s=ring(x-.13,a);
        polygon(trim,axis==='x'?[p,r,q,p,s,r]:[p,q,r,p,r,s]);
        const u=ring(x+.13,a,.12),v=ring(x+.13,b,.12),w=ring(x+.13,b),k=ring(x+.13,a);
        polygon(trim,axis==='x'?[u,v,w,u,w,k]:[u,w,v,u,k,w]);
      }
    }
  }
  const edges=[-HALF_D,...divider,HALF_D];
  for(let i=0;i<3;i++){
    const l=edges[i],r=edges[i+1],c=(l+r)/2;
    barrel('x',-HALF_W,HALF_W,c,(r-l)/2,2.45,[-25,-18,-11,-3.5,3.5,11,18,25]);
  }
  for(const x of wingCentres)barrel('z',HALF_D,X.wingFront,x,(HALF_W-X.wingX)/2,2.32,[12.3,14.5,16.15]);
  barrel('z',X.parkBack,-HALF_D,0,X.parkX,2.32,[-12.02]);

  // Low solid backdrop, moulded plinth and crown at both ends of the main gallery.
  for(const x of [-25.9,25.9]){
    box(trim,x,floor+1.20,0,.38,2.40,2.63);
    box(granite,x,floor+.16,0,.72,.32,2.86);
    box(sandstone,x,floor+2.44,0,.69,.16,2.79);
    for(const z of [-1.00,1.00])box(sandstone,x,floor+1.28,z,.54,1.88,.25);
    const face=x-Math.sign(x)*.209,cy=floor+1.34;
    for(const radius of [.59,.51,.12]){
      const ring=new T.TorusGeometry(radius,.021,8,48);
      ring.rotateY(Math.PI/2);
      ring.translate(face,cy,0);
      append(sandstone,ring);
    }
    for(let i=0;i<12;i++){
      const angle=i*Math.PI/6;
      const leaf=new T.SphereGeometry(1,10,8);
      leaf.scale(.041,.166,.055);
      leaf.rotateX(angle);
      leaf.translate(face,cy+.31*Math.cos(angle),.31*Math.sin(angle));
      append(trim,leaf);
    }
  }

  // Inlaid compass under the crossing of the four central sightlines.
  const disc=new T.CylinderGeometry(2.12,2.12,.016,72);
  disc.translate(0,floor+.009,0);
  append(granite,disc);
  const border=new T.TorusGeometry(1.96,.024,8,72);
  border.rotateX(-Math.PI/2);
  border.translate(0,floor+.021,0);
  append(trim,border);
  for(let i=0;i<8;i++){
    const theta=i*Math.PI/4,c=Math.cos(theta),s=Math.sin(theta),length=i%2?1.24:1.79;
    const y=floor+.020,p=[c*length,y,s*length],base=[0,y,0];
    const left=[c*.38-s*.19,y,s*.38+c*.19],right=[c*.38+s*.19,y,s*.38-c*.19];
    polygon(trim,[base,left,p]);
    polygon(sandstone,[base,p,right]);
  }

  const lanterns=[];
  function lantern(x,z,y,intensity,distance,ceiling=floor+4.70){
    const mount=y+.18;
    box(iron,x,(ceiling+mount)/2,z,.039,ceiling-mount,.039);
    box(iron,x,y+.16,z,.36,.08,.36);
    box(iron,x,y-.17,z,.32,.075,.32);
    for(const u of [-.141,.141])for(const v of [-.141,.141])box(iron,x+u,y,z+v,.027,.34,.027);
    box(flame,x,y-.035,z,.057,.17,.057);
    lanterns.push({x,y:y-.10,z,intensity,distance});
  }
  for(const x of [-23,-15,-7,0,7,15,23])lantern(x,0,floor+3.67,57,9.2);
  for(const z of [-7.66,7.66])for(const x of [z>0?-23.5:-21,-10,0,10,21])lantern(x,z,floor+3.68,47,8.9);
  for(const x of wingCentres)lantern(x,14.18,floor+3.58,42,6.1,floor+4.57);
  lantern(0,-11.92,floor+3.58,30,5.5,floor+4.57);

  for(const [mat,parts] of batches){
    const g=mergeGeometries(parts,false);
    for(const p of parts)p.dispose();
    if(!g)throw Error('Kellergeometrie konnte nicht zusammengeführt werden');
    g.computeBoundingSphere();
    const mesh=new T.Mesh(g,mat);
    mesh.name='Roissy_Keller_'+mat.name;
    root.add(mesh);
  }
  // Shallow neutral bounce keeps the stone legible away from the lanterns.
  const lighting=new T.Group();
  lighting.visible=false;
  root.add(lighting);
  lighting.add(new T.HemisphereLight(0xe9d0b8,0x987c63,.48));
  root.visible=false;
  const lights=Array.from({length:8},()=>{
    const lamp=new T.PointLight(0xffc387,0,0,2);
    lighting.add(lamp);
    return lamp;
  });
  function updateLights(x,z){
    const active=lanterns.map(site=>({site,distance:Math.hypot(x-site.x,z-site.z)}))
      .sort((a,b)=>a.distance-b.distance).slice(0,lights.length);
    for(let i=0;i<lights.length;i++){
      const {site}=active[i],light=lights[i];
      light.position.set(site.x,site.y,site.z);
      light.intensity=site.intensity;
      light.distance=site.distance;
    }
  }
  return {root,lighting,updateLights,lanternCount:lanterns.length};
}
