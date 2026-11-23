
(()=>{'use strict';
const C=document.getElementById('world'),gl=C.getContext('webgl2',{antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance',depth:true});
if(!gl){document.querySelector('#error').classList.add('show');document.querySelector('#loading').remove();return;}
const MOBILE=matchMedia('(pointer:coarse)').matches;
const vs=`#version 300 es
precision highp float;
in vec3 aPos;in vec3 aNormal;in vec3 aColor;in float aMat;
uniform mat4 uProj;uniform mat4 uView;
out vec3 vPos;out vec3 vNorm;out vec3 vColor;flat out float vMat;out vec4 vShadow;uniform mat4 uLightVP;
void main(){vPos=aPos;vNorm=aNormal;vColor=aColor;vMat=aMat;vShadow=uLightVP*vec4(aPos,1.0);gl_Position=uProj*uView*vec4(aPos,1.0);}`;
const fs=`#version 300 es
precision highp float;
in vec3 vPos;in vec3 vNorm;in vec3 vColor;flat in float vMat;in vec4 vShadow;
uniform sampler2D uShadow;uniform float uShadowOn;uniform vec3 uEye;uniform vec3 uSun;
uniform sampler2D uStonePattern;uniform sampler2D uRoofPattern;
uniform sampler2D uFacadeNormal;uniform sampler2D uFacadeRoughness;
uniform sampler2D uRoofNormal;uniform sampler2D uRoofRoughness;
uniform sampler2D uSkyReflection;
uniform sampler2D uColumnPattern;uniform sampler2D uColumnNormal;uniform sampler2D uColumnRoughness;
uniform sampler2D uTrimPattern;uniform sampler2D uTrimNormal;uniform sampler2D uTrimRoughness;
uniform sampler2D uGrassAlbedo;
out vec4 outColor;
float hash3(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float sunShadow(vec3 n, vec3 l){
 if(uShadowOn<.5)return 1.0;
 vec3 q=vShadow.xyz/max(vShadow.w,.0001)*.5+.5;
 if(q.x<=0.||q.x>=1.||q.y<=0.||q.y>=1.||q.z<=0.||q.z>=1.)return 1.;
 vec2 stepUV=1./vec2(textureSize(uShadow,0));
 float bias=max(.0009,.004*(1.-max(dot(n,l),0.)));
 float vis=0.;
 for(int a=-1;a<=1;a++)for(int b=-1;b<=1;b++)vis+=step(q.z-bias,texture(uShadow,q.xy+vec2(float(a),float(b))*stepUV).r);
 return mix(.38,1.,vis/9.);
}
void main(){
 vec3 normal=normalize(vNorm),view=normalize(uEye-vPos),sun=normalize(uSun);
 float roughness=.78;
 vec3 albedo=vColor;
 // Triplanar-like world alignment preserves scale across independently modeled facade pieces.
 vec3 an=abs(normal);
 vec2 worldUV=an.z>.53?vPos.xy:an.x>.53?vPos.zy:vPos.xz;
 vec3 tangent=an.z>.53?vec3(1.,0.,0.):an.x>.53?vec3(0.,0.,1.):vec3(1.,0.,0.);
 vec3 bitangent=an.z>.53?vec3(0.,1.,0.):an.x>.53?vec3(0.,1.,0.):vec3(0.,0.,1.);
 if(vMat>9.5 && vMat<10.5){
   // High-frequency turf details in the supplied grass photograph, gently blended with
   // two independent low-frequency density variations to eliminate obvious tiling.
   vec2 uv=vPos.xz*.22;
   vec3 turf=texture(uGrassAlbedo,uv).rgb;
   vec3 turfB=texture(uGrassAlbedo,uv*.41+vec2(.31,.67)).rgb;
   float meadow=noise3(vec3(vPos.x*.026,0.0,vPos.z*.026));
   albedo=mix(turf,turfB,.22)*mix(.89,1.13,meadow);
   roughness=.96;
   // subtle grass carpet normal variation without costly extra sampler
   vec3 detail=vec3(dFdx(turf.r),.0,dFdy(turf.g));
   normal=normalize(vec3(detail.x*.12,1.0,detail.z*.12));
 }else if(vMat>10.5 && vMat<11.5){
   albedo=vColor;
   normal=normalize(vec3(normal.x*.25,.94,normal.z*.25));
   roughness=.99;
 }else if(vMat<.5||(vMat>7.5&&vMat<9.5)){
   bool columnStone=(vMat>7.5&&vMat<8.5);
   bool trimStone=(vMat>8.5&&vMat<9.5);
   vec2 tuv=worldUV*(columnStone?.37:.33);
   vec3 stone=columnStone?texture(uColumnPattern,tuv).rgb:
              trimStone?texture(uTrimPattern,tuv).rgb:texture(uStonePattern,tuv).rgb;
   vec3 bump=columnStone?texture(uColumnNormal,tuv).xyz:
             trimStone?texture(uTrimNormal,tuv).xyz:texture(uFacadeNormal,tuv).xyz;
   float rough=columnStone?texture(uColumnRoughness,tuv).r:
               trimStone?texture(uTrimRoughness,tuv).r:texture(uFacadeRoughness,tuv).r;
   vec2 surface=(bump.xy*2.-1.)*.25;
   normal=normalize(normal+tangent*surface.x+bitangent*surface.y);
   float mineral=noise3(vPos*.37)*.035+noise3(vPos*8.)*.007;
   // Keep real masonry details visible; light stones should not wash out to white.
   albedo=mix(vColor,stone,.84)*(1.+mineral);
   roughness=clamp(.25+rough*.70,.45,.98);
 }else if(vMat<1.5){
   vec2 tuv=worldUV*.31;
   vec3 zinc=texture(uRoofPattern,tuv).rgb;
   vec3 bump=texture(uRoofNormal,tuv).xyz*2.-1.;
   normal=normalize(normal+tangent*bump.x*.18+bitangent*bump.y*.18);
   roughness=clamp(.25+texture(uRoofRoughness,tuv).r*.69,.48,.95);
   albedo=mix(vColor,zinc,.67)*(.96+.035*noise3(vPos*.9));
 }else if(vMat<2.5){
   vec3 reflected=reflect(-view,normal);
   float longitude=atan(reflected.z,reflected.x)/6.2831853+.5;
   float latitude=acos(clamp(reflected.y,-1.,1.))/3.1415926;
   vec3 sky=texture(uSkyReflection,vec2(longitude,latitude)).rgb;
   float fresnel=pow(1.-max(dot(normal,view),0.),5.);
   albedo=mix(albedo*.36,sky,.55+fresnel*.31);
   roughness=.10;
 }else if(vMat<3.5){albedo*=.84+.12*noise3(vPos*15.);roughness=.44;}
 else if(vMat<4.5){albedo*=.81;roughness=.26;}
 else if(vMat<5.5){albedo*=.89+.08*noise3(vPos*2.);roughness=.47;}
 else if(vMat<6.5){albedo*=.79+.10*noise3(vPos*1.7);roughness=.95;}
 else{albedo*=.85;roughness=.85;}
 // Balanced daylight: no excessive flat ambient, no glowing limestone.
 float skylight=.31+.10*max(normal.y,0.);
 float fill=.10*max(dot(normal,normalize(vec3(.58,.33,-.77))),0.);
 float ndl=max(dot(normal,sun),0.);
 float direct=.84*ndl*sunShadow(normal,sun);
 vec3 lightColor=vec3(1.0,.94,.85);
 vec3 radiance=albedo*(vec3(skylight+fill)+lightColor*direct);
 vec3 halfV=normalize(sun+view);
 float specPower=mix(105.,12.,roughness);
 float specular=pow(max(dot(normal,halfV),0.),specPower);
 float metal=(vMat>3.5&&vMat<4.5)?1.:0.;
 radiance+=vec3(1.,.88,.68)*specular*(.025+metal*.26+(1.-roughness)*.09);
 if(vMat>1.5&&vMat<2.5){
   float edge=pow(1.-max(dot(normal,view),0.),3.);
   radiance+=vec3(.09,.12,.16)*edge;
 }
 float distanceToEye=length(uEye-vPos);
 float haze=1.-exp(-pow(max(distanceToEye-72.,0.)/240.,1.85));
 radiance=mix(radiance,vec3(.55,.61,.65),haze*.27);
 // Filmic highlight rolloff: preserves carved shadows, prevents pure-white clipping.
 radiance*=1.01;
 vec3 mapped=radiance/(radiance+vec3(.46));
 mapped=pow(clamp(mapped,0.,1.),vec3(.96));
 outColor=vec4(mapped,1.);
}`;
function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let prog;try{prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));}catch(e){console.error(e);document.querySelector('#error').textContent='3D-Shader-Fehler: '+e.message;document.querySelector('#error').classList.add('show');return;}
gl.useProgram(prog);

// PBR assets from the supplied Max-Game-main.zip are now separate files.
// Host the complete directory in GitHub Pages; opening the HTML alone omits textures.
function loadPbrMap(uri,unit,uniform,fallback){
 const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([...fallback,255]));
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 gl.uniform1i(gl.getUniformLocation(prog,uniform),unit);
 const img=new Image();
 img.onload=()=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
  gl.generateMipmap(gl.TEXTURE_2D);};
 img.onerror=()=>console.warn('Material konnte nicht geladen werden:',uniform);
 img.src=uri;
}
loadPbrMap("assets/materials/facade-limestone-albedo.jpg",1,"uStonePattern",[204, 201, 190]);
loadPbrMap("assets/materials/roof-zinc-albedo.jpg",2,"uRoofPattern",[92, 101, 108]);
loadPbrMap("assets/materials/facade-limestone-normal.jpg",3,"uFacadeNormal",[128, 128, 255]);
loadPbrMap("assets/materials/facade-limestone-roughness.jpg",4,"uFacadeRoughness",[205, 205, 205]);
loadPbrMap("assets/materials/roof-zinc-normal.jpg",5,"uRoofNormal",[128, 128, 255]);
loadPbrMap("assets/materials/roof-zinc-roughness.jpg",6,"uRoofRoughness",[210, 210, 210]);
loadPbrMap("assets/materials/sky-reflection.jpg",7,"uSkyReflection",[120, 130, 155]);
loadPbrMap("assets/materials/column-stone-albedo.jpg",8,"uColumnPattern",[212, 208, 195]);
loadPbrMap("assets/materials/column-stone-normal.jpg",9,"uColumnNormal",[128, 128, 255]);
loadPbrMap("assets/materials/column-stone-roughness.jpg",10,"uColumnRoughness",[214, 214, 214]);
loadPbrMap("assets/materials/trim-limestone-albedo.jpg",11,"uTrimPattern",[211, 204, 193]);
loadPbrMap("assets/materials/trim-limestone-normal.jpg",12,"uTrimNormal",[128, 128, 255]);
loadPbrMap("assets/materials/trim-limestone-roughness.jpg",13,"uTrimRoughness",[214, 214, 214]);
loadPbrMap("assets/materials/grass-albedo.jpg",14,"uGrassAlbedo",[57, 89, 32]);


