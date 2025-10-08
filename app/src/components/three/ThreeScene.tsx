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
import type { CameraAnimationState } from "@/utils/three/animation/cameraAnimation";
import { calculateMonitorFocusPosition } from "@/utils/three/animation/cameraTargets";
import { InteractiveObjectAnimator } from "@/utils/three/animation/interactiveAnimations";
import styles from "./ThreeScene.module.css";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Focus mode state management
    const monitorRef = useRef<THREE.Mesh | null>(null);
    // Reference to the GitHub icon/object in the scene
    const gitHubRef = useRef<THREE.Object3D | null>(null);
    // Interactive objects animation system
    const animatorRef = useRef<InteractiveObjectAnimator>(new InteractiveObjectAnimator());
    const hoveredRef = useRef<THREE.Object3D | null>(null);
    const focusRef = useRef<boolean>(false);
    const savedCamRef = useRef<{
        position: THREE.Vector3;
        target: THREE.Vector3;
        up: THREE.Vector3;
        controlsEnabled: boolean;
    } | null>(null);
    const animationRef = useRef<CameraAnimationState | null>(null);

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

            // Start animation with smoother easing and faster duration
            animateCameraTo(camera, controls, position, target, animationRef, 900, up);
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
            animateCameraTo(
                camera,
                controls,
                savedCamRef.current.position,
                savedCamRef.current.target,
                animationRef,
                900,
                savedCamRef.current.up
            );
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
                // Capture reference to the GitHub icon/object
                if (child.name === "GitHub") {
                    gitHubRef.current = child;
                }
                // Collect interactive objects by name
                const name = child.name?.toLowerCase?.() || "";
                const interactiveTags = [
                    "frame",
                    "flower",
                    "headphones",
                    "caffee",
                    "slippers",
                    "cat",
                    "mause",
                    "github",
                    "cookie",
                    "rock",
                    "plant",
                    "monstera",
                    "cactus",
                    "chair",
                    "monitor",
                ];
                if (interactiveTags.some(tag => name.includes(tag))) {
                    animatorRef.current.addObject(child);
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


        // Helper function to detect if device is mobile/touch
        const isMobileDevice = () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        };

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

            // Compute mouse position for raycasting
            if (!renderer) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            // First, check if the GitHub icon was clicked
            if (gitHubRef.current) {
                const ghIntersects = raycaster.intersectObject(gitHubRef.current, true);
                if (ghIntersects.length > 0) {
                    // Open GitHub portfolio in a new tab
                    window.open('https://github.com/Milenasuvajac/Portfolio', '_blank');
                    return;
                }
            }

            // Click pulse on interactive objects (only when not in focus mode)
            if (!focusRef.current) {
                const interactiveObjects = animatorRef.current.getObjects();
                if (interactiveObjects.length > 0) {
                    const ixs = raycaster.intersectObjects(interactiveObjects, true);
                    if (ixs.length > 0) {
                        // Find the interactive ancestor
                        const getAncestor = (obj: THREE.Object3D): THREE.Object3D => {
                            let cur: THREE.Object3D | null = obj;
                            while (cur) {
                                if (animatorRef.current.hasObject(cur)) return cur;
                                cur = cur.parent;
                            }
                            return obj;
                        };
                        const target = getAncestor(ixs[0].object);
                        
                        // Trigger pulse animation
                        animatorRef.current.setPulseState(target);
                        
                        setTimeout(() => {
                            // On mobile devices, always reset to normal state after pulse
                            // On desktop, check if still hovered
                            const isStillHovered = isMobileDevice() ? false : hoveredRef.current === target;
                            animatorRef.current.setHoverState(target, isStillHovered);
                        }, 200);
                        // Do not return; allow monitor click focus if applicable below
                    }
                }
            }

            // If not on GitHub icon, check monitor for focus/interaction
            if (!monitorRef.current) return;
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

        // Hover handler to scale interactive objects (use target scales + smoothing in animate)
        const handleCanvasMouseMove = (event: MouseEvent) => {
            if (!renderer) return;
            
            // Don't apply hover effects when camera is in focus mode (zoomed on monitor)
            if (focusRef.current) {
                // Reset any existing hover state when in focus mode
                if (hoveredRef.current) {
                    animatorRef.current.setHoverState(hoveredRef.current, false);
                    hoveredRef.current = null;
                }
                return;
            }
            
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            // Reset previous hovered object
            if (hoveredRef.current) {
                animatorRef.current.setHoverState(hoveredRef.current, false);
                hoveredRef.current = null;
            }

            const interactiveObjects = animatorRef.current.getObjects();
            if (interactiveObjects.length > 0) {
                const intersects = raycaster.intersectObjects(interactiveObjects, true);
                if (intersects.length > 0) {
                    // Find interactive ancestor
                    const getAncestor = (obj: THREE.Object3D): THREE.Object3D => {
                        let cur: THREE.Object3D | null = obj;
                        while (cur) {
                            if (animatorRef.current.hasObject(cur)) return cur;
                            cur = cur.parent;
                        }
                        return obj;
                    };
                    const target = getAncestor(intersects[0].object);
                    
                    // Set hover state
                    animatorRef.current.setHoverState(target, true);
                    hoveredRef.current = target;
                }
            }
        };

        // Touch event handlers for mobile devices
        const handleTouchStart = (event: TouchEvent) => {
            // Prevent default to avoid triggering mouse events
            event.preventDefault();
            
            if (event.touches.length === 1) {
                const touch = event.touches[0];
                // Convert touch to mouse event format for consistency
                const mouseEvent = new MouseEvent('click', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    bubbles: true,
                    cancelable: true
                });
                handleCanvasClick(mouseEvent);
            }
        };

        const handleTouchMove = () => {
            // On mobile, we don't want hover effects during touch move
            // Reset any hovered object
            if (hoveredRef.current) {
                animatorRef.current.setHoverState(hoveredRef.current, false);
                hoveredRef.current = null;
            }
        };

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        renderer.domElement.addEventListener('click', handleCanvasClick);
        renderer.domElement.addEventListener('mousemove', handleCanvasMouseMove);
        
        // Add touch event listeners for mobile support
        renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: true });

        const animate = () => {
            requestAnimationFrame(animate);

            // Handle camera animation
            stepCameraAnimation(camera, controls, focusRef, savedCamRef, animationRef);

            // Only update controls if not in focus mode or animating
            if (!focusRef.current && !animationRef.current?.isAnimating) {
                controls.update();
            }

            // Update interactive object animations
            animatorRef.current.update();

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
            renderer.domElement.removeEventListener('mousemove', handleCanvasMouseMove);
            renderer.domElement.removeEventListener('touchstart', handleTouchStart);
            renderer.domElement.removeEventListener('touchmove', handleTouchMove);
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
