// Resolve coplanar static box faces geometrically, before sending them to WebGL.
// Rectangular clipping keeps the original planes, edges, UVs and collision solids.
const EPS=1e-6;
const priorities={floor:90,trim:80,window:75,sash:70,stairHandrail:65,bronzeTrim:60,gold:55,stairIron:50,stone:40,sill:35,ceiling:30,wall:20};
// [normal axis, normal sign, UV horizontal axis, UV vertical axis, U direction, V-down direction]
const faces=[[0,1,2,1,-1,-1],[0,-1,2,1,1,-1],[1,1,0,2,1,1],[1,-1,0,2,1,-1],[2,1,0,1,1,-1],[2,-1,0,1,-1,-1]];
function cut(r,b){
 const [x0,x1,y0,y1]=r,a=Math.max(x0,b[0]),c=Math.min(x1,b[1]),d=Math.max(y0,b[2]),e=Math.min(y1,b[3]);
 if(c-a<=EPS||e-d<=EPS)return [r];
 const out=[];if(a-x0>EPS)out.push([x0,a,y0,y1]);if(x1-c>EPS)out.push([c,x1,y0,y1]);
 if(d-y0>EPS)out.push([a,c,y0,d]);if(y1-e>EPS)out.push([a,c,e,y1]);return out;
}
const area=r=>(r[1]-r[0])*(r[3]-r[2]);
export function resolveStaticFaces(THREE,batch,cast){
 const boxes=[],planes=new Map(),groups=new Map();
 for(const [key,records] of batch){
  const mat=key.split(':')[1];groups.set(key,{clean:[],positions:[],normals:[],uvs:[]});
  for(const r of records){
   const box={key,r,mat,faces:[],changed:false};boxes.push(box);
   if(mat==='glass'||cast[mat]?.transparent)continue;
   const low=r.slice(0,3).map((n,i)=>n-r[i+3]/2),high=r.slice(0,3).map((n,i)=>n+r[i+3]/2);
   for(const f of faces){const [axis,sign,u,v]=f,p=sign>0?high[axis]:low[axis],rect=[low[u],high[u],low[v],high[v]];
    const face={box,f,p,rect,pieces:[rect]};box.faces.push(face);
    const id=`${axis}:${sign}:${Math.round(p/EPS)}`;if(!planes.has(id))planes.set(id,[]);planes.get(id).push(face);
   }
  }
 }
 let removedArea=0,clippedFaces=0,changedBoxes=0;
 for(const list of planes.values()){
  // Prefer visible finish over its backing stone; equal priority retains first face.
  list.sort((a,b)=>(priorities[b.box.mat]??0)-(priorities[a.box.mat]??0));
  const covered=[];
  for(const face of list){
   let pieces=[face.rect];
   for(const previous of covered){
    if(previous[1]<=face.rect[0]+EPS||previous[0]>=face.rect[1]-EPS||previous[3]<=face.rect[2]+EPS||previous[2]>=face.rect[3]-EPS)continue;
    pieces=pieces.flatMap(r=>cut(r,previous));if(!pieces.length)break;
   }
   const loss=area(face.rect)-pieces.reduce((s,r)=>s+area(r),0);
   if(loss>EPS*EPS){face.box.changed=true;clippedFaces++;removedArea+=loss;face.pieces=pieces;}
   covered.push(face.rect);
  }
 }
 for(const box of boxes){const group=groups.get(box.key);if(!box.changed){group.clean.push(box.r);continue;}changedBoxes++;
  for(const face of box.faces){const [axis,sign,u,v,ud,vd]=face.f,original=face.rect;
   for(const r of face.pieces){
    const corners=[[ud>0?r[0]:r[1],vd>0?r[2]:r[3]],[ud>0?r[1]:r[0],vd>0?r[2]:r[3]],[ud>0?r[0]:r[1],vd>0?r[3]:r[2]],[ud>0?r[1]:r[0],vd>0?r[3]:r[2]]];
    for(const i of [0,2,1,2,3,1]){const [a,b]=corners[i],p=[0,0,0],n=[0,0,0];p[axis]=face.p;p[u]=a;p[v]=b;n[axis]=sign;
     const U=(a-original[0])/(original[1]-original[0]),V=(b-original[2])/(original[3]-original[2]);
     group.positions.push(...p);group.normals.push(...n);group.uvs.push(ud>0?U:1-U,vd>0?1-V:V);
    }
   }
  }
 }
 // Expose the exact remaining face rectangles for a reproducible audit, not rendering.
 let residualOverlap=0;
 for(const list of planes.values())for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)for(const a of list[i].pieces)for(const b of list[j].pieces){
  const x=Math.min(a[1],b[1])-Math.max(a[0],b[0]),y=Math.min(a[3],b[3])-Math.max(a[2],b[2]);if(x>EPS&&y>EPS)residualOverlap++;
 }
 if(residualOverlap)throw Error('Unresolved coplanar box faces: '+residualOverlap);
 return {groups,stats:{staticBoxes:boxes.length,clippedFaces,changedBoxes,removedAreaM2:Math.round(removedArea*1000)/1000,residualOverlap}};
}
