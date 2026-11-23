/* CHÂTEAU GRAND — parametrische Gebäudegeometrie, V5.7 Architekturrevision.
   Der Grundriss ist experimentell. Zonen sind keine fertig ausgebauten Zimmer.
*/
window.createChateauGeometry=function createChateauGeometry(context){
const {MOBILE,box,cylinder,sphere,quad,tri,roof,GLASS,TRIM,GOLD,STWHITE,SLATE,FLOORLIGHT}=context;
// CHÂTEAU GRAND · V5.7 Architekturrevision
// Fresh architectural restart: new exterior shell, cleaner proportions, single-file mobile build.
const OPT=(new URLSearchParams(location.search).get('quality')||'').toLowerCase();
const DETAIL=OPT==='ultra'&&!MOBILE?3:OPT==='high'||(!MOBILE&&OPT!=='mobile')?2:1;
const ST0=[.79,.75,.69], ST1=[.86,.82,.76], ST2=[.93,.89,.82], ST3=[.58,.56,.52], ST4=[.70,.67,.62];
const RO0=[.12,.17,.23],RO1=[.14,.20,.27],RO2=[.18,.24,.31],MTR=[.55,.47,.31],GILD=[.84,.68,.34];
const WC=[.74,.68,.58],WALL=[.72,.69,.63],CARPET=[.49,.27,.20],WOOD2=[.30,.18,.12],DARK=[.07,.11,.15];
const FLOOR_Y=[-4.15,.70,5.95,11.20,16.45];
const FLOOR_NAMES=['Keller','Erdgeschoss','1. Obergeschoss','2. Obergeschoss','Dachboden'];
const LEVEL_ROOMCOUNTS=[0,0,0,0,0];
const ROOMS=[]; const collision=[];

const PALACE={mainX:55, mainZf:13.1, mainZb:-13.1, wingX0:26.0, wingX1:45.8, wingZ0:-13.0, wingZ1:-61.8, rearX0:-45.8, rearX1:45.8, rearZ0:-61.8, rearZ1:-77.8};
const FLOOR_H=[4.85,5.25,5.25,5.70,3.40]; // Geschosswände sind ohne 70-cm-Lücken verbunden

function zone(level,name,x,z){ROOMS.push({level,name,room:name+' '+(LEVEL_ROOMCOUNTS[level]+1),x,z});LEVEL_ROOMCOUNTS[level]++;}
function wallX(x0,x1,y,z,h=.30,t=.26,c=ST1,solid=true){if(x1<x0)[x0,x1]=[x1,x0]; if(x1<=x0)return; box((x0+x1)/2,y+h/2,z,x1-x0,h,t,c); if(solid)collision.push([x0,x1,z-t/2,z+t/2,y,y+h]);}
function wallZ(x,z0,z1,y,h=.30,t=.26,c=ST1,solid=true){if(z1<z0)[z0,z1]=[z1,z0]; if(z1<=z0)return; box(x,y+h/2,(z0+z1)/2,t,h,z1-z0,c); if(solid)collision.push([x-t/2,x+t/2,z0,z1,y,y+h]);}
function floorPlate(cx,cy,cz,w,d,col=FLOORLIGHT,mat=5){box(cx,cy,cz,w,.14,d,col,mat)}
function mbeam(a,b,r,c=ST2,mat=0){let v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],l=Math.hypot(...v)||1;v=v.map(n=>n/l);let t=Math.abs(v[1])<.90?[0,1,0]:[1,0,0],u=[v[1]*t[2]-v[2]*t[1],v[2]*t[0]-v[0]*t[2],v[0]*t[1]-v[1]*t[0]],ul=Math.hypot(...u)||1;u=u.map(n=>n/ul);let w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];let pts=[];for(let p of [a,b])for(let [i,j] of [[-1,-1],[1,-1],[1,1],[-1,1]])pts.push([p[0]+r*(i*u[0]+j*w[0]),p[1]+r*(i*u[1]+j*w[1]),p[2]+r*(i*u[2]+j*w[2])]);for(let k=0;k<4;k++){let n=(k+1)%4;quad(pts[k],pts[n],pts[n+4],pts[k+4],c,mat);}}
function flower(x,y,z,r=.23){sphere(x,y,z,r,ST2,0,6,DETAIL===1?10:14); for(let i=0;i<8;i++){let a=i*Math.PI/4; sphere(x+r*.85*Math.cos(a),y+r*.85*Math.sin(a),z+.08,r*.30,ST1,0,4,7)} sphere(x,y,z+.16,r*.26,GILD,4,5,8)}
function trimBand(cx,y,cz,w,d=.42,h=.19,c=ST2){box(cx,y,cz,w,h,d,c); box(cx,y+h*.55,cz+.06,w-.20,h*.25,d*.65,ST3)}
function trimBandSide(x,y,cz,d,w=.42,h=.19,c=ST2){box(x,y,cz,w,h,d,c); box(x+.06,y+h*.55,cz,w*.65,h*.25,d-.20,ST3)}
function pedestalBandFront(x0,x1,y,z,depth=.72){box((x0+x1)/2,y,z+depth/2,x1-x0,.28,depth,ST2); box((x0+x1)/2,y+.17,z+depth*.63,x1-x0-.25,.10,depth*.36,ST1);}
function pedestalBandBack(x0,x1,y,z,depth=.72){box((x0+x1)/2,y,z-depth/2,x1-x0,.28,depth,ST2); box((x0+x1)/2,y+.17,z-depth*.63,x1-x0-.25,.10,depth*.36,ST1);}
function pedestalBandSide(x,y,z0,z1,face=1,depth=.72){box(x+face*depth/2,y,(z0+z1)/2,depth,.28,z1-z0,ST2); box(x+face*depth*.63,y+.17,(z0+z1)/2,depth*.36,.10,z1-z0-.25,ST1);}
function ribbedColumn(x,z,y0,y1,r=.44){box(x,y0+.14,z,r*2.5,.28,r*2.5,ST2); box(x,y1-.20,z,r*3,.41,r*3,ST2); cylinder(x,(y0+y1)/2,z,r*.87,r*.91,(y1-y0)-.68,ST1,0,DETAIL===1?12:28); cylinder(x,y1-.52,z,r*1.13,r*.91,.27,ST2,0,DETAIL===1?12:28); if(DETAIL>1)for(let i=0;i<12;i++){let a=i*Math.PI/6; let px=x+Math.cos(a)*r*.87,pz=z+Math.sin(a)*r*.87; box(px,(y0+y1)/2,pz,.043,(y1-y0)-.85,.043,ST0)}}
function deepWindowFront(x,y,z,w=2.20,h=3.15,decorated=true){
  box(x,y+h/2,z,w-.23,h-.16,.085,[.20,.28,.33],2);
  box(x,y+h/2,z+.05,w-.33,h-.25,.022,[.27,.38,.43],2);
  for(let dx of [-w/2,w/2]){box(x+dx,y+h/2,z+.15,.22,h+.41,.40,ST2);box(x+dx,y+h/2,z+.38,.07,h+.24,.11,ST0)}
  for(let yy of [y+h*.32,y+h*.68])box(x,yy,z+.28,w-.22,.090,.14,ST2);
  for(let dx of [-w/4,0,w/4])box(x+dx,y+h/2,z+.29,.075,h-.20,.15,ST1);
  box(x,y-.10,z+.22,w+.54,.22,.62,ST2);box(x,y+h+.12,z+.22,w+.55,.25,.60,ST2);
  if(decorated){box(x,y+h+.42,z+.18,w+.84,.16,.59,ST1);box(x,y+h+.52,z+.15,w+.67,.095,.53,ST2);box(x,y+h+.55,z+.49,.33,.31,.34,ST3);for(let t of [-1,1]){box(x+t*(w/2+.18),y-.33,z+.29,.24,.30,.32,ST1);flower(x+t*(w/2+.17),y+h+.25,z+.49,.15);}}
}
function deepWindowBack(x,y,z,w=2.05,h=2.95,decorated=true){
  box(x,y+h/2,z,w-.23,h-.16,.085,[.20,.28,.33],2);
  box(x,y+h/2,z-.05,w-.33,h-.25,.022,[.27,.38,.43],2);
  for(let dx of [-w/2,w/2]){box(x+dx,y+h/2,z-.15,.22,h+.35,.40,ST2);}
  for(let yy of [y+h*.32,y+h*.68])box(x,yy,z-.20,w-.22,.085,.14,ST2);
  for(let dx of [-w/4,0,w/4])box(x+dx,y+h/2,z-.22,.072,h-.20,.15,ST1);
  box(x,y-.10,z-.20,w+.48,.20,.56,ST2);box(x,y+h+.10,z-.18,w+.50,.20,.53,ST2);
  if(decorated) box(x,y+h+.38,z-.14,w+.70,.12,.50,ST1);
}
// Window apertures are genuine empty spaces in the wall, not decals over solid stone.
// Each row is physically split into piers, sill band and lintel.
function wallWithOpeningsX(x0,x1,z,y,h,centers,width=2.30,sill=0.70,openH=3.25,solid=true){
 const t=.34, xs=centers.filter(x=>x>x0+width/2&&x<x1-width/2).sort((a,b)=>a-b);
 for(let x=x0,last=x0,idx=0;idx<=xs.length;idx++){
   let right=idx<xs.length?xs[idx]-width/2:x1;
   if(right-last>.01)wallX(last,right,y,z,h,t,ST1,solid);
   if(idx<xs.length){
     const a=xs[idx]-width/2,b=xs[idx]+width/2;
     if(sill>.01)wallX(a,b,y,z,sill,t,ST1,solid);
     if(sill+openH<h-.02)wallX(a,b,y+sill+openH,z,h-sill-openH,t,ST1,solid);
     last=b;
   }
 }
}
function wallWithOpeningsZ(x,z0,z1,y,h,centers,width=2.10,sill=.72,openH=3.05){
 const t=.34,zs=centers.filter(z=>z>z0+width/2&&z<z1-width/2).sort((a,b)=>a-b);
 for(let idx=0,last=z0;idx<=zs.length;idx++){
   let right=idx<zs.length?zs[idx]-width/2:z1;
   if(right-last>.01)wallZ(x,last,right,y,h,t,ST1);
   if(idx<zs.length){
     const a=zs[idx]-width/2,b=zs[idx]+width/2;
     if(sill>.01)wallZ(x,a,b,y,sill,t,ST1);
     if(sill+openH<h-.02)wallZ(x,a,b,y+sill+openH,h-sill-openH,t,ST1);
     last=b;
   }
 }
}
function sideWindow(x,y,z,h=2.85,face=1){let q=face;box(x+q*.22,y+h/2,z,.07,h,1.55,[.24,.32,.39],2);for(let dz of [-.84,0,.84])box(x+q*.30,y+h/2,z+dz,.36,h+.35,.17,ST2);for(let yy of [y+.1,y+h+.11])box(x+q*.34,yy,z, .37,.22,2.2,ST2);box(x+q*.44,y+h/2,z,.13,h,.08,ST1);}
function balconyRail(x0,x1,y,z){box((x0+x1)/2,y,z,x1-x0,.18,.34,ST2);for(let x=x0+.34;x<x1-.2;x+=.62){cylinder(x,y-.18,z,.065,.08,.55,ST2,0,7); sphere(x,y+.08,z,.10,ST1,0,4,7)}}
function balconyRailSide(x,y,z0,z1){box(x,y,(z0+z1)/2,.34,.18,z1-z0,ST2);for(let z=z0+.34;z<z1-.2;z+=.62){cylinder(x,y-.18,z,.065,.08,.55,ST2,0,7); sphere(x,y+.08,z,.10,ST1,0,4,7)}}
function facadePilasterFront(x,y0,y1,z,depth=.62,width=.58){box(x,(y0+y1)/2,z+depth/2,width,y1-y0,depth,ST2);box(x,y1-.15,z+depth*.52,width+.18,.22,depth+.10,ST1);box(x,y0+.12,z+depth*.52,width+.20,.24,depth+.12,ST1);}
function facadePilasterBack(x,y0,y1,z,depth=.62,width=.58){box(x,(y0+y1)/2,z-depth/2,width,y1-y0,depth,ST2);box(x,y1-.15,z-depth*.52,width+.18,.22,depth+.10,ST1);box(x,y0+.12,z-depth*.52,width+.20,.24,depth+.12,ST1);}
function sidePilaster(x,y0,y1,z,face=1,depth=.62,width=.58){box(x+face*depth/2,(y0+y1)/2,z,depth,y1-y0,width,ST2);box(x+face*depth*.52,y1-.15,z,depth+.10,.22,width+.18,ST1);box(x+face*depth*.52,y0+.12,z,depth+.12,.24,width+.20,ST1);}
function fancyDoor(x,y,z,w=3.1,h=4.7){for(let side of [-1,1])box(x+side*w/2,y+h/2,z+.16,.32,h+.3,.62,ST2); box(x,y+h+.12,z+.19,w+.58,.32,.75,ST2); box(x,y+h/2,z,w-.42,h-.40,.10,[.17,.10,.06],3); box(x,y+h/2,z+.12,w-.60,h-.54,.09,[.31,.19,.12],3); box(x,y+h/2,z+.14,.14,h-.40,.10,[.44,.27,.16],3); for(let sx of [-.8,.8])sphere(x+sx,y+2.15,z+.25,.08,GILD,4,5,8);}
function pediment(x,base,z,w=22,h=6,d=.65){tri([x-w/2,base,z+d],[x+w/2,base,z+d],[x,base+h,z+d],ST2); tri([x+w/2,base,z-d],[x-w/2,base,z-d],[x,base+h,z-d],ST2); quad([x-w/2,base,z+d],[x+w/2,base,z+d],[x+w/2,base,z-d],[x-w/2,base,z-d],ST2); mbeam([x-w/2,base,z],[x,base+h,z],.12,ST1); mbeam([x+w/2,base,z],[x,base+h,z],.12,ST1); box(x,base-.12,z,w+.25,.22,1.25,ST2); flower(x,base+h*.48,z+.45,.36);}
function windowPedimentTriFront(x,base,z,w=3.0,h=1.0,d=.52){box(x,base,z+d*.42,w,.14,d,ST2); tri([x-w/2,base+.02,z+d],[x+w/2,base+.02,z+d],[x,base+h,z+d],ST2); mbeam([x-w/2,base+.02,z+d*.74],[x,base+h,z+d*.74],.05,ST1); mbeam([x+w/2,base+.02,z+d*.74],[x,base+h,z+d*.74],.05,ST1);}
function windowPedimentFlatFront(x,base,z,w=2.8,d=.48){box(x,base+.06,z+d*.34,w,.16,d,ST2); box(x,base+.28,z+d*.30,w-.35,.10,d*.72,ST1);}
function balconySlabFront(x0,x1,y,z,depth=1.35){box((x0+x1)/2,y,z+depth/2,x1-x0,.22,depth,ST2); box((x0+x1)/2,y-.11,z+depth*.72,x1-x0-.22,.10,depth*.34,ST1);}
function pilasterGiantFront(x,y0,y1,z,depth=.92,width=.92){box(x,(y0+y1)/2,z+depth/2,width,y1-y0,depth,ST2); box(x,y0+.18,z+depth*.56,width+0.22,.30,depth+0.10,ST1); box(x,y1-.18,z+depth*.56,width+0.26,.34,depth+0.12,ST1);}
function dormerFront(x,z,y,s=1.0){box(x,y,z,1.72*s,2.0*s,.76*s,ST1); box(x,y,z+.42*s,1.18*s,1.38*s,.07*s,GLASS,2); box(x,y,z+.50*s,.09*s,1.35*s,.11*s,STWHITE); box(x,y+.08*s,z+.53*s,1.20*s,.08*s,.12*s,STWHITE); box(x,y-.95*s,z+.4*s,1.92*s,.18*s,.90*s,STWHITE); let yy=y+1.00*s; tri([x-1.08*s,yy-.06*s,z+.65*s],[x+1.08*s,yy-.06*s,z+.65*s],[x,yy+1.20*s,z+.65*s],SLATE,1); tri([x+1.08*s,yy-.06*s,z-.34*s],[x-1.08*s,yy-.06*s,z-.34*s],[x,yy+1.20*s,z-.34*s],SLATE,1);}
function dormerBack(x,z,y,s=1.0){box(x,y,z,1.58*s,1.80*s,.70*s,ST1); box(x,y,z-.42*s,1.04*s,1.20*s,.07*s,GLASS,2); box(x,y,z-.50*s,.09*s,1.18*s,.11*s,STWHITE); box(x,y-.85*s,z-.4*s,1.72*s,.18*s,.84*s,STWHITE); let yy=y+.90*s; tri([x-1.0*s,yy-.06*s,z-.60*s],[x+1.0*s,yy-.06*s,z-.60*s],[x,yy+1.0*s,z-.60*s],SLATE,1); tri([x+1.0*s,yy-.06*s,z+.32*s],[x-1.0*s,yy-.06*s,z+.32*s],[x,yy+1.0*s,z+.32*s],SLATE,1);}
function dormerSide(x,z,y,face=1,s=1){
 // Side-facing dormers: the old front-facing gables were rotated incorrectly,
 // producing spikes and apparent through-walls on both long wings.
 const a=x+face*.36*s;
 box(x,y,z,.84*s,1.78*s,1.75*s,ST1);
 box(a+face*.04*s,y,z,.09*s,1.24*s,1.16*s,GLASS,2);
 for(let t of [-1,0,1])box(a+face*.13*s,y,z+t*.52*s,.18*s,1.25*s,.075*s,ST2);
 box(a+face*.13*s,y,z,.16*s,.10*s,1.22*s,ST2);
 box(a+face*.07*s,y-.86*s,z,.56*s,.18*s,2.00*s,ST2);
 const hi=y+1.65*s,lo=y+.90*s;
 tri([a+face*.28*s,lo,z-.96*s],[a+face*.28*s,lo,z+.96*s],[a+face*.28*s,hi,z],SLATE,1);
 tri([a-face*.6*s,lo,z+.96*s],[a-face*.6*s,lo,z-.96*s],[a-face*.6*s,hi,z],SLATE,1);
 quad([a+face*.28*s,lo,z+.96*s],[a-face*.6*s,lo,z+.96*s],[a-face*.6*s,hi,z],[a+face*.28*s,hi,z],RO0,1);
 quad([a-face*.6*s,lo,z-.96*s],[a+face*.28*s,lo,z-.96*s],[a+face*.28*s,hi,z],[a-face*.6*s,hi,z],RO0,1);
}
function mansardRoof(cx,cz,w,d,bot,mid,top,inset=4.4){
 // A continuous four-sided Mansard with a proper hipped upper slate roof;
 // the previous broad horizontal flat slab and its seam artefacts are removed.
 const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
 const ix0=x0+inset,ix1=x1-inset,iz0=z0+inset,iz1=z1-inset;
 const q=(a,b,c,d)=>quad(a,b,c,d,RO1,1);
 q([x0,bot,z1],[x1,bot,z1],[ix1,mid,iz1],[ix0,mid,iz1]);
 q([x1,bot,z0],[x0,bot,z0],[ix0,mid,iz0],[ix1,mid,iz0]);
 q([x1,bot,z1],[x1,bot,z0],[ix1,mid,iz0],[ix1,mid,iz1]);
 q([x0,bot,z0],[x0,bot,z1],[ix0,mid,iz1],[ix0,mid,iz0]);
 const cm=cz, xm=cx, alongX=(ix1-ix0)>=(iz1-iz0);
 if(alongX){
   const a=ix0+Math.min(5,(iz1-iz0)*.42),b=ix1-Math.min(5,(iz1-iz0)*.42);
   quad([ix0,mid,iz1],[ix1,mid,iz1],[b,top,cm],[a,top,cm],RO2,1);
   quad([ix1,mid,iz0],[ix0,mid,iz0],[a,top,cm],[b,top,cm],RO2,1);
   tri([ix0,mid,iz0],[ix0,mid,iz1],[a,top,cm],RO2,1);
   tri([ix1,mid,iz1],[ix1,mid,iz0],[b,top,cm],RO2,1);
   mbeam([a,top+.055,cm],[b,top+.055,cm],.065,RO0,1);
 }else{
   const a=iz0+Math.min(5,(ix1-ix0)*.42),b=iz1-Math.min(5,(ix1-ix0)*.42);
   quad([ix1,mid,iz1],[ix1,mid,iz0],[xm,top,a],[xm,top,b],RO2,1);
   quad([ix0,mid,iz0],[ix0,mid,iz1],[xm,top,b],[xm,top,a],RO2,1);
   tri([ix0,mid,iz0],[ix1,mid,iz0],[xm,top,a],RO2,1);
   tri([ix1,mid,iz1],[ix0,mid,iz1],[xm,top,b],RO2,1);
   mbeam([xm,top+.055,a],[xm,top+.055,b],.065,RO0,1);
 }
 // Recessed standing seam guides on the front and rear, exactly on the roof plane.
 const spacing=DETAIL===1?4.8:3.3;
 for(let xx=x0+spacing;xx<x1-.8;xx+=spacing){
   mbeam([xx,bot+.025,z1-.055],[xx-(xx-cx)*inset/(w/2),mid+.03,iz1-.035],.018,RO0,1);
   mbeam([xx,bot+.025,z0+.055],[xx-(xx-cx)*inset/(w/2),mid+.03,iz0+.035],.018,RO0,1);
 }
 for(let zz=z0+spacing;zz<z1-.8;zz+=spacing){
   mbeam([x0+.055,bot+.025,zz],[ix0+.025,mid+.03,zz-(zz-cz)*inset/(d/2)],.018,RO0,1);
   mbeam([x1-.055,bot+.025,zz],[ix1-.025,mid+.03,zz-(zz-cz)*inset/(d/2)],.018,RO0,1);
 }
 // Continuous zinc gutter and stone cornice on ALL four eaves, not only front/back.
 box(cx,bot+.02,z1+.15,w+.35,.20,.38,ST2);
 box(cx,bot+.02,z0-.15,w+.35,.20,.38,ST2);
 box(x1+.15,bot+.02,cz,.38,.20,d+.35,ST2);
 box(x0-.15,bot+.02,cz,.38,.20,d+.35,ST2);
 box(cx,bot+.20,z1+.16,w+.46,.10,.43,ST1);
 box(cx,bot+.20,z0-.16,w+.46,.10,.43,ST1);
}

