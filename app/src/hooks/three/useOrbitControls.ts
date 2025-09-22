import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

// Handles all the orbit controls configuration
export const useOrbitControls = (camera : THREE.PerspectiveCamera, renderer : THREE.WebGLRenderer) => {

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.target.set( 10.363247838076116, 1.3862396674115351, 14.232906527767916);
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.minAzimuthAngle = 0
    controls.maxAzimuthAngle = Math.PI / 2 + 0.8;
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
    const panLimits = {
        minX: -5,
        maxX: 5,
        minY: 3,
        maxY: 10,
        minZ: -5,
        maxZ: 5
    };

    controls.addEventListener('change', () => {
        controls.target.x = Math.max(panLimits.minX, Math.min(panLimits.maxX, controls.target.x));
        controls.target.y = Math.max(panLimits.minY, Math.min(panLimits.maxY, controls.target.y));
        controls.target.z = Math.max(panLimits.minZ, Math.min(panLimits.maxZ, controls.target.z));
    });

    return controls;
}