export function installVestibuleInlay(T, parent, floorY, room, limestone, umberMap) {
  const centreZ = room.medallionZ;
  const common = {roughness:.72, metalness:0};
  const stone = (name, color, map=null) => new T.MeshStandardMaterial({
    ...common, name:'Vestibule · '+name, color, map
  });
  const brown = stone('Braunmarmor',0xd6c0ac,umberMap);
  const green = stone('Grüner Marmor',0x69796a,limestone.map);
  const taupe = stone('Rauchbeiger Kalkstein',0x96846f,limestone.map);
  const ivory = stone('Elfenbeinfarbener Stein',0xe1d3bc,limestone.map);
  const grout = stone('Feine Steinfuge',0x756859);
  const disc = stone('Kalksteinplatte der Rosette',0xd8c4a5,limestone.map);
  const parts = new Map([limestone,brown,green,taupe,ivory,grout,disc].map(m=>[m,[]]));
  const cutRect = (w,d,c,z=0) => [
    [-w/2+c,z-d/2],[w/2-c,z-d/2],[w/2,z-d/2+c],[w/2,z+d/2-c],
    [w/2-c,z+d/2],[-w/2+c,z+d/2],[-w/2,z+d/2-c],[-w/2,z-d/2+c]
  ];
  const rectangle = (w,d,z) => [[-w/2,z-d/2],[w/2,z-d/2],[w/2,z+d/2],[-w/2,z+d/2]];
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
  // The perimeter bands and the medallion replace the corresponding
  // limestone polygons. Every face has the same finished height.
  const {width,depth,z}=room;
  const border = inset => rectangle(width-2*inset,depth-2*inset,z-centreZ);
  const outer = cutRect(4.06,3.86,.38);
  piece(limestone,border(0),border(.45));
  piece(brown,border(.45),border(.51));
  piece(limestone,border(.51),border(.65));
  piece(taupe,border(.65),border(.675));
  piece(limestone,border(.675),outer);
  piece(grout,outer,cutRect(4.048,3.848,.376));
  piece(taupe,cutRect(4.048,3.848,.376),cutRect(3.95,3.75,.348));
  piece(brown,cutRect(3.95,3.75,.348),cutRect(3.72,3.52,.295));
  piece(ivory,cutRect(3.72,3.52,.295),cutRect(3.685,3.485,.286));
  piece(limestone,cutRect(3.685,3.485,.286),radial(1.311,64));
  piece(grout,radial(1.311,64),radial(1.30,64));
  piece(brown,radial(1.30,64),radial(1.23,64));
  piece(ivory,radial(1.23,64),radial(1.201,64));
  piece(green,radial(1.201,64),radial(1.162,64));
  const spokes=[];
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    const point = (r,u)=>[Math.sin(angle)*r+Math.cos(angle)*u,Math.cos(angle)*r-Math.sin(angle)*u];
    const reach=i%2===0?1.042:.756,half=i%2===0?.134:.095;
    const outline=[point(.301,0),point(.56,half),point(reach,0),point(.56,-half)];
    spokes.push(outline);
    piece(i%2===0?brown:green,[outline[0],outline[1],outline[2]]);
    piece(i%2===0?taupe:ivory,[outline[0],outline[2],outline[3]]);
  }
  const centre=radial(.29,8,1/16);
  piece(disc,radial(1.162,64),centre,...spokes);
  piece(brown,centre,radial(.227,8,1/16));
  piece(ivory,radial(.227,8,1/16));
  for(const [material,positions] of parts){
    const geometry=new T.BufferGeometry();
    const uv=[];
    const tile=material===limestone?3.2:1.53;
    for(let i=0;i<positions.length;i+=3)uv.push(positions[i]/tile,-positions[i+2]/tile);
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geometry.computeVertexNormals();
    const mesh=new T.Mesh(geometry,material);
    mesh.name=material===limestone?'Roissy_Vestibule_Natursteinboden_Grossformat':'Roissy_Vestibule_Bodenintarsie_'+material.name;
    mesh.receiveShadow=true;
    parent.add(mesh);
  }
}