function dome(cx,cy,cz,rad=8.8){
 // A correctly outward-facing, gently tapered cupola with CURVED ribs and lantern.
 const panels=DETAIL===1?30:48, steps=DETAIL===1?14:22, ribCount=16;
 const p=(phi,theta)=>[cx+Math.cos(theta)*Math.cos(phi)*rad,cy+Math.sin(phi)*rad,cz+Math.sin(theta)*Math.cos(phi)*rad];
 cylinder(cx,cy-.75,cz,rad*1.08,rad*.99,1.50,ST2,0,panels);
 cylinder(cx,cy+.05,cz,rad*1.05,rad*1.05,.27,TRIM,0,panels);
 for(let i=0;i<panels;i++){
   let a=i*Math.PI*2/panels,b=(i+1)*Math.PI*2/panels;
   for(let j=0;j<steps;j++){
     let p0=j*(Math.PI*.49/steps),p1=(j+1)*(Math.PI*.49/steps);
     // Reverse previous inward triangle winding to expose correct daylight normals.
     quad(p(p0,b),p(p0,a),p(p1,a),p(p1,b),RO0,1);
   }
 }
 for(let i=0;i<ribCount;i++){
   let a=i*Math.PI*2/ribCount;
   for(let j=0;j<steps;j++){
     let p0=j*(Math.PI*.48/steps),p1=(j+1)*(Math.PI*.48/steps);
     let A=p(p0,a),B=p(p1,a),beyond=(q)=>[cx+(q[0]-cx)*1.012,q[1]+.045,cz+(q[2]-cz)*1.012];
     mbeam(beyond(A),beyond(B),DETAIL===1?.038:.048,TRIM,0);
   }
 }
 // Actual cupola drum, lantern, crowning finial (not a free-floating spike).
 cylinder(cx,cy+rad*.97,cz,1.10,1.13,1.0,ST2,0,16);
 for(let i=0;i<8;i++){
   let a=i*Math.PI/4;
   box(cx+Math.cos(a)*.96,cy+rad*1.02,cz+Math.sin(a)*.96,.13,.60,.15,GLASS,2);
 }
 cylinder(cx,cy+rad*1.12,cz,1.40,1.03,.30,TRIM,0,16);
 sphere(cx,cy+rad*1.18,cz,.34,GOLD,4,7,12);
}

