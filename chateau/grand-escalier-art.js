import {fitHallModel} from './stair-portal.js?v=roissy379';

const frontBay = -13.80;

export function installStairArt(THREE, layers, materials, OG, models, collisionWalls) {
  const lights = [];
  const boundsOf = object => new THREE.Box3().setFromObject(object, true);
  const {stone, brass, bronze} = materials;

  function piece(name, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
  }

  if (models.triton) {
    const relief = fitHallModel(THREE, models.triton, [frontBay, 3.78, 0], .92, Math.PI,
      'Roissy_Treppensaal_Tritonrelief');
    const bounds = boundsOf(relief);
    const size = bounds.getSize(new THREE.Vector3());
    const faceZ = 11.201;
    relief.position.z = faceZ - bounds.max.z + .016;

    // The rear of the panel sits in the plaster and the polished edges
    // catch the light around the rough outline of the original relief.
    const w = size.x + .17, h = size.y + .13, chamfer = .017;
    const panel = new THREE.Shape();
    panel.moveTo(-w/2, -h/2);
    panel.lineTo(w/2, -h/2);
    panel.lineTo(w/2, h/2);
    panel.lineTo(-w/2, h/2);
    panel.closePath();
    const backplate = piece('Roissy_Treppensaal_Reliefplatte',
      new THREE.ExtrudeGeometry(panel, {depth:.040, bevelThickness:chamfer, bevelSize:chamfer, bevelSegments:2}),
      stone, frontBay, relief.position.y + size.y/2, faceZ + chamfer);
    layers.eg.add(backplate, relief);

    const lightY = relief.position.y + size.y + .26;
    const wallPlate = piece('Roissy_Reliefleuchte_Wandschild',
      new THREE.BoxGeometry(.14, .091, .034), brass, frontBay, lightY, 11.229);
    const rail = new THREE.CylinderGeometry(.024, .024, .55, 16);
    rail.rotateZ(Math.PI/2);
    const housing = piece('Roissy_Reliefleuchte_Messing', rail, brass, frontBay, lightY, 10.921);
    const diffuser = new THREE.MeshStandardMaterial({name:'Roissy_Reliefleuchte_Opalglas',
      color:0xf7dfbc, emissive:0xffdeb1, emissiveIntensity:.62, roughness:.5});
    const glass = piece('Roissy_Reliefleuchte_Opalglas',
      new THREE.BoxGeometry(.492,.015,.021), diffuser, frontBay, lightY-.024, 10.921);
    glass.castShadow = false;
    const arms = [-.045,.045].map(offset=>piece('Roissy_Reliefleuchte_Arm',
      new THREE.BoxGeometry(.017,.020,.297), brass, frontBay+offset, lightY, 11.068));
    layers.eg.add(wallPlate,housing,glass,...arms);
    lights.push({name:'Roissy_Relief_Akzent', color:0xffe7cc, intensity:2.8, distance:2.2,
      position:[frontBay,lightY-.038,10.898], target:[frontBay,4.15,11.10], angle:.81, penumbra:.80});
  }

  if (!models.augustus || !models.sockel) return {galleryPlaced:false, lights};

  const z = 10.72;
  const pedestal = fitHallModel(THREE, models.sockel, [frontBay, OG, z], 1.03, Math.PI,
    'Roissy_Galerie_Augustus_Steinsockel');
  const pedestalTop = boundsOf(pedestal).max.y;
  // Fit the mounting shoe in the 9.7 cm recess between the existing volutes.
  // The model's lowest neck point is slightly to the right of its bounding centre.
  const mount = piece('Roissy_Galerie_Augustus_Montageblock',
    new THREE.LatheGeometry([[0,0],[.090,0],[.096,.004],[.096,.020],[.089,.026],[0,.026]]
      .map(([r,y])=>new THREE.Vector2(r,y)), 32),
    bronze, frontBay+.025, pedestalTop-.100, z);
  mount.scale.z = .88;
  const portrait = fitHallModel(THREE, models.augustus,
    [frontBay, mount.position.y+.025, z], .54, Math.PI - .13,
    'Roissy_Galerie_Augustus_Portraet');
  layers.og.add(pedestal, mount, portrait);

  const bounds = boundsOf(pedestal).union(boundsOf(mount)).union(boundsOf(portrait));
  collisionWalls.og.push({x0:bounds.min.x, x1:bounds.max.x, z0:bounds.min.z, z1:bounds.max.z,
    furniture:pedestal.name});
  lights.push({name:'Roissy_Augustus_Akzent', color:0xffefdc, intensity:3.7, distance:3.2,
    position:[frontBay+.88,OG+2.53,z-1.09], target:[frontBay,OG+1.24,z], angle:.43, penumbra:.90});
  return {galleryPlaced:true, lights};
}
