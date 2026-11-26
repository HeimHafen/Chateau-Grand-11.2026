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
