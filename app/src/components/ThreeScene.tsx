"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current!.clientWidth / mountRef.current!.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.5, 4);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            mountRef.current!.clientWidth,
            mountRef.current!.clientHeight
        );
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current!.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;  // smooth movement
        controls.dampingFactor = 0.05;
        controls.enablePan = true;      // allow moving scene
        controls.enableZoom = true;     // allow zoom with scroll
        controls.target.set(0, 1, 0);   // look at room center (adjust y if needed)

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        // Load GLB model
        const loader = new GLTFLoader();
        loader.load(
            "/models/Room.glb",
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(1, 1, 1);
                scene.add(model);
            },
            undefined,
            (error) => {
                console.error("Error loading GLB:", error);
            }
        );

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handling
        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