const P=[],N=[],K=[],M=[];
const STONE=[.73,.69,.61],STLIGHT=[.89,.84,.74],STWHITE=[.96,.91,.83],TRIM=[.85,.79,.68],STDEEP=[.56,.54,.49],SLATE=[.20,.27,.36],SLATEDARK=[.17,.23,.31],GOLD=[.76,.55,.26],BRASS=[.68,.48,.24],GLASS=[.24,.32,.36],GLASSLIGHT=[.43,.52,.55],DARKWOOD=[.26,.14,.085],WOOD=[.40,.25,.14],SAND=[.62,.60,.57],FLOORLIGHT=[.84,.82,.76],FLOORDARK=[.43,.48,.48],WALLIN=[.84,.75,.63],WOODFLOOR=[.35,.23,.15],BLACK=[.12,.13,.14];
let nTriangles=0;
function tri(a,b,c,col,mat=0){if(mat===0&&col===TRIM)mat=9;let nx=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),nz=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let norm=Math.hypot(nx,ny,nz)||1;nx/=norm;ny/=norm;nz/=norm;for(const p of [a,b,c]){P.push(...p);N.push(nx,ny,nz);K.push(...col);M.push(mat);}nTriangles++;}
function quad(a,b,c,d,col,mat=0){tri(a,b,c,col,mat);tri(a,c,d,col,mat)}
function box(x,y,z,w,h,d,col,mat=0){let x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-d/2,z1=z+d/2;quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],col,mat);quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],col,mat);quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],col,mat);quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],col,mat);quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],col,mat);quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],col,mat);}
function column(x,z,ybase,height,radius,col=STLIGHT,seg=12){cylinder(x,ybase+height/2,z,radius,radius,height,col,8,seg);box(x,ybase+.14,z,radius*3,.32,radius*3,STWHITE);box(x,ybase+height-.13,z,radius*3,.27,radius*3,STWHITE);box(x,ybase+height-.40,z,radius*2.3,.15,radius*2.3,TRIM)}
function cylinder(x,y,z,rb,rt,height,col,mat=0,segments=16){let lo=y-height/2,hi=y+height/2;for(let j=0;j<segments;j++){let a=j*Math.PI*2/segments,b=(j+1)*Math.PI*2/segments;let p1=[x+Math.cos(a)*rb,lo,z+Math.sin(a)*rb],p2=[x+Math.cos(b)*rb,lo,z+Math.sin(b)*rb],p3=[x+Math.cos(b)*rt,hi,z+Math.sin(b)*rt],p4=[x+Math.cos(a)*rt,hi,z+Math.sin(a)*rt];quad(p1,p2,p3,p4,col,mat);tri([x,hi,z],p4,p3,col,mat);tri([x,lo,z],p2,p1,col,mat);}}
function sphere(x,y,z,r,col,mat=0,rings=6,seg=10){for(let i=0;i<rings;i++){let a=Math.PI*(i/rings-.5),b=Math.PI*((i+1)/rings-.5);for(let j=0;j<seg;j++){let aa=j*2*Math.PI/seg,bb=(j+1)*2*Math.PI/seg;let p=(phi,th)=>[x+r*Math.cos(phi)*Math.cos(th),y+r*Math.sin(phi),z+r*Math.cos(phi)*Math.sin(th)];quad(p(a,aa),p(a,bb),p(b,bb),p(b,aa),col,mat)}}}
function roof(x,z,w,d,bot,top,inset,col=SLATE){const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,xx0=x0+inset,xx1=x1-inset,zz0=z0+inset,zz1=z1-inset;
quad([x0,bot,z1],[x1,bot,z1],[xx1,top,zz1],[xx0,top,zz1],col,1);quad([x1,bot,z0],[x0,bot,z0],[xx0,top,zz0],[xx1,top,zz0],col,1);quad([x1,bot,z1],[x1,bot,z0],[xx1,top,zz0],[xx1,top,zz1],col,1);quad([x0,bot,z0],[x0,bot,z1],[xx0,top,zz1],[xx0,top,zz0],col,1);box(x,top,z,w-2*inset,.22,d-2*inset,SLATEDARK,1);}
function arch(x,cy,z,rOuter,rInner,col=STONE,segments=22){for(let i=0;i<segments;i++){let a=Math.PI*i/segments,b=Math.PI*(i+1)/segments;let pt=(r,t)=>[x+Math.cos(t)*r,cy+Math.sin(t)*r,z];quad(pt(rOuter,a),pt(rOuter,b),pt(rInner,b),pt(rInner,a),col);}}
function ellipseOutline(x,y,z,rx,ry,col=TRIM,width=.13,segments=36){for(let i=0;i<segments;i++){let a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;let pt=(r,t)=>[x+Math.cos(t)*rx*r,y+Math.sin(t)*ry*r,z];quad(pt(1+width,a),pt(1+width,b),pt(1,b),pt(1,a),col);}}
function orb(x,y,z,r=0.11){sphere(x,y,z,r,GOLD,4,5,8)}
function fence(x0,x1,z,y,h=.8,step=.5){box((x0+x1)/2,y+h,z,x1-x0,.13,.23,STWHITE);box((x0+x1)/2,y,z,x1-x0,.16,.25,STWHITE);for(let x=x0+.1;x<x1;x+=step){cylinder(x,y+h/2,z,.08,.10,h-.14,STLIGHT,0,7);sphere(x,y+h/2,z,.11,STWHITE)}}
function windowAt(x,baseY,z,w=1.7,h=3,dec=1){const top=baseY+h;box(x,baseY+h/2,z,.0+.01+h*0,h,.03,GLASS,2);// glass in front
box(x,baseY+h/2,z+.025,w-.18,h-.21,.05,GLASS,2);box(x,baseY+h/2,z+.09,.09,h,.16,STWHITE);box(x-w/2,baseY+h/2,z+.10,.22,h+.25,.27,TRIM);box(x+w/2,baseY+h/2,z+.10,.22,h+.25,.27,TRIM);box(x,baseY,z+.12,w+.38,.22,.43,STWHITE);box(x,top,z+.1,w+.30,.22,.37,TRIM);box(x,baseY+h*.55,z+.14,w,.10,.13,STWHITE);box(x,baseY+h*.75,z+.14,w,.075,.12,STLIGHT);if(dec){box(x-w*.26,baseY+h/2,z+.15,.065,h-.3,.11,TRIM);box(x+w*.26,baseY+h/2,z+.15,.065,h-.3,.11,TRIM);box(x,top+.22,z+.05,w+.55,.2,.48,STWHITE);}}
function dormer(x,z,y,scale=1){box(x,y,z,1.75*scale,2.07*scale,.8*scale,STLIGHT);box(x,y,z+.45*scale,1.20*scale,1.42*scale,.07*scale,GLASS,2);box(x,y,z+.52*scale,.10*scale,1.4*scale,.12*scale,STWHITE);box(x,y+.13*scale,z+.54*scale,1.25*scale,.08*scale,.12*scale,STWHITE);box(x,y-.98*scale,z+.4*scale,2.0*scale,.18*scale,.92*scale,STWHITE);let yy=y+1.03*scale;tri([x-1.13*scale,yy-.07*scale,z+.68*scale],[x+1.13*scale,yy-.07*scale,z+.68*scale],[x,yy+1.25*scale,z+.68*scale],SLATE,1);tri([x+1.13*scale,yy-.07*scale,z-.42*scale],[x-1.13*scale,yy-.07*scale,z-.42*scale],[x,yy+1.25*scale,z-.42*scale],SLATE,1);}
function ridgeBall(x,y,z){cylinder(x,y,z,.24,.16,.9,TRIM,0,8);sphere(x,y+.5,z,.25,GOLD,4);}

