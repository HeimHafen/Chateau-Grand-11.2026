import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {mergeGeometries} from '../vendor/three/examples/jsm/utils/BufferGeometryUtils.js';

export function prepareVestibuleColumn(THREE, source) {
  source.updateMatrixWorld(true);
  const parts = [];
  source.traverse(object => {
    // SketchUp also exports fully transparent outline meshes.
    if (!object.isMesh || object.material.opacity === 0) return;
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    for (const name of Object.keys(geometry.attributes)) {
      if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name);
    }
    geometry.applyMatrix4(object.matrixWorld);
    parts.push(geometry);
  });
  const column = mergeGeometries(parts);
  for (const part of parts) part.dispose();
  if (!column) throw new Error('Säule enthält keine verwendbare Geometrie.');
  column.computeBoundingBox();
  const {min, max} = column.boundingBox;
  const height = max.y - min.y;
  if (!(height > 0 && Number.isFinite(height))) throw new Error('Ungültige Säulenhöhe.');
  column.translate(-(min.x + max.x) / 2, -min.y, -(min.z + max.z) / 2);
  column.scale(1 / height, 1 / height, 1 / height);
  // Project each triangle on the plane where its face has the most area.
  // This keeps the texture scale consistent across flutes, volutes and bases.
  const positions = column.getAttribute('position');
  const uv = new Float32Array(positions.count * 2);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < positions.count; i += 3) {
    a.fromBufferAttribute(positions, i);
    b.fromBufferAttribute(positions, i + 1).sub(a);
    c.fromBufferAttribute(positions, i + 2).sub(a);
    b.cross(c);
    const nx = Math.abs(b.x), ny = Math.abs(b.y), nz = Math.abs(b.z);
    const axes = ny >= nx && ny >= nz ? [0, 2] : nx >= nz ? [2, 1] : [0, 1];
    for (let j = i; j < i + 3; j++) {
      a.fromBufferAttribute(positions, j);
      uv[j * 2] = a.getComponent(axes[0]) * 5.4;
      uv[j * 2 + 1] = a.getComponent(axes[1]) * 5.4;
    }
  }
  column.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  column.computeBoundingBox();
  return column;
}

export async function loadVestibuleColumn(THREE) {
  const url = new URL('../assets/models/vestibule/ionic_column_sketchup_ii.glb', import.meta.url);
  try {
    const {scene} = await new GLTFLoader(new THREE.LoadingManager()).loadAsync(url.href);
    return prepareVestibuleColumn(THREE, scene);
  } catch (error) {
    console.warn('Ionische Säulen konnten nicht geladen werden:', error);
    return null;
  }
}
