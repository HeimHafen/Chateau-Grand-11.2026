import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export function addClassicalReliefs(T, parent, material, name, placements) {
  const parts=[];
  function relief(x,y,z,width,scale){
    function add(geometry){
      geometry.translate(x,y,z);
      const part=geometry.index?geometry.toNonIndexed():geometry;
      parts.push(part);
      if(part!==geometry)geometry.dispose();
    }
    function leaf(x,y,length,width,angle,depth){
      const geometry=new T.SphereGeometry(1,14,9);
      const p=geometry.attributes.position;
      for(let i=0;i<p.count;i++){
        const u=p.getX(i),v=p.getY(i),w=p.getZ(i);
        p.setXYZ(i,u*width*(.68+.32*(1-v*v))+.19*width*v*v,v*length,w*depth);
      }
      geometry.computeVertexNormals();
      geometry.rotateZ(angle);
      geometry.translate(x,y,.003*scale);
      add(geometry);
    }
    // The half shell is assembled from tapered ribs meeting at one boss.
    for(let rib=-4;rib<=4;rib++){
      const angle=rib*.237;
      const length=scale*(.067-.005*Math.abs(rib));
      const reach=length*.75;
      leaf(Math.sin(angle)*reach,-.048*scale+Math.cos(angle)*reach,length,.024*scale,-angle,.029*scale);
    }
    add(new T.SphereGeometry(1,16,10).scale(.049*scale,.023*scale,.036*scale).translate(0,-.056*scale,0));
    for(const sign of [-1,1]){
      const vectors=[];
      for(let i=0;i<=8;i++){
        const u=i/8;
        vectors.push(new T.Vector3(sign*(.105*scale+width*u),-.024*scale-.071*scale*Math.sin(u*Math.PI*.95),.012*scale));
      }
      add(new T.TubeGeometry(new T.CatmullRomCurve3(vectors),20,.008*scale,6,false));
      for(let i=1;i<=5;i++){
        const u=i/6;
        const at=.105*scale+width*u,y=-.024*scale-.071*scale*Math.sin(u*Math.PI*.95);
        leaf(sign*at,y+.020*scale,.043*scale,.013*scale,sign*.93,.016*scale);
        leaf(sign*(at+.031*scale),y-.014*scale,.034*scale,.011*scale,-sign*.95,.016*scale);
      }
    }
  }
  for(const {x,y,z,width,scale} of placements)relief(x,y,z,width,scale);
  const geometry=mergeGeometries(parts);
  for(const part of parts)part.dispose();
  const object=new T.Mesh(geometry,material);
  object.name=name;
  object.receiveShadow=true;
  parent.add(object);
}

export function addVestibuleReliefs(T,parent,material,portal,panels){
  addClassicalReliefs(T,parent,material,'Roissy_Vestibule_Geschnitzte_Muscheln_und_Lorbeer',[
    {x:0,y:portal.y,z:portal.z,width:.54,scale:1},
    ...panels.x.map(x=>({x,y:panels.y,z:panels.z,width:.32,scale:1.08}))
  ]);
}
