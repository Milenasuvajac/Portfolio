"use client";

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {useRoomModel} from "@/hooks/three/useRoomModel";
import {useOrbitControls} from "@/hooks/three/useOrbitControls";
import {useThreeScene} from "@/hooks/three/useThreeScene";
import {createNightSky} from "@/utils/three/materials/createNightSky"
import {createSea2} from "@/utils/three/materials/createSea2";
import { useCss3DIframeOverlay } from "@/hooks/three/useCss3DIframeOverlay";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        const { scene, camera, renderer } = useThreeScene(mountRef);
        const controls = useOrbitControls(camera, renderer);

        const sea = createSea2();
        scene.add(sea);
        createNightSky().then((sky) => {
            scene.add(sky);
        });

        // Initialize CSS3D iframe overlay helper
        const {
            cssScene,
            cssRenderer,
            attachMonitorMesh,
            updateCss3D,
            handleResize: handleCssResize,
            cleanup: cleanupCss3D
        } = useCss3DIframeOverlay({
            mountRef,
            camera,
            renderer,
            controls,
            url: "/aboutme/public",
            widthPx: 800,
            heightPx: 450
        });

        // Find the monitor mesh and attach the iframe to it
        let monitorMesh: THREE.Mesh | null = null;
        useRoomModel(scene, (gltf) => {
            gltf.scene.traverse((child: any) => {
                if (child.userData && child.userData.isMonitorSurface) {
                    monitorMesh = child as THREE.Mesh;
                }
            });
            if (monitorMesh) {
                attachMonitorMesh(monitorMesh);
            }
        });

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight.position.set(5, 5, 2);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            // Sync CSS3DObject with monitor
            updateCss3D();

            renderer.render(scene, camera);
            cssRenderer.render(cssScene, camera);
        };
        animate();

        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                handleCssResize(width, height);
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cleanupCss3D();
            // Remove WebGL canvas
            try { mountRef.current?.removeChild(renderer.domElement); } catch {}
        };
    }, []);

    return <div ref={mountRef} style={{ width: "100vw", height: "100vh", position: "relative" }} />;
}