function addFrontFacade(){
 const z=13.05;
 const xs=[-49,-41,-33,-25,-17,17,25,33,41,49];
 for(let l=1;l<=3;l++){let y=FLOOR_Y[l]+.95; for(let x of xs) deepWindowFront(x,y,z,2.25,3.25,l>1);}
 // Dormers, not fictitious fourth-storey wall-windows, light the attic.
 // portico
 const portZ=16.3; floorPlate(0,FLOOR_Y[1]-0.02,16.9,27.5,8.8,[.83,.81,.76],5);
 for(let k=0;k<5;k++) box(0,FLOOR_Y[1]-.08-k*.14,21.45+k*.46,24.5,.16,.47,[.83,.81,.76],5);
 for(let x of [-9.0,-5.5,-2.0,2.0,5.5,9.0]) ribbedColumn(x,portZ,FLOOR_Y[1],FLOOR_Y[3]+4.60,.65);
 box(0,FLOOR_Y[3]+4.54,portZ,22.1,.45,3.10,ST2);
 box(0,FLOOR_Y[3]+4.85,portZ+.03,22.8,.26,3.46,ST1);
 for(let x of [-9,-5.5,-2,2,5.5,9]){box(x,FLOOR_Y[3]+4.16,portZ,1.8,.44,1.40,ST1);}

 fancyDoor(-7.2,FLOOR_Y[1]+.20,13.08,3.25,4.9); fancyDoor(0,FLOOR_Y[1]+.20,13.08,3.85,5.0); fancyDoor(7.2,FLOOR_Y[1]+.20,13.08,3.25,4.9);
 // central open entrance framed only
 box(0,FLOOR_Y[1]+4.85,13.10,6.9,.28,.65,ST2); box(-3.45,FLOOR_Y[1]+2.43,13.11,.30,4.9,.60,ST2); box(3.45,FLOOR_Y[1]+2.43,13.11,.30,4.9,.60,ST2);
 balconyRail(-9.4,9.4,FLOOR_Y[2]+3.55,14.15);
 for(let x of [-7.0,0,7.0]) deepWindowFront(x,FLOOR_Y[2]+1.05,13.05,2.6,3.2,true);
 for(let x of [-5.2,5.2]) deepWindowFront(x,FLOOR_Y[3]+1.02,13.05,2.2,3.0,true);
 pediment(0,FLOOR_Y[3]+4.5,16.95,25.0,6.3,.85);
 trimBand(0,FLOOR_Y[3]+4.15,16.5,28.8,1.2,.26,ST2);
}

