"use client";

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {useRoomModel} from "@/hooks/three/useRoomModel";
import {useOrbitControls} from "@/hooks/three/useOrbitControls";
import {useThreeScene} from "@/hooks/three/useThreeScene";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        const { scene, camera, renderer } = useThreeScene(mountRef);

        // Controls
        const controls = useOrbitControls(camera, renderer);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 5, 2);
        dirLight.castShadow = true;
        scene.add(dirLight);

        useRoomModel(scene);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            //console.log("Camera position: ", camera.position);
            //console.log("Target position: ", controls.target);
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
