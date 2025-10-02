import * as THREE from "three";

// Computes the camera position, look target and up vector to focus on a monitor mesh
export function calculateMonitorFocusPosition(monitorMesh: THREE.Mesh) {
  const monitorCenter = new THREE.Vector3();
  monitorMesh.getWorldPosition(monitorCenter);

  // Keep a deterministic orientation in world space
  const forward = new THREE.Vector3(1, 0, 0); // look direction
  const up = new THREE.Vector3(0, 1, 0);      // world up

  const offset = 1.1; // distance in front along forward
  const upOffset = 0;

  const cameraPos = monitorCenter
    .clone()
    .add(forward.clone().multiplyScalar(offset))
    .add(up.clone().multiplyScalar(upOffset));

  return { position: cameraPos, target: monitorCenter, up };
}