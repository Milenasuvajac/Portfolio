import * as THREE from "three";

export function createMonitorMaterial(texture?: THREE.Texture): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
        map: texture || null,
        toneMapped: false
    });
}