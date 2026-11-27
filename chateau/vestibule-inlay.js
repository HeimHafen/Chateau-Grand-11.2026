export function installVestibuleInlay(T, parent, floorY, centreZ, umberMap) {
  const common = {roughness:.79, metalness:0, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-1};
  const brown = new T.MeshStandardMaterial({...common, name:'Vestibule · Braunmarmor', color:0xd9c4b0, map:umberMap});
  const taupe = new T.MeshStandardMaterial({...common, name:'Vestibule · Rauchbeiger Kalkstein', color:0x958571});
  const ivory = new T.MeshStandardMaterial({...common, name:'Vestibule · Elfenbeinfarbener Stein', color:0xe0ceb1});
  const disc = new T.MeshStandardMaterial({...common, name:'Vestibule · Kalksteinplatte der Rosette', color:0xd5bf9f});
  const parts = new Map([[brown, []],[taupe, []],[ivory, []],[disc, []]]);
  const cutRect = (w,d,c) => [
    [-w/2+c,-d/2],[w/2-c,-d/2],[w/2,-d/2+c],[w/2,d/2-c],
    [w/2-c,d/2],[-w/2+c,d/2],[-w/2,d/2-c],[-w/2,-d/2+c]
  ];
  const radial = (radius,count,turn=0) => Array.from({length:count},(_,i)=>{
    const a=(i/count+turn)*Math.PI*2;
    return [Math.sin(a)*radius,Math.cos(a)*radius];
  });
  function piece(material, outline, ...holes) {
    const polygon = outline.map(([x,z])=>new T.Vector2(x,-z));
    const cuts = holes.map(hole=>hole.map(([x,z])=>new T.Vector2(x,-z)));
    const vertices = [...polygon,...cuts.flat()];
    for(const face of T.ShapeUtils.triangulateShape(polygon,cuts)){
      const [a,b,c] = face.map(i=>vertices[i]);
      if((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)<0)face.reverse();
      for(const i of face)parts.get(material).push(vertices[i].x,floorY,centreZ-vertices[i].y);
    }
  }
  piece(taupe,cutRect(4.06,3.86,.38),cutRect(3.92,3.72,.34));
  piece(brown,cutRect(3.92,3.72,.34),cutRect(3.67,3.47,.27));
  piece(ivory,cutRect(3.67,3.47,.27),cutRect(3.61,3.41,.25));

  piece(brown,radial(1.30,48),radial(1.235,48));
  piece(taupe,radial(1.235,48),radial(1.195,48));
  piece(ivory,radial(1.195,48),radial(1.158,48));
  const spokes=[];
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    const point = (r,u)=>[Math.sin(angle)*r+Math.cos(angle)*u,Math.cos(angle)*r-Math.sin(angle)*u];
    const reach=i%2===0?1.042:.756,half=i%2===0?.134:.095;
    const outline=[point(.301,0),point(.56,half),point(reach,0),point(.56,-half)];
    spokes.push(outline);
    piece(i%2===0?brown:taupe,outline);
  }
  const centre=radial(.29,8,1/16);
  piece(disc,radial(1.158,48),centre,...spokes);
  piece(brown,centre,radial(.227,8,1/16));
  piece(ivory,radial(.227,8,1/16));
  for(const [material,positions] of parts){
    const geometry=new T.BufferGeometry();
    const uv=[];
    for(let i=0;i<positions.length;i+=3)uv.push(positions[i]/1.42,positions[i+2]/1.42);
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geometry.computeVertexNormals();
    const mesh=new T.Mesh(geometry,material);
    mesh.name='Roissy_Vestibule_Bodenintarsie_'+material.name;
    mesh.receiveShadow=true;
    parent.add(mesh);
  }
}
