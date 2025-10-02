"use client";

import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {useRoomModel} from "@/hooks/three/useRoomModel";
import {useOrbitControls} from "@/hooks/three/useOrbitControls";
import {useThreeScene} from "@/hooks/three/useThreeScene";
import {createNightSky} from "@/utils/three/materials/createNightSky"
import {createSea2} from "@/utils/three/materials/createSea2";
import { useCanvasMonitor } from "@/hooks/three/useCanvasMonitor";
import { useMonitorInteraction } from "@/hooks/three/useMonitorInteraction";
import ThreeLoadingScreen from "../ui/ThreeLoadingScreen";
import { animateCameraTo, stepCameraAnimation } from "@/utils/three/animation/cameraAnimation";
import { calculateMonitorFocusPosition } from "@/utils/three/animation/cameraTargets";
import styles from "./ThreeScene.module.css";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Focus mode state management
    const monitorRef = useRef<THREE.Mesh | null>(null);
    const focusRef = useRef<boolean>(false);
    const savedCamRef = useRef<{
        position: THREE.Vector3;
        target: THREE.Vector3;
        up: THREE.Vector3;
        controlsEnabled: boolean;
    } | null>(null);
    const animationRef = useRef<{
        startTime: number;
        duration: number;
        startPos: THREE.Vector3;
        startTarget: THREE.Vector3;
        endPos: THREE.Vector3;
        endTarget: THREE.Vector3;
        isAnimating: boolean;
    } | null>(null);

    // Provide a way to trigger blur from UI elements outside the effect scope
    const blurMonitorRef = useRef<() => void>(() => {});

    // Initialize canvas monitor system at top level
    const canvasMonitor = useCanvasMonitor({
        width: 512,
        height: 288,
        pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2,
        iframeUrl: typeof window !== 'undefined' ? `${window.location.origin}/aboutme/public` : "/aboutme/public"
    });

    // Initialize monitor interaction system at top level
    const monitorInteraction = useMonitorInteraction({
        canvasWidth: 512,
        canvasHeight: 288,
    });

    useEffect(() => {

        const { scene, camera, renderer } = useThreeScene(mountRef);
        const controls = useOrbitControls(camera, renderer);

        // Set camera reference for interaction system
        monitorInteraction.setCamera(camera);
        // Set camera reference for canvas monitor (used to align iframe overlay to monitor bounds)
        canvasMonitor.setCamera(camera);

        // Helper function: Focus monitor
        const focusMonitor = () => {
            // Block re-entry while animating
            if (animationRef.current?.isAnimating) return;
            if (!monitorRef.current || focusRef.current) return;
        
            // Save current camera state
            savedCamRef.current = {
                position: camera.position.clone(),
                target: controls.target.clone(),
                up: camera.up.clone(),
                controlsEnabled: controls.enabled
            };
        
            // Calculate focus position
            const { position, target, up } = calculateMonitorFocusPosition(monitorRef.current);
        
            // Ensure correct camera roll aligned with monitor/world up (based on current impl)
            camera.up.copy(up);
        
            // Start animation
            animateCameraTo(camera, controls, position, target, animationRef);
            focusRef.current = true;
            setIsFocused(true);

            // Enable iframe interaction in focus mode
            canvasMonitor.setZoomState(true);
        };

        // Helper function: Blur monitor (exit focus)
        const blurMonitor = () => {
            // Block re-entry while animating
            if (animationRef.current?.isAnimating) return;
            if (!focusRef.current || !savedCamRef.current) return;
        
            // Start animation back to saved position
            animateCameraTo(camera, controls, savedCamRef.current.position, savedCamRef.current.target, animationRef);
            focusRef.current = false;
            setIsFocused(false);

            // Disable iframe interaction in normal mode
            canvasMonitor.setZoomState(false);
        };

        // Expose blur function to UI (e.g., exit button)
        blurMonitorRef.current = blurMonitor;



        const sea = createSea2();
        scene.add(sea);
        createNightSky().then((sky) => {
            scene.add(sky);
        });

        // Load room model and set up monitor
        useRoomModel(scene, (gltf) => {
            gltf.scene.traverse((child: THREE.Object3D) => {
                if (child.userData && child.userData.isMonitorSurface) {
                    monitorRef.current = child as THREE.Mesh;
                }
            });
            if (monitorRef.current) {
                canvasMonitor.attachToMonitor(monitorRef.current);
                
                monitorInteraction.setMonitorMesh(monitorRef.current);
            }
            setIsLoading(false);
        });

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight.position.set(5, 5, 2);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Raycaster for monitor click detection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();


        // Input event handlers
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent toggling while animation is in progress
            if (animationRef.current?.isAnimating) {
                event.preventDefault();
                return;
            }
        
            if (event.key === ' ') { // Space key
                event.preventDefault();
                if (focusRef.current) {
                    blurMonitor();
                } else {
                    focusMonitor();
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                if (focusRef.current) {
                    blurMonitor();
                }
            }
        };

        const handleCanvasClick = (event: MouseEvent) => {
            // Prevent toggling while animation is in progress
            if (animationRef.current?.isAnimating) {
                event.preventDefault();
                return;
            }
        
            if (!monitorRef.current) return;
        
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(monitorRef.current);

            if (intersects.length > 0) {
                // Clicked on monitor
                if (focusRef.current) {
                    canvasMonitor.handleMonitorClick();
                } else {
                    focusMonitor();
                }
            }
        };

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        renderer.domElement.addEventListener('click', handleCanvasClick);

        const animate = () => {
            requestAnimationFrame(animate);

            // Handle camera animation
            stepCameraAnimation(camera, controls, focusRef, savedCamRef, animationRef);

            // Only update controls if not in focus mode or animating
            if (!focusRef.current && !animationRef.current?.isAnimating) {
                controls.update();
            }

            // Render the scene
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                // If focused, keep iframe overlay aligned with monitor bounds
                if (focusRef.current) {
                    canvasMonitor.updateOverlayBounds();
                }
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            // Clean up event listeners
            document.removeEventListener('keydown', handleKeyDown);
            renderer.domElement.removeEventListener('click', handleCanvasClick);
            window.removeEventListener("resize", handleResize);

            // Reset focus state
            focusRef.current = false;
            animationRef.current = null;
            savedCamRef.current = null;
            monitorRef.current = null;

            // Cleanup canvas monitor and interaction systems
            canvasMonitor.cleanup();
            monitorInteraction.cleanup();

            // Remove WebGL canvas
            try { mountRef.current?.removeChild(renderer.domElement); } catch {}
        };
    }, []);

    return (
        <>
            {isLoading && (
                <ThreeLoadingScreen 
                    onComplete={() => setIsLoading(false)}
                    minDisplayTime={2500}
                />
            )}
            <div ref={mountRef} className={styles.container}>
                <div
                    className={`${styles.helperOverlay} ${isLoading ? styles.helperLoading : (isFocused ? styles.helperFocused : styles.helperVisible)}`}
                >
                    <div className={styles.helperTitle}>Click monitor or Space to focus; Esc to exit</div>
                    <div className={styles.helperSubtitle}>Click and drag to look around; scroll to zoom</div>
                </div>
                {/* Exit focus button (visible when focused) */}
                {isFocused && (
                    <button
                        onClick={() => blurMonitorRef.current()}
                        className={styles.exitButton}
                        aria-label="Exit focus"
                    >
                        ✖ Exit
                    </button>
                )}
            </div>
        </>
    );
}