function addFrontRefinement(){
 const z=13.05;
 const y0=FLOOR_Y[1], y1=16.9;
 // Giant-order emphasis for the central corps de logis and pavilion ends.
 for(let x of [-53.1,-46.1,-38.7,-30.9,-21.4,-12.8,12.8,21.4,30.9,38.7,46.1,53.1]) pilasterGiantFront(x,y0,y1,z,.66,.62);
 for(let x of [-10.7,10.7]) pilasterGiantFront(x,y0,y1+2.0,z,.88,.84);
 // Stronger rusticated plinth / sill articulation across the ceremonial front.
 trimBand(0,1.95,13.18,109.9,.52,.14,ST1);
 trimBand(0,4.62,13.18,109.9,.48,.13,ST1);
 // Portico terrace, side cheek walls and balcony slab.
 balconySlabFront(-10.2,10.2,FLOOR_Y[2]+3.30,13.65,1.65);
 box(-12.3,FLOOR_Y[1]+1.22,18.62,.50,2.25,4.85,ST2); box(12.3,FLOOR_Y[1]+1.22,18.62,.50,2.25,4.85,ST2);
 box(-12.3,FLOOR_Y[1]+2.22,18.40,.74,.28,4.30,ST1); box(12.3,FLOOR_Y[1]+2.22,18.40,.74,.28,4.30,ST1);
 // Window crowns on the main elevation for a more mansion-like, built appearance.
 const lower=[-49,-41,-33,-25,-17,17,25,33,41,49];
 for(let i=0;i<lower.length;i++){
   const x=lower[i];
   if(i%2===0) windowPedimentTriFront(x,FLOOR_Y[2]+4.52,z,2.88,1.08,.52);
   else windowPedimentFlatFront(x,FLOOR_Y[2]+4.58,z,2.70,.48);
 }
 for(let x of [-49,-41,-33,-25,-17,17,25,33,41,49]) windowPedimentFlatFront(x,FLOOR_Y[3]+4.46,z,2.36,.42);
 // Central windows and balcony door surrounds.
 for(let x of [-7,0,7]) windowPedimentTriFront(x,FLOOR_Y[2]+4.68,z,3.06,1.16,.56);
 for(let x of [-5.2,5.2]) windowPedimentFlatFront(x,FLOOR_Y[3]+4.54,z,2.62,.46);
 // Balustrade directly in front of the attic windows above the portico pediment base.
 balconyRail(-8.3,8.3,FLOOR_Y[3]+4.42,15.55);
 // Additional front quoin markers at the pavilion breaks so wall transitions read cleaner.
 for(let x of [-45.8,-26.0,26.0,45.8]){
   for(let k=0;k<20;k++){
     const yy=.86+k*.78; if(yy>16.65)break;
     box(x,yy,13.08,.82,.54,.58,k%2?ST2:ST1);
   }
 }
}

