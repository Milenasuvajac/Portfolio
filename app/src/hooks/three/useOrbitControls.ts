import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

// Handles all the orbit controls configuration
export const useOrbitControls = (camera : THREE.PerspectiveCamera, renderer : THREE.WebGLRenderer) => {

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // smooth movement
    controls.dampingFactor = 0.05;
    controls.enablePan = true;      // allow moving scene
    controls.enableZoom = true;     // allow zoom with scroll
    controls.target.set( -0.00763346160769606, 0.9865404956019542, 0.2127792947689923);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minAzimuthAngle = 0
    controls.maxAzimuthAngle = Math.PI / 2 + 0.2;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;

    return controls;
}