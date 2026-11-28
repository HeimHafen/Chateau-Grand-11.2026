import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export function buildVestibuleLantern(T, parent, x, ceiling, z) {
  const lantern = new T.Group();
  lantern.name = 'Roissy_Vestibule_Bronzelaterne';
  lantern.position.set(x, ceiling, z);
  parent.add(lantern);

  const bronze = new T.MeshStandardMaterial({color:0x514135, metalness:.72, roughness:.43, envMapIntensity:.8});
  const edges = new T.MeshStandardMaterial({color:0xa78960, metalness:.63, roughness:.43});
  const wax = new T.MeshStandardMaterial({color:0xe7d5b5, roughness:.57});
  const flame = new T.MeshStandardMaterial({color:0xffd6a0, emissive:0xffa652, emissiveIntensity:1.53});
  const glass = new T.MeshPhysicalMaterial({
    color:0xe8edf0, roughness:.16, metalness:0, clearcoat:.23,
    transparent:true, opacity:.11, depthWrite:false, side:T.DoubleSide, forceSinglePass:true
  });
  const parts = new Map();
  function add(material, geo) {
    if (!parts.has(material)) parts.set(material, []);
    parts.get(material).push(geo.index ? geo.toNonIndexed() : geo);
    if (geo.index) geo.dispose();
  }
  function rod(material, from, to, radius) {
    const direction = to.clone().sub(from);
    const geo = new T.CylinderGeometry(radius, radius, direction.length(), 10);
    geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0), direction.normalize()));
    geo.translate(...from.clone().lerp(to,.5).toArray());
    add(material, geo);
  }
  const point = (i, radius, y) => {
    const angle = (i + .5) * Math.PI / 3;
    return new T.Vector3(radius * Math.sin(angle), y, radius * Math.cos(angle));
  };
  const crown = -.65, shoulder = -.91, foot = -1.65, base = -1.73;
  add(bronze,new T.CylinderGeometry(.18,.125,.075,32).translate(0,-.065,0));
  add(edges,new T.CylinderGeometry(.138,.138,.022,32).translate(0,-.109,0));
  for(let i=0;i<5;i++){
    const link = new T.TorusGeometry(.052,.012,8,20);
    link.scale(.74,1.24,1);
    link.rotateY(i*Math.PI/2);
    link.translate(0,-.148-i*.106,0);
    add(bronze,link);
  }
  add(bronze,new T.SphereGeometry(.072,16,10).translate(0,crown,0));
  for(let i=0;i<6;i++){
    const high = point(i,.43,shoulder), low = point(i,.36,foot);
    const nextHigh = point(i+1,.43,shoulder), nextLow = point(i+1,.36,foot);
    rod(bronze,point(i,.068,crown),high,.022);
    rod(bronze,high,low,.026);
    rod(bronze,low,point(i,.13,base),.018);
    rod(bronze,high,nextHigh,.024);
    rod(bronze,low,nextLow,.024);
    rod(edges,point(i,.436,shoulder-.032),point(i+1,.436,shoulder-.032),.009);
    rod(edges,point(i,.36,foot+.035),point(i+1,.36,foot+.035),.009);

    const pane = new T.BufferGeometry();
    pane.setAttribute('position',new T.Float32BufferAttribute(
      [high,low,nextLow,high,nextLow,nextHigh].flatMap(vertex=>vertex.toArray()),3));
    pane.computeVertexNormals();
    const uv = [0,1,0,0,1,0,0,1,1,0,1,1];
    pane.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    add(glass,pane);
  }
  add(bronze,new T.CylinderGeometry(.14,.085,.055,24).translate(0,base,0));
  add(edges,new T.SphereGeometry(.053,16,10).translate(0,base-.068,0));
  for(let i=0;i<3;i++){
    const candle = point(i*2,.205,-1.40);
    rod(bronze,new T.Vector3(0,-1.57,0),candle,.017);
    add(edges,new T.CylinderGeometry(.057,.037,.036,20).translate(candle.x,-1.395,candle.z));
    add(wax,new T.CylinderGeometry(.024,.025,.23,16).translate(candle.x,-1.263,candle.z));
    add(flame,new T.SphereGeometry(1,12,10).scale(.021,.058,.021).translate(candle.x,-1.103,candle.z));
  }
  for (const [material, geometries] of parts) {
    const mesh = new T.Mesh(mergeGeometries(geometries),material);
    lantern.add(mesh);
    mesh.castShadow = material === bronze || material === edges;
    mesh.receiveShadow = material !== glass && material !== flame;
    for (const geo of geometries) geo.dispose();
  }
  return {name:lantern.name, position:[x,ceiling-1.16,z], color:0xffd8a2, intensity:5.1, distance:3.9};
}
