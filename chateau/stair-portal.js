import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';

export async function loadHallDecor(THREE, onError) {
  const loader = new GLTFLoader(new THREE.LoadingManager());
  const load = async file => {
    const url = new URL('../assets/models/' + file, import.meta.url);
    try {
      return (await loader.loadAsync(url.href)).scene;
    } catch (error) {
      onError(url.href, error);
      return null;
    }
  };
  const [candelabra, faience, triton, augustus, sockel] = await Promise.all([
    load('vestibule/golden-glow-candelabra.glb'), load('vestibule/faience-urn.glb'),
    load('treppensaal/triton.glb'), load('treppensaal/augustus.glb'), load('treppensaal/sockel.glb')
  ]);
  return {candelabra, faience, triton, augustus, sockel};
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
