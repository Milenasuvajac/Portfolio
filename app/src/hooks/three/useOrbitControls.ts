import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

// Handles all the orbit controls configuration
export const useOrbitControls = (camera : THREE.PerspectiveCamera, renderer : THREE.WebGLRenderer) => {

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  // smooth movement
    controls.dampingFactor = 0.08;
    controls.enablePan = true;      // allow moving scene
    controls.enableZoom = true;     // allow zoom with scroll
    controls.enableRotate = true;
    controls.target.set( -0.00763346160769606, 0.9865404956019542, 0.2127792947689923);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minAzimuthAngle = 0
    controls.maxAzimuthAngle = Math.PI / 2 + 2;
    controls.minDistance = 1;
    controls.maxDistance = 95;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;

    controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
    }

    controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
    }

    return controls;
}