function addRearFacade(){
 const z=-13.05;
 const xs=[-49,-41,-33,-25,-17,-9,9,17,25,33,41,49];
 for(let l=1;l<=3;l++){let y=FLOOR_Y[l]+1.0; for(let x of xs) deepWindowBack(x,y,z,2.0,2.95,l>1);}

 // central loggia to courtyard
 for(let x of [-9.8,9.8]) ribbedColumn(x,-12.6,FLOOR_Y[1],FLOOR_Y[3]+3.95,.40);
 for(let x of [-4.9,0,4.9]) ribbedColumn(x,-12.6,FLOOR_Y[1],FLOOR_Y[2]+4.05,.34);
 balconyRail(-10.8,10.8,FLOOR_Y[2]+3.45,-13.55);
}

function addSideFacades(){
 const zs=[-8,-2,4,10];
 for(let face of [-1,1]){
   let x=face*55.05;
   for(let l=1;l<=3;l++){let y=FLOOR_Y[l]+.95; for(let z of zs) sideWindow(x,y,z,3.05,face);} 

 }
 // wing sides
 for(let face of [-1,1]){
   let x=face*(PALACE.wingX1+0.05);
   for(let l=1;l<=3;l++){let y=FLOOR_Y[l]+.95; for(let z of [-55,-48,-41,-34,-27,-20]) sideWindow(x,y,z,2.95,face);} 

 }
}

function addWingInnerFacades(){
 for(let side of [-1,1]){
   let x=side*PALACE.wingX0;
   for(let l=1;l<=3;l++){
     let y=FLOOR_Y[l]+1.0;
     for(let z of [-54,-47,-40,-33,-26,-19]) sideWindow(x,y,z,2.95,side>0?-1:1);
   }

   balconyRailSide(x+(side>0?-.35:.35),FLOOR_Y[2]+3.42,-56.7,-18.3);
 }
 // courtyard-facing rear cross wing
 const frontZ=PALACE.rearZ0+.08, backZ=PALACE.rearZ1-.08;
 for(let l=1;l<=3;l++){
   let y=FLOOR_Y[l]+1.0;
   for(let x of [-20,-12,-4,4,12,20]) deepWindowFront(x,y,frontZ,2.08,2.95,l>1);
   for(let x of [-40,-32,-24,-16,-8,0,8,16,24,32,40]) deepWindowBack(x,y,backZ,2.0,2.9,l>1);
 }

 for(let side of [-1,1]){
   let x=side*45.85;
   for(let l=1;l<=3;l++){
     let y=FLOOR_Y[l]+.95;
     for(let z of [-74,-68]) sideWindow(x,y,z,2.9,side);
   }

 }
}

function addGrounds(){
 // Limestone arrival walk and symmetric parterre: the 720m lawn is retained.
 const buff=[.72,.67,.58],path=[.59,.54,.46];
 box(0,-.025,42.5,9.0,.06,42.0,path,5);
 box(0,.005,42.5,8.55,.055,41.6,buff,5);
 for(let z=22;z<62;z+=2.25){box(0,.041,z,8.35,.012,.024,[.47,.42,.36],5);}
 for(let sx of [-1,1]){
   // Flower beds arranged symmetrically either side of the axial path.
   for(let z of [36,51]){
     box(sx*18,.015,z,19,.05,10,[.22,.37,.18],10);
     for(let dx of [-8.85,8.85]) box(sx*18+dx,.035,z,.16,.10,10.1,ST2,5);
     for(let dz of [-5.05,5.05]) box(sx*18,.035,z+dz,19.1,.10,.18,ST2,5);
     const hedge=[.10,.25,.10];
     for(let dx of [-8.4,8.4])box(sx*18+dx,.34,z,.26,.58,9.15,hedge,11);
     for(let dz of [-4.35,4.35])box(sx*18,.34,z+dz,17.0,.58,.28,hedge,11);
   }
 }
 // Quiet square paved courtyard strips connecting all four wings.
 box(0,-.024,-37.0,9.0,.06,49.0,path,5);
 box(0,.008,-37.0,8.6,.05,48.6,buff,5);
 for(let z=-59;z<-15;z+=2.4)box(0,.041,z,8.2,.012,.025,[.48,.43,.38],5);
 for(let x of [-23,23]){
   box(x,-.025,-37.0,3.3,.055,44.5,path,5);
   box(x,.006,-37.0,3.0,.052,44.0,buff,5);
 }
 // Fine gravel courts under the entrance terrace, not a floating grey pedestal.
 box(0,-.025,21.5,26,.055,7.5,path,5);
 box(0,.005,21.5,25.6,.052,7.1,buff,5);
}

function addGrassClumps(){
 // Procedural crossed triangular microblades add 3D silhouette near the camera;
 // grass texture carries distance detail across the rest of the lawn.
 let seed=35870919;
 function rand(){ seed=(1664525*seed+1013904223)>>>0;return seed/4294967296; }
 const n=DETAIL===1?9700:DETAIL===2?22000:40000;
 const g0=[.22,.34,.115],g1=[.32,.43,.14],g2=[.43,.51,.19],g3=[.29,.38,.10],g4=[.40,.47,.15];
 const choices=[g0,g1,g2,g3,g4];
 for(let i=0;i<n;i++){
   // Dense near front and courtyard, thinner in the rest of the scene.
   const x=(rand()-.5)*244,z=(rand()-.5)*228-4;
   const main=Math.abs(x)<55.7 && z>-13.6 && z<13.6;
   const wings=(Math.abs(x)>25.4&&Math.abs(x)<46.3&&z>-62.2&&z<-12.6);
   const rear=Math.abs(x)<46.3&&z>-78.2&&z<-61.1;
   if(main||wings||rear||(Math.abs(x)<13&&z>13&&z<63)||(Math.abs(x)<27&&z< -13&&z> -62))continue;
   const height=.105+rand()*.20,spread=.07+rand()*.08,ang=rand()*6.2831853;
   const y=-.055;
   const color=choices[(rand()*choices.length)|0];
   // Each tuft two tapered blade planes, crossed to look volumetric from above.
   for(let j=0;j<2;j++){
     let a=ang+j*1.57079633,c=Math.cos(a),s=Math.sin(a);
     const blade=[x+s*spread*.17,y+height,z-c*spread*.17];
     tri([x-c*spread,y,z-s*spread],[x+c*spread,y,z+s*spread],blade,color,11);
     tri([x+c*spread,y,z+s*spread],[x-c*spread,y,z-s*spread],blade,color,11);
   }
 }
}

function addMassingAndFloors(){
 // 720 x 720 m continuous lawn. Exposed terrain is at y = -0.06; basement stays underground.
 // The material ID 10 is a tiling photographic-looking grass PBR-style surface.
 box(0,-.15,0,720,.18,720,[.65,.78,.56],10);
 // No artificial grey forecourt slab – the lawn reaches the foundation everywhere.

 // lower plinth visible above grade
 box(0,-1.85,0,110,5.1,26,ST0);
 box(36,-1.85,-37.25,19.8,5.1,49.5,ST0); box(-36,-1.85,-37.25,19.8,5.1,49.5,ST0);
 box(0,-1.85,-69.8,91.6,5.1,16.0,ST0);
 // gentle stone edging around the palace so walls read as thick and grounded in the lawn
 for(let side of [-1,1]) box(side*55.65,-.03,0,.55,.24,26.9,ST2,5);
 box(0,-.03,13.65,111.3,.24,.55,ST2,5); box(0,-.03,-13.65,111.3,.24,.55,ST2,5);
 for(let side of [-1,1]){ box(side*26.65,-.03,-37.25,.55,.24,50.6,ST2,5); box(side*45.15,-.03,-37.25,.55,.24,50.6,ST2,5); }
 box(36,-.03,-62.4,20.4,.24,.55,ST2,5); box(-36,-.03,-62.4,20.4,.24,.55,ST2,5);
 box(0,-.03,-61.25,91.8,.24,.55,ST2,5); box(0,-.03,-78.35,91.8,.24,.55,ST2,5);
 for(let side of [-1,1]) box(side*46.2,-.03,-69.8,.55,.24,16.9,ST2,5);
 // interior floor slabs across levels
 for(let l=0;l<5;l++){
   let fy=FLOOR_Y[l]-0.08;
   if(l===2){
     // Real double-height ceremonial hall: upper floor wraps the void, no hovering ceiling slab.
     floorPlate(-34.0,fy,0,42.0,26,[.84,.82,.76],5);
     floorPlate(34.0,fy,0,42.0,26,[.84,.82,.76],5);
     floorPlate(0,fy,-11.8,26.0,2.5,[.84,.82,.76],5);
     floorPlate(0,fy,11.8,26.0,2.5,[.84,.82,.76],5);
   }else floorPlate(0,fy,0,110,26,(l===0?[.78,.76,.72]:[.84,.82,.76]),5);
   floorPlate(36,fy,-37.25,19.6,49.2,(l===0?[.78,.76,.72]:[.84,.82,.76]),5);
   floorPlate(-36,fy,-37.25,19.6,49.2,(l===0?[.78,.76,.72]:[.84,.82,.76]),5);
   floorPlate(0,fy,-69.8,91.2,15.6,(l===0?[.78,.76,.72]:[.84,.82,.76]),5);
   if(l>0&&l<4){ floorPlate(0,fy,-11.3,22.0,4.1,[.86,.84,.79],5); }
 }
 // main grand hall patterned floor
 for(let x=-10;x<=10;x+=2.1) for(let z=-9;z<=11;z+=2.1) box(x,FLOOR_Y[1]+.02,z,1.95,.035,1.95,((Math.round((x+z)*10)%4===0)?ST3:ST2),5);
 // twin stairs inside hall
 for(let side of [-1,1]){
   let sx=side*8.6;
   for(let k=0;k<20;k++){let zz=8.6-k*.60, yy=FLOOR_Y[1]+k*.24; box(sx,yy,zz,4.4,.24,.72,ST2,5); if(k%2===0)for(let dx of [-2.15,2.15]) cylinder(sx+dx,yy+.45,zz,.055,.07,.88,ST2,0,8); }
   floorPlate(sx,6.2,-2.6,4.6,4.1,ST2,5);
 }
 floorPlate(0,6.2,-2.6,13.0,3.6,ST2,5);
 balconyRail(-10.7,10.7,6.72,-4.55);
}

