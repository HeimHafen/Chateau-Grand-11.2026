import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export function createEscalierSoffits(T, parent, materials) {
  const pieces = new Map();
  function layer(material, corners, yAt) {
    const positions = [];
    for (const [x,z,depth] of corners) positions.push(x,yAt(z)-depth,z);
    const g = new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(corners.flatMap(([x,z])=>[x/1.4,z/1.4]),2));
    g.computeVertexNormals();
    if (!pieces.has(material)) pieces.set(material,[]);
    pieces.get(material).push(g);
  }
  function rectangle(x,z,w,d,clip,depth) {
    return [
      [x-w/2+clip,z-d/2,depth],[x+w/2-clip,z-d/2,depth],
      [x+w/2,z-d/2+clip,depth],[x+w/2,z+d/2-clip,depth],
      [x+w/2-clip,z+d/2,depth],[x-w/2+clip,z+d/2,depth],
      [x-w/2,z+d/2-clip,depth],[x-w/2,z-d/2+clip,depth]
    ];
  }
  function ring(material, outer, inner, yAt) {
    for (let i=0;i<outer.length;i++) {
      const j=(i+1)%outer.length;
      layer(material,[outer[i],outer[j],inner[j],outer[i],inner[j],inner[i]],yAt);
    }
  }
  function panel(x,z,w,d,yAt) {
    const outer=rectangle(x,z,w,d,.126,.003);
    const lightEdge=rectangle(x,z,w-.071,d-.071,.106,.035);
    const shadowEdge=rectangle(x,z,w-.123,d-.123,.081,.035);
    const inset=rectangle(x,z,w-.170,d-.170,.066,.012);
    ring(materials.edge,outer,lightEdge,yAt);
    ring(materials.edge,lightEdge,shadowEdge,yAt);
    ring(materials.rebate,shadowEdge,inset,yAt);
    const triangles=[];
    for(let i=1;i<inset.length-1;i++)triangles.push(inset[0],inset[i],inset[i+1]);
    layer(materials.panel,triangles,yAt);
  }
  function finish() {
    for(const [material,parts] of pieces) {
      const mesh=new T.Mesh(mergeGeometries(parts),material);
      mesh.name='Roissy_GrandEscalier_Untersicht_'+material.name;
      mesh.receiveShadow=true;
      parent.add(mesh);
      for(const part of parts)part.dispose();
    }
  }
  return {panel,finish};
}
