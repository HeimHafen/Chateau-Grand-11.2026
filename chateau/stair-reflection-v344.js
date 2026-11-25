// A low-resolution, view-dependent reflection of the actual room on its polished floor.
// Only runs in the ground-floor stair hall; no external dependencies or fake photo overlay.
export function installStairReflection(T,renderer,scene,root, mobile){
 const y=1.089;const target=new T.WebGLRenderTarget(mobile?320:640,mobile?400:640,{depthBuffer:true,stencilBuffer:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter,type:T.UnsignedByteType});
 const matrix=new T.Matrix4(),view=new T.PerspectiveCamera(),plane=new T.Plane(new T.Vector3(0,1,0),-y+.005);
 const mat=new T.ShaderMaterial({name:'Roissy_Marmor_Raumreflexion',transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-4,uniforms:{reflected:{value:target.texture},reflectionMatrix:{value:matrix},eye:{value:new T.Vector3()}},vertexShader:`uniform mat4 reflectionMatrix; varying vec4 vProjected; varying vec3 vWorld; void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vProjected=reflectionMatrix*w;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform sampler2D reflected;uniform vec3 eye;varying vec4 vProjected;varying vec3 vWorld;void main(){if(vProjected.w<=0.)discard;vec2 uv=vProjected.xy/vProjected.w*.5+.5;if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))discard;vec3 c=texture2D(reflected,uv).rgb;float grazing=1.-abs(normalize(eye-vWorld).y);gl_FragColor=vec4(c,.09+.25*pow(grazing,2.));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
 const overlays=[];root.traverse(o=>{if(o.isMesh&&/^Roissy_Interiorboden_eg:stair(Stone|Border)$/.test(o.name)){const m=new T.Mesh(o.geometry,mat);m.name='Roissy_Marmorreflexion_'+o.name;m.visible=false;m.renderOrder=3;m.frustumCulled=false;overlays.push(m);}});for(const m of overlays)root.add(m);
 const look=new T.Vector3(),up=new T.Vector3(),lastPos=new T.Vector3(Infinity,0,0),lastDir=new T.Quaternion();let tick=0,ready=false,disabled=false,lastRender=-Infinity,lastAspect=0;
 const hide=()=>{for(const o of overlays)o.visible=false;};
 return {update(camera,enabled,ms){
   const p=camera.position; if(disabled||!enabled||p.x<-13.23||p.x>-6.7||p.z<-11.3||p.z>11.4||p.y<y+.15||p.y>5.35){hide();ready=false;return;}
   mat.uniforms.eye.value.copy(p);tick++;
   const moved=lastPos.distanceToSquared(p)>.0004||lastDir.angleTo(camera.quaternion)>.012||camera.aspect!==lastAspect;
   if(ready&&(!moved&&ms-lastRender<700||tick%(mobile?4:2)!==0)){for(const o of overlays)o.visible=true;return;}
   hide();camera.updateMatrixWorld();camera.getWorldDirection(look);look.y=-look.y;up.set(0,1,0).applyQuaternion(camera.quaternion);up.y=-up.y;
   view.copy(camera,false);view.position.set(p.x,2*y-p.y,p.z);view.up.copy(up);view.lookAt(view.position.clone().add(look));view.updateMatrixWorld();view.updateProjectionMatrix();matrix.multiplyMatrices(view.projectionMatrix,view.matrixWorldInverse);
   const oldTarget=renderer.getRenderTarget(),oldPlanes=renderer.clippingPlanes,oldAuto=renderer.autoClear,oldShadow=renderer.shadowMap.needsUpdate;
   try{renderer.clippingPlanes=[plane];renderer.autoClear=true;renderer.setRenderTarget(target);renderer.render(scene,view);ready=true;lastPos.copy(p);lastDir.copy(camera.quaternion);lastRender=ms;lastAspect=camera.aspect;}
   catch(e){console.warn('Optionale Marmorreflexion deaktiviert',e);disabled=true;ready=false;}
   finally{renderer.setRenderTarget(oldTarget);renderer.clippingPlanes=oldPlanes;renderer.autoClear=oldAuto;renderer.shadowMap.needsUpdate=oldShadow;}
   for(const o of overlays)o.visible=ready;
 }};
}