function addShellAndCollision(){
 const mainWindowX=[-49,-41,-33,-25,-17,17,25,33,41,49];
 const mainWindowZ=[-8,-2,4,10],wingWindowZ=[-55,-48,-41,-34,-27,-20];
 for(let l=0;l<5;l++){
   const y=FLOOR_Y[l],h=FLOOR_H[l];
   if(l===4){
     // No attic exterior curtain walls: the actual Mansard slopes form the roof shell.
     // Narrow interior knee walls are hidden under the slate roof.
     wallX(-50,50,y,9.0,1.10,.25,ST1,false);
     wallX(-50,50,y,-9.0,1.10,.25,ST1,false);
     for(let x of [-39,-33,33,39])wallZ(x,-59,-16,y,1.1,.25,ST1,false);
     continue;
   }
   if(l===0){
     wallX(-55,55,y,13.05,h,.42,ST1);wallX(-55,55,y,-13.05,h,.42,ST1);
     for(let x of [-55,55])wallZ(x,-13.05,13.05,y,h,.42,ST1);
     for(let x of [-45.8,-26,26,45.8])wallZ(x,-61.8,-13.0,y,h,.42,ST1);
     wallX(-45.8,45.8,y,-77.8,h,.42,ST1);
     wallX(-26,26,y,-61.8,h,.42,ST1);
     for(let x of [-45.8,45.8])wallZ(x,-77.8,-61.8,y,h,.42,ST1);
   }else{
     // Split front at portico: never overlap openings or duplicate window centres.
     wallWithOpeningsX(-55,-12.5,13.05,y,h,mainWindowX.filter(x=>x< -13),2.45,.70,3.45);
     wallWithOpeningsX(12.5,55,13.05,y,h,mainWindowX.filter(x=>x>13),2.45,.70,3.45);
     const centers=l===1?[-7.2,0,7.2]:l===2?[-7,0,7]:[-5.2,5.2];
     wallWithOpeningsX(-12.5,12.5,13.05,y,h,centers,l===1?3.48:2.80,.70,3.55);
     wallWithOpeningsX(-55,55,-13.05,y,h,mainWindowX,2.2,.70,3.36);
     for(let x of [-55,55])wallWithOpeningsZ(x,-13.05,13.05,y,h,mainWindowZ,2.10,.72,3.10);
     for(let x of [-45.8,-26,26,45.8])wallWithOpeningsZ(x,-61.8,-13.0,y,h,wingWindowZ,2.10,.72,3.10);
     // Rearward quadrangle connects to BOTH wings along the complete shared edge.
     wallWithOpeningsX(-26,26,-61.8,y,h,[-20,-12,-4,4,12,20],2.14,.74,3.1);
     wallWithOpeningsX(-45.8,45.8,-77.8,y,h,[-40,-32,-24,-16,-8,0,8,16,24,32,40],2.15,.72,3.10);
     for(let x of [-45.8,45.8])wallWithOpeningsZ(x,-77.8,-61.8,y,h,[-74,-68],2.1,.72,3.0);
   }
   // Existing interior block-out retained, not presented as fully furnished rooms.
   wallX(-55,-14.5,y,-9.0,h,.24,ST0,false);wallX(14.5,55,y,-9.0,h,.24,ST0,false);
   wallX(-55,-14.5,y,8.7,h,.24,ST0,false);wallX(14.5,55,y,8.7,h,.24,ST0,false);
   wallZ(-14.5,-13.0,13.0,y,h,.24,ST0,false);wallZ(14.5,-13.0,13.0,y,h,.24,ST0,false);
   wallX(-12.3,12.3,y,-10.9,h,.24,ST0,false);
   for(let side of [-1,1]){
     wallZ(side*29.2,-61.0,-13.0,y,h,.24,ST0,false);
     wallZ(side*42.8,-61.0,-13.0,y,h,.24,ST0,false);
   }
 }
}

function addRoofs(){
 mansardRoof(0,0,110,26,16.9,21.25,25.10,4.65);
 mansardRoof(36,-37.2,19.8,49.4,16.9,21.05,24.6,3.25);
 mansardRoof(-36,-37.2,19.8,49.4,16.9,21.05,24.6,3.25);
 mansardRoof(0,-69.8,91.6,16.0,16.9,20.85,24.20,3.0);
 // Two dignified limestone lanterns with faceted slate conical caps.
 for(let side of [-1,1]){
   const cx=side*51.4,cz=9.15,r=2.60,n=16,bot=22.9,apex=25.35;
   cylinder(cx,21.45,cz,2.80,2.63,3.30,ST2,0,n);
   cylinder(cx,23.13,cz,2.89,2.89,.24,TRIM,0,n);
   for(let i=0;i<n;i++){
     const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
     tri([cx+Math.cos(b)*r,bot,cz+Math.sin(b)*r],
         [cx+Math.cos(a)*r,bot,cz+Math.sin(a)*r],
         [cx,apex,cz],RO1,1);
     // ribs follow the actual octagonal roof plane
     mbeam([cx+Math.cos(a)*r,bot+.01,cz+Math.sin(a)*r],[cx,apex+.02,cz],.023,TRIM,9);
   }
   cylinder(cx,25.64,cz,.21,.17,.46,GILD,4,10);
   sphere(cx,25.96,cz,.27,GILD,4,7,12);
 }
 // Roof dormers correctly oriented to the plane they emerge from.
 for(let x of [-45,-35,-25,-15,15,25,35,45]) dormerFront(x,12.0,19.2,.91);
 for(let x of [-45,-35,-25,-15,15,25,35,45]) dormerBack(x,-12.0,19.0,.88);
 for(let side of [-1,1]){
   for(let z of [-54,-45,-36,-27,-19]){
     dormerSide(side*45.1,z,19.1,side,.87);
     dormerSide(side*26.7,z,19.1,-side,.87);
   }
 }
 for(let x of [-40,-32,-24,-16,-8,0,8,16,24,32,40]) dormerBack(x,-76.6,18.95,.86);
 for(let x of [-20,-12,-4,4,12,20]) dormerFront(x,-62.0,18.95,.86);
 // The dome is lifted on a fenestrated stone drum with no exposed spiky rods.
 cylinder(0,24.9,-1.8,9.75,9.75,2.10,ST1,0,DETAIL===1?32:48);
 cylinder(0,26.0,-1.8,9.93,9.93,.28,ST2,0,DETAIL===1?32:48);
 for(let i=0;i<16;i++){
   let a=i*Math.PI*2/16,xx=Math.cos(a)*9.82,zz=-1.8+Math.sin(a)*9.82;
   cylinder(xx,25.13,zz,.19,.19,1.46,ST2,0,10);
 }
 dome(0,26.72,-1.8,9.35);
 // Period-correct stacks emerging at regular positions from their roof bodies.
 for(let x of [-44,-30,-19,19,30,44]){
   box(x,24.66,-3.8,1.20,2.45,1.17,ST0);box(x,26.0,-3.8,1.62,.24,1.60,ST2);
 }
 for(let side of [-1,1])for(let z of [-48,-29]){
   box(side*36,24.30,z,1.15,2.30,1.2,ST0);box(side*36,25.58,z,1.55,.30,1.5,ST2);
 }
 // Roof junction flashing between perpendicular ranges.
 for(let side of [-1,1]){
   for(let z of [-13.05,-61.8]){
     mbeam([side*45.8,17.04,z],[side*42.5,20.82,z+ (z<-40?1.4:-1.4)],.08,[.37,.42,.44],1);
     mbeam([side*26.0,17.04,z],[side*29.2,20.82,z+ (z<-40?1.4:-1.4)],.08,[.37,.42,.44],1);
   }
 }
}

function addCornerStonework(){
  // Interlocked limestone corner blocks, projecting from the plane of the wall.
  const quoinPairs=[[-55,-13.05],[-55,13.05],[55,-13.05],[55,13.05],[-45.8,-61.8],[-26.0,-61.8],[26.0,-61.8],[45.8,-61.8],[-45.8,-13.0],[-26.0,-13.0],[26.0,-13.0],[45.8,-13.0],[-45.8,-77.8],[45.8,-77.8],[-26.0,-61.8],[26.0,-61.8],[-26.0,-13.05],[26.0,-13.05],[-26.0,-61.95],[26.0,-61.95]];
  for(let [cornerX,frontZ] of quoinPairs){
    for(let k=0;k<20;k++){
      const y=.86+k*.78;
      if(y>16.65)break;
      box(cornerX,y,frontZ,.88,.54,.90,k%2?ST2:ST1);
      box(cornerX,y+.23,frontZ,.92,.075,.94,ST0);
    }
  }
  // Limestone keystones and frieze panels across the ceremonial elevation.
  for(let x of [-47,-39,-31,-23,-17,-9,9,17,23,31,39,47]){
    for(let l=1;l<=3;l++){
      const y=FLOOR_Y[l]+4.25;
      box(x,y,13.53,.52,.30,.30,ST2);
      if(DETAIL>1)flower(x,y+.35,13.55,.16);
    }
  }
  for(let x of [-50,-42,-34,-26,26,34,42,50]){
    box(x,15.98,13.45,1.22,.25,.42,ST2);
  }
  // Roofline finials / parapet stone pads at spaced intervals.
  for(let x=-52;x<=52;x+=5.2){
    box(x,17.03,13.15,.54,.28,.60,ST2);
    sphere(x,17.34,13.15,.17,ST1,0,5,9);
  }
}

function addDetailsAndZones(){
 // cornice bands
 for(let y of [5.45,10.70,15.95]){ trimBand(0,y,13.15,110.4,.62,.23,ST2); trimBand(0,y,-13.15,110.4,.62,.23,ST2); }
 for(let y of [5.45,10.70,15.95]){ trimBand(36,y,-61.1,19.9,.62,.23,ST2); trimBand(-36,y,-61.1,19.9,.62,.23,ST2); trimBand(0,y,-61.95,52.2,.62,.23,ST2); trimBand(0,y,-77.65,91.8,.62,.23,ST2); }
 // lower pedestal / watertable bands so the walls feel grounded and continuous.
 pedestalBandFront(-55,55,.92,13.05,.72); pedestalBandBack(-55,55,.92,-13.05,.72);
 pedestalBandFront(26.0,45.8,.92,-61.8,.72); pedestalBandFront(-45.8,-26.0,.92,-61.8,.72);
 pedestalBandBack(26.0,45.8,.92,-13.0,.72); pedestalBandBack(-45.8,-26.0,.92,-13.0,.72);
 pedestalBandFront(-26.0,26.0,.92,-61.8,.72); pedestalBandBack(-45.8,45.8,.92,-77.8,.72);
 for(let side of [-1,1]){
   pedestalBandSide(side*55.05,.92,-13.05,13.05,side<0?1:-1,.72);
   pedestalBandSide(side*45.8,.92,-61.8,-13.0,side<0?1:-1,.72);
   pedestalBandSide(side*26.0,.92,-61.8,-13.0,side>0?1:-1,.72);
   pedestalBandSide(side*45.8,.92,-77.8,-61.8,side,.72);
 }
 addFrontFacade(); addRearFacade(); addSideFacades(); addWingInnerFacades(); addCornerStonework(); addFrontRefinement();
 // façade articulation for the long exterior walls so the shell reads as built masonry, not flat plates.
 const y0=FLOOR_Y[1], y1=16.9;
 for(let x of [-52,-44,-36,-28,-20,-12,-4,4,12,20,28,36,44,52]) facadePilasterFront(x,y0,y1,13.05,.52,.52);
 for(let x of [-52,-44,-36,-28,-20,-12,-4,4,12,20,28,36,44,52]) facadePilasterBack(x,y0,y1,-13.05,.52,.52);
 for(let z of [-10,-4,2,8]){ sidePilaster(55.05,y0,y1,z,-1,.50,.52); sidePilaster(-55.05,y0,y1,z,1,.50,.52); }
 for(let z of [-54,-46,-38,-30,-22,-14]){ sidePilaster(45.8,y0,y1,z,-1,.50,.52); sidePilaster(26.0,y0,y1,z,1,.50,.52); sidePilaster(-45.8,y0,y1,z,1,.50,.52); sidePilaster(-26.0,y0,y1,z,-1,.50,.52); }
 for(let x of [29.5,35.9,42.3,-29.5,-35.9,-42.3]){ facadePilasterFront(x,y0,y1,-13.0,.52,.50); facadePilasterBack(x,y0,y1,-61.8,.52,.50); }
 for(let x of [-22,-14,-6,6,14,22]){ facadePilasterFront(x,y0,y1,-61.8,.52,.50); }
 for(let x of [-42,-34,-26,-18,-10,-2,6,14,22,30,38]) facadePilasterBack(x,y0,y1,-77.8,.52,.50);
 for(let z of [-74,-68,-62]){ sidePilaster(45.8,y0,y1,z,1,.50,.50); sidePilaster(-45.8,y0,y1,z,-1,.50,.50); }
 // extra side stringcourses on deep wings and rear range
 for(let y of [5.45,10.70,15.95]){
   for(let side of [-1,1]){
     trimBandSide(side*55.22,y,0,26.2,.58,.22,ST2);
     trimBandSide(side*46.0,y,-37.3,49.3,.58,.22,ST2);
     trimBandSide(side*25.8,y,-37.3,49.3,.58,.22,ST2);
     trimBandSide(side*46.0,y,-69.8,16.1,.58,.22,ST2);
   }
 }
 // room metadata / zones for selectors and stats
 for(let l=0;l<5;l++){
   let mainXs=[-47,-39,-31,-23,-15,15,23,31,39,47];
   let mainZs=l===1?[8,2,-4]:[7,1,-5];
   for(let x of mainXs) for(let z of mainZs) zone(l,FLOOR_NAMES[l],x,z);
   let wingXs=[-40,-34,34,40], wingZs=[-55,-47,-39,-31,-23,-15];
   for(let x of wingXs) for(let z of wingZs) zone(l,FLOOR_NAMES[l],x,z);
 }
 // Each displayed number is derived from actual generated room-zone markers, not a fabricated target.
}

addMassingAndFloors();
addGrounds();
addShellAndCollision();
addRoofs();
addDetailsAndZones();
addGrassClumps();

return {DETAIL,FLOOR_Y,FLOOR_NAMES,LEVEL_ROOMCOUNTS,ROOMS,collision};
};