const {DETAIL,FLOOR_Y,FLOOR_NAMES,LEVEL_ROOMCOUNTS,ROOMS,collision}=window.createChateauGeometry({
  MOBILE,box,cylinder,sphere,quad,tri,roof,GLASS,TRIM,GOLD,STWHITE,SLATE,FLOORLIGHT
});
// Alle Meshes sind als ein optimierter statischer Geometriepuffer zusammengefasst.
const sceneVAO=gl.createVertexArray();gl.bindVertexArray(sceneVAO);let buf=gl.createBuffer(),normalBuf=gl.createBuffer(),colorBuf=gl.createBuffer(),matBuf=gl.createBuffer();
function attrib(name,buffer,dat,n){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(dat),gl.STATIC_DRAW);let loc=gl.getAttribLocation(prog,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0)}
attrib('aPos',buf,P,3);attrib('aNormal',normalBuf,N,3);attrib('aColor',colorBuf,K,3);attrib('aMat',matBuf,M,1);
P.length=0;N.length=0;K.length=0;M.length=0;
let locProj=gl.getUniformLocation(prog,'uProj'),locView=gl.getUniformLocation(prog,'uView'),locEye=gl.getUniformLocation(prog,'uEye'),locSun=gl.getUniformLocation(prog,'uSun');gl.uniform3f(locSun,-.45,.94,.53);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
// 3x3 PCF sun shadow pass; gracefully falls back if depth-only FBO fails.
const shadowSize=MOBILE?1024:2048;
let shadowReady=false,shadowProgram=null,shadowFBO=null,shadowTex=null,shadowVAO=null,shadowLightLoc=null,lightVP=null;
function matmul(a,b){let out=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++){out[j*4+i]=0;for(let k=0;k<4;k++)out[j*4+i]+=a[k*4+i]*b[j*4+k];}return out;}
function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
function initShadow(){
 try{
  const sv=`#version 300 es
precision highp float;in vec3 aPos;uniform mat4 uLightVP;
void main(){gl_Position=uLightVP*vec4(aPos,1.0);}`;
  const sf=`#version 300 es
precision highp float;void main(){}`;
  shadowProgram=gl.createProgram();gl.attachShader(shadowProgram,shader(gl.VERTEX_SHADER,sv));gl.attachShader(shadowProgram,shader(gl.FRAGMENT_SHADER,sf));gl.linkProgram(shadowProgram);
  if(!gl.getProgramParameter(shadowProgram,gl.LINK_STATUS))throw Error('shadow shader');
  shadowTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,shadowSize,shadowSize,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  shadowFBO=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFBO);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shadowTex,0);
  gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('depth framebuffer');
  shadowVAO=gl.createVertexArray();gl.bindVertexArray(shadowVAO);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  const pos=gl.getAttribLocation(shadowProgram,'aPos');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);
  shadowLightLoc=gl.getUniformLocation(shadowProgram,'uLightVP');
  lightVP=matmul(ortho(-133,133,-110,110,.1,350),lookAt([-116,164,132],[0,8,-11]));
  shadowReady=true;
 }catch(err){console.warn('Schatten deaktiviert:',err);shadowReady=false;}
 finally{gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.bindVertexArray(sceneVAO);gl.useProgram(prog);}
}
if(DETAIL<=2)initShadow();
gl.useProgram(prog);
gl.uniformMatrix4fv(gl.getUniformLocation(prog,'uLightVP'),false,lightVP||new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));
gl.uniform1f(gl.getUniformLocation(prog,'uShadowOn'),shadowReady?1:0);
if(shadowReady){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shadowTex);gl.uniform1i(gl.getUniformLocation(prog,'uShadow'),0);}
let shadowHasRendered=false;
function drawShadow(){
 gl.bindFramebuffer(gl.FRAMEBUFFER,shadowFBO);gl.viewport(0,0,shadowSize,shadowSize);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.useProgram(shadowProgram);gl.bindVertexArray(shadowVAO);
 gl.uniformMatrix4fv(shadowLightLoc,false,lightVP);
 gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.2,2.8);
 gl.drawArrays(gl.TRIANGLES,0,nTriangles*3);
 gl.disable(gl.POLYGON_OFFSET_FILL);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
 gl.viewport(0,0,C.width,C.height);gl.bindVertexArray(sceneVAO);gl.useProgram(prog);
}

function vadd(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}function vsub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function vn(a){let l=Math.hypot(...a)||1;return a.map(t=>t/l)}
function perspective(fov,aspect,near,far){let f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,(2*far*near)*nf,0])}
function lookAt(eye,target,up=[0,1,0]){let z=vn(vsub(eye,target)),x=vn(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])}

let mode='orbit',yaw=0,pitch=0,walkPos=[0,.12,29],orbitYaw=.16,orbitPitch=.25,orbitRadius=(MOBILE?175:156),orbitTarget=[0,13,-24],activePointers=new Map(),joystick={x:0,y:0},key={},lastTime=0;
let currentLevel=1,inPalace=false;
const sceneTitle=document.querySelector('#sceneTitle'),bigTitle=document.querySelector('#bigTitle'),description=document.querySelector('#description'),walkButton=document.querySelector('#walkButton'),enterButton=document.querySelector('#enterButton'),orbitButton=document.querySelector('#orbitButton'),stick=document.querySelector('#stickOuter'),knob=document.querySelector('#stickInner'),lookTouch=document.querySelector('#lookTouch'),loading=document.querySelector('#loading');
const floorParent=document.querySelector('#floors .floorBtns');
document.querySelector('#floorToggle').onclick=()=>{const menu=document.querySelector('#floors');const expanded=menu.classList.toggle('expanded');document.querySelector('#floorToggle').setAttribute('aria-expanded',String(expanded));};
function updateFloorButtons(){[...floorParent.children].forEach((b,i)=>{b.classList.toggle('selected',i===currentLevel);b.setAttribute('aria-pressed',i===currentLevel?'true':'false')});document.querySelector('#roomCount').textContent=LEVEL_ROOMCOUNTS[currentLevel]+' Räume';}
FLOOR_NAMES.forEach((name,i)=>{const b=document.createElement('button');b.textContent=['UG','EG','1. OG','2. OG','DG'][i];b.title=name+' · '+LEVEL_ROOMCOUNTS[i]+' Räume';b.setAttribute('aria-label',name);b.onclick=()=>{document.querySelector('#floors').classList.remove('expanded');document.querySelector('#floorToggle').setAttribute('aria-expanded','false');currentLevel=i;inPalace=true;walkPos=[i>=2?20:0,FLOOR_Y[i],-0.85];yaw=0;pitch=0;updateFloorButtons();sceneTitle.textContent=name.toUpperCase();bigTitle.textContent=name+' erkunden.';description.textContent=LEVEL_ROOMCOUNTS[i]+' Räume, über verbundene Flure erreichbar.'};floorParent.appendChild(b)});
function headingTitle(isInside){sceneTitle.textContent=isInside?'SCHLOSS ERKUNDEN':'DEIN EIGENER RUNDGANG';bigTitle.textContent=isInside?FLOOR_NAMES[currentLevel]+'.':'Die große Außenhülle.';description.textContent=isInside?LEVEL_ROOMCOUNTS[currentLevel]+' Räume auf dieser Ebene. Die Innenausstattung wird noch entwickelt.':'Freier Rundgang um das monumentale Château.'}
function setMode(m,inside=false){mode=m;document.body.classList.toggle('walking',m==='walk');orbitButton.setAttribute('aria-pressed',m==='orbit');orbitButton.textContent=m==='orbit'?'◉ Außenansicht':'◎ Freier Rundgang';if(m==='walk'){document.querySelector('#floors').classList.remove('expanded');inPalace=inside;currentLevel=1;if(inside){walkPos=[0,FLOOR_Y[currentLevel],7.1];yaw=0;pitch=-.03;}else{walkPos=[0,.12,29];yaw=0;pitch=-.03;}updateFloorButtons();headingTitle(inside);stick.style.display=MOBILE?'block':'none';lookTouch.style.display=MOBILE?'block':'none';walkButton.textContent='↶ Außenansicht';walkButton.onclick=()=>setMode('orbit');}else{stick.style.display='none';lookTouch.style.display='none';sceneTitle.textContent='GRAND CHÂTEAU';bigTitle.textContent='Ein ganzes Schloss.';description.textContent='Neue Außenarchitektur mit verbundenen Geschosswänden, Mansarddächern und geschlossenem Innenhof.';walkButton.textContent='▶ Erkunden';walkButton.onclick=()=>setMode('walk',false)}}
walkButton.onclick=()=>setMode('walk',false);enterButton.onclick=()=>setMode('walk',true);orbitButton.onclick=()=>setMode(mode==='orbit'?'walk':'orbit');document.querySelector('#resetButton').onclick=()=>{orbitYaw=.16;orbitPitch=.25;orbitRadius=MOBILE?175:156;orbitTarget=[0,13,-24];setMode('orbit')};
function clamp(x,a,b){return Math.min(Math.max(x,a),b)}
function getGround(x,z){return inPalace?FLOOR_Y[currentLevel]:.12;}
// Footprint boundaries prevent leaving upper floors and seeing through unloaded roofs.
function insideFootprint(x,z){
 const main=(Math.abs(x)<55.5 && z>-13.0 && z<13.15);
 const wings=((x>25.2&&x<45.9)||(x< -25.2&&x> -45.9))&&z>=-61.9&&z<=-12.7;
 const portico=(currentLevel===1 && Math.abs(x)<11.9 && z>=13.1 && z<19.6);
 const rear=(Math.abs(x)<45.85 && z>=-77.8 && z<=-60.8);
 return main||wings||portico||rear;
}
function collides(xx,zz){if(!inPalace)return false;let foot=FLOOR_Y[currentLevel],rad=.26;for(let c of collision){if(foot+1.15<c[4]||foot+.6>c[5])continue;if(xx+rad>c[0]&&xx-rad<c[1]&&zz+rad>c[2]&&zz-rad<c[3])return true;}return false;}
function move(dt){let forward=(key['w']||key['arrowup']?1:0)-(key['s']||key['arrowdown']?1:0)-joystick.y,right=(key['d']||key['arrowright']?1:0)-(key['a']||key['arrowleft']?1:0)+joystick.x;let mag=Math.hypot(forward,right);if(mag<.025)return;forward/=Math.max(1,mag);right/=Math.max(1,mag);let speed=key['shift']?10:5.6;let dx=(Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed*dt,dz=(-Math.cos(yaw)*forward+Math.sin(yaw)*right)*speed*dt;
let xx=clamp(walkPos[0]+dx,-115,115),zz=clamp(walkPos[2]+dz,-110,100);
if(!inPalace&&xx<6&&xx>-6&&zz<17.5&&zz>12.5){inPalace=true;currentLevel=1;updateFloorButtons();}
if(!inPalace || (insideFootprint(xx,walkPos[2])&&!collides(xx,walkPos[2])))walkPos[0]=xx;
if(!inPalace || (insideFootprint(walkPos[0],zz)&&!collides(walkPos[0],zz)))walkPos[2]=zz;
walkPos[1]+=(getGround(walkPos[0],walkPos[2])-walkPos[1])*Math.min(dt*9,1);
if(inPalace)headingTitle(true);
}
function resize(){let dpr=Math.min(devicePixelRatio||1,MOBILE?1.0:1.6),w=innerWidth,h=innerHeight;if(C.width!==Math.round(w*dpr)||C.height!==Math.round(h*dpr)){C.width=Math.round(w*dpr);C.height=Math.round(h*dpr);gl.viewport(0,0,C.width,C.height)}}
function frame(time){let dt=clamp((time-lastTime)*.001,0,.05);lastTime=time;resize();if(mode==='walk')move(dt);
let eye,target;if(mode==='orbit'){eye=[orbitTarget[0]+Math.sin(orbitYaw)*Math.cos(orbitPitch)*orbitRadius,orbitTarget[1]+Math.sin(orbitPitch)*orbitRadius,orbitTarget[2]+Math.cos(orbitYaw)*Math.cos(orbitPitch)*orbitRadius];target=orbitTarget;}else{eye=[walkPos[0],walkPos[1]+1.75,walkPos[2]];target=vadd(eye,[Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)]);}
if(shadowReady&&!shadowHasRendered){drawShadow();shadowHasRendered=true;}let fov=(mode==='orbit'?(MOBILE?53:52):74)*Math.PI/180;gl.uniformMatrix4fv(locProj,false,perspective(fov,C.width/C.height,.1,500));gl.uniformMatrix4fv(locView,false,lookAt(eye,target));gl.uniform3fv(locEye,new Float32Array(eye));gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,nTriangles*3);requestAnimationFrame(frame)}
// Pointersteuerung: ein Finger Orbit / Umschauen, zwei Finger zoomen; links virtueller Steuerknüppel.
let prevPinch=0;
C.addEventListener('pointerdown',e=>{C.setPointerCapture(e.pointerId);activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});prevPinch=0});
C.addEventListener('pointermove',e=>{let old=activePointers.get(e.pointerId);if(!old)return;activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activePointers.size===2&&mode==='orbit'){let pts=[...activePointers.values()],d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(prevPinch)orbitRadius=clamp(orbitRadius*(prevPinch/d),35,300);prevPinch=d;return;}let dx=e.clientX-old.x,dy=e.clientY-old.y;if(mode==='orbit'){orbitYaw-=dx*.007;orbitPitch=clamp(orbitPitch+dy*.0055,-.25,1.15)}else{yaw+=dx*.004;pitch=clamp(pitch-dy*.0034,-1.3,1.3)}});
function release(e){activePointers.delete(e.pointerId);prevPinch=0}C.addEventListener('pointerup',release);C.addEventListener('pointercancel',release);
C.addEventListener('wheel',e=>{e.preventDefault();if(mode==='orbit')orbitRadius=clamp(orbitRadius+e.deltaY*.08,35,300)},{passive:false});
addEventListener('keydown',e=>{key[e.key.toLowerCase()]=true;if('wasdWASD '.includes(e.key)||e.key.startsWith('Arrow'))e.preventDefault();if(e.key==='Escape')setMode('orbit')});addEventListener('keyup',e=>key[e.key.toLowerCase()]=false);addEventListener('blur',()=>{key={};joystick.x=joystick.y=0});
let joystickId=null;function updateStick(e){let r=stick.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,mag=Math.hypot(x,y),limit=r.width*.31,scale=Math.min(1,limit/(mag||1));joystick.x=x*scale/limit;joystick.y=y*scale/limit;knob.style.transform=`translate(${joystick.x*limit}px,${joystick.y*limit}px)`;}
stick.addEventListener('pointerdown',e=>{e.preventDefault();joystickId=e.pointerId;stick.setPointerCapture(e.pointerId);updateStick(e)});stick.addEventListener('pointermove',e=>{if(e.pointerId===joystickId)updateStick(e)});function endStick(e){if(e.pointerId===joystickId){joystickId=null;joystick={x:0,y:0};knob.style.transform='translate(0,0)'}}stick.addEventListener('pointerup',endStick);stick.addEventListener('pointercancel',endStick);
let lookId=null,lookPrev;lookTouch.addEventListener('pointerdown',e=>{lookId=e.pointerId;lookPrev=[e.clientX,e.clientY];lookTouch.setPointerCapture(e.pointerId)});lookTouch.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;let dx=e.clientX-lookPrev[0],dy=e.clientY-lookPrev[1];yaw+=dx*.0065;pitch=clamp(pitch-dy*.005,-1.1,1.1);lookPrev=[e.clientX,e.clientY]});lookTouch.addEventListener('pointerup',()=>lookId=null);lookTouch.addEventListener('pointercancel',()=>lookId=null);

function setCameraPreset(type){setMode('orbit');orbitTarget=[0,14,-8];if(type==='front'){orbitYaw=0;orbitPitch=.12;orbitRadius=MOBILE?180:154;}if(type==='roof'){orbitYaw=.55;orbitPitch=.48;orbitRadius=MOBILE?200:174;}if(type==='side'){orbitYaw=1.03;orbitPitch=.22;orbitRadius=MOBILE?214:184;}}
document.querySelector('#frontButton').addEventListener('click',()=>setCameraPreset('front'));
document.querySelector('#roofButton').addEventListener('click',()=>setCameraPreset('roof'));
document.querySelector('#sideButton').addEventListener('click',()=>setCameraPreset('side'));
const statsNode=document.querySelector('#modelStats');statsNode.textContent=nTriangles.toLocaleString('de-DE')+' Dreiecke';
let fpsFrames=0,fpsStarted=performance.now();const oldFrame=frame;
// A small, inexpensive telemetry update avoids interfering with the render loop.
function reportFrame(){fpsFrames++;let t=performance.now();if(t-fpsStarted>1100){let fps=Math.round(fpsFrames*1000/(t-fpsStarted));statsNode.textContent=nTriangles.toLocaleString('de-DE')+' △ · '+fps+' FPS';fpsFrames=0;fpsStarted=t;}requestAnimationFrame(reportFrame);}
requestAnimationFrame(reportFrame);
document.querySelector('#qualityButton').textContent=DETAIL===3?'◇ Ultra':DETAIL===1?'◇ Mobil':'◇ Hoch';
document.querySelector('#qualityButton').addEventListener('click',()=>{const q=DETAIL===3?'high':DETAIL===1?'high':MOBILE?'mobile':'ultra';location.search='?quality='+q;});
const photoPane=document.querySelector('#captureDialog'),photo=document.querySelector('#captureImage'),savePhoto=document.querySelector('#saveCapture');
document.querySelector('#captureButton').addEventListener('click',()=>{
 // Composite actual rendered WebGL frame with matching sky gradient, to keep sky in photos.
 try{let cv=document.createElement('canvas');cv.width=Math.min(C.width,1800);cv.height=Math.round(C.height*cv.width/C.width);let ctx=cv.getContext('2d');
 let bg=ctx.createLinearGradient(0,0,0,cv.height);bg.addColorStop(0,'#7587a0');bg.addColorStop(.39,'#c0b7b4');bg.addColorStop(.62,'#f4d9b6');bg.addColorStop(1,'#aeb8ac');ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(C,0,0,cv.width,cv.height);
 const uri=cv.toDataURL('image/png');photo.src=uri;savePhoto.href=uri;photoPane.classList.add('open');photoPane.setAttribute('aria-hidden','false');
 }catch(err){console.warn(err);alert('Das Foto konnte hier nicht gespeichert werden. Bitte nutze die Screenshot-Funktion deines Geräts.');}
});
document.querySelector('#quickCaptureButton').addEventListener('click',()=>document.querySelector('#captureButton').click());
document.querySelector('#closeCapture').addEventListener('click',()=>{photoPane.classList.remove('open');photoPane.setAttribute('aria-hidden','true');});

setTimeout(()=>{loading.classList.add('done');setTimeout(()=>loading.remove(),400)},450);requestAnimationFrame(frame);
window.__CHATEAU_TEST={triangles:nTriangles,version:'5.7-architecture-revision',quality:DETAIL===3?'ultra':DETAIL===1?'mobile':'high',setMode,getGround,setCameraPreset,LEVEL_ROOMCOUNTS,rooms:ROOMS.length,get level(){return currentLevel;}};
})();
