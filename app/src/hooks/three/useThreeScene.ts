import * as THREE from "three";
import {RefObject} from "react";

// Handles scene, camera, renderer setup and lifecycle
export const useThreeScene = (mountRef: RefObject<HTMLDivElement | null>) => {

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current!.clientWidth / mountRef.current!.clientHeight,
        0.1,
        50000
    );
    camera.position.set( 4.150419508853013,  1.7776508792813757, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
        mountRef.current!.clientWidth,
        mountRef.current!.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current!.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // or another shadow map type


    return {scene, camera, renderer}
}