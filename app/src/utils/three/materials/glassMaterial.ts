import * as THREE from "three";

export const glassMaterial = new THREE.MeshPhysicalMaterial({
    transmission: 0.6,
    opacity: 1,
    color: 0xfbfbfb,
    metalness: 0,
    roughness: 0,
    ior: 1.5,
    thickness: 0.05,
    specularIntensity: 0.7,
    envMapIntensity: 0.9,
    depthWrite: false,
    specularColor: 0xE574B9,
});