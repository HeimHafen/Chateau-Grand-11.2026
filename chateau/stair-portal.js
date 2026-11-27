import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';

export async function loadHallDecor(THREE, onError) {
  const loader = new GLTFLoader(new THREE.LoadingManager());
  const load = async file => {
    const url = new URL('../assets/models/vestibule/' + file, import.meta.url);
    try {
      return (await loader.loadAsync(url.href)).scene;
    } catch (error) {
      onError(url.href, error);
      return null;
    }
  };
  const [lion, candelabra] = await Promise.all([
    load('marble-lion.glb'), load('golden-glow-candelabra.glb')
  ]);
  if (lion) lion.traverse(object => {
    if (!object.isMesh) return;
    object.material = new THREE.MeshStandardMaterial({
      name: 'Roissy · Carrara-Löwe', color: 0xe1dace,
      roughness: .44, metalness: 0
    });
  });
  return {lion, candelabra};
}

export function fitHallModel(THREE, source, position, height, yaw, name) {
  const model = source.clone();
  const aligned = new THREE.Group();
  aligned.add(model);
  model.rotation.y += yaw;
  const box = new THREE.Box3().setFromObject(aligned, true);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
  aligned.scale.setScalar(height / (box.max.y - box.min.y));
  aligned.position.set(...position);
  aligned.name = name;
  aligned.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  return aligned;
}

export function installStairPortal(THREE, layer, colliders, floor, ceiling, column, materials, lion) {
  if (!column) return null;

  const {stone, trim, shaft, verde, bronze, frieze} = materials;
  const portal = new THREE.Group();
  portal.name = 'Roissy · Ionisches Portal zum Grand Escalier';
  layer.add(portal);
  const x = -13.50, z = -3.68, halfSpan = 2.76;
  const top = ceiling - .014;
  const base = floor + .012;
  const capital = top - .45;
  const columnPlinth = .158;
  const height = capital - base - columnPlinth;
  const box = (name, material, xx, y, zz, width, thickness, depth) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, depth), material);
    mesh.name = name;
    mesh.position.set(xx, y, zz);
    mesh.castShadow = mesh.receiveShadow = true;
    portal.add(mesh);
    return mesh;
  };
  const ends = [];
  const block = (object, name) => {
    const {min, max} = new THREE.Box3().setFromObject(object, true);
    const bounds = {x0:min.x, x1:max.x, z0:min.z, z1:max.z, furniture:name};
    colliders.push(bounds);
    return bounds;
  };
  const columnWidth = .88;
  const columnDepth = .78;
  const beamWidth = halfSpan * 2 + columnWidth;
  box('Architrav', stone, x, capital + .086, z, beamWidth, .172, .74);
  box('Feines Architravprofil', trim, x, capital + .180, z, beamWidth + .022, .028, .775);
  box('Architrav · Schattenfuge', verde, x, capital + .194, z, beamWidth + .026, .018, .778);
  box('Glatter Fries', frieze, x, capital + .261, z, beamWidth + .03, .134, .758);
  box('Feines Bronzeband', bronze, x, capital + .321, z, beamWidth + .055, .013, .778);
  box('Kranzgesims', trim, x, capital + .357, z, beamWidth + .142, .070, .873);
  box('Deckenanschluss', stone, x, capital + .419, z, beamWidth + .195, .087, .904);

  for (const side of [-1, 1]) {
    const cx = x + side * halfSpan;
    const columnMesh = new THREE.Mesh(column, shaft);
    columnMesh.name = side < 0 ? 'Ionische Säule West' : 'Ionische Säule Ost';
    columnMesh.position.set(cx, base + columnPlinth, z);
    const {min, max} = column.boundingBox;
    const crossScale = Math.min(columnWidth / (max.x - min.x), columnDepth / (max.z - min.z));
    columnMesh.scale.set(crossScale, height, crossScale);
    columnMesh.castShadow = columnMesh.receiveShadow = true;
    portal.add(columnMesh);
    const pier = box('Säulenplinthe · dunkler Marmor', verde, cx, base + .063, z, .91, .126, .84);
    box('Säulenplinthe · Abschluss', trim, cx, base + .142, z, .87, .033, .80);
    ends.push(block(pier, columnMesh.name));

    if (lion) {
      const lx = cx + side * .16, lz = z - .99;
      const plinth = box('Löwensockel · Fuß', stone, lx, base + .043, lz, .78, .086, 1.05);
      box('Löwensockel · Kern', verde, lx, base + .203, lz, .69, .234, .96);
      box('Löwensockel · Bronzefilet', bronze, lx, base + .323, lz, .72, .017, .99);
      box('Löwensockel · Deckplatte', trim, lx, base + .361, lz, .77, .062, 1.038);
      block(plinth, 'Marmorlöwensockel');
      const model = fitHallModel(THREE, lion, [lx, base + .392, lz], .72,
        -1.424 - side * .24, side < 0 ? 'Marmorlöwe West' : 'Marmorlöwe Ost');
      portal.add(model);
    }
  }
  const threshold = box('Treppenportal · eingelassene Marmorschwelle', verde, x, floor + .013, z,
    ends[1].x0 - ends[0].x1, .005, .056);
  threshold.castShadow = false;
  return {clearWidth: ends[1].x0 - ends[0].x1, floor, ceiling, columnHeight: height, lionCount: lion ? 2 : 0};
}
