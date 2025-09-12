import * as THREE from "three";

export function createWaterMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
        color: 0x1f4e5c,       // base water color
        transmission: 0.1,     // transparency (WebGL2 only)
        opacity: 0.9,
        transparent: true,
        roughness: 0.05,       // smoother reflection
        metalness: 0.5,
        reflectivity: 1,
        clearcoat: 0.5,        // adds "wet" surface effect
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.5,
    });
}
