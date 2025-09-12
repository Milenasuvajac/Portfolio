import * as THREE from "three";
import { createWaterMaterial } from "@/utils/three/materials/waterMaterial";

export function createSea2(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(10000, 10000);

    // Reuse the water material from your model
    const material = createWaterMaterial();

    const sea = new THREE.Mesh(geometry, material);
    sea.rotation.x = -Math.PI / 2; // make it flat
    sea.position.set(0, -4, 0);     // put it under your model

    sea.receiveShadow = true;

    return sea;
}
