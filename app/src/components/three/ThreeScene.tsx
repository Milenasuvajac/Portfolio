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
import { focusMonitor } from "@/utils/three/interactions/focusMonitor";
import { blurMonitor } from "@/utils/three/interactions/blurMonitor";
import { handleKeyDown } from "@/utils/three/interactions/handleKeyDown";
import { handleCanvasClick } from "@/utils/three/interactions/handleCanvasClick";
import { handleCanvasMouseMove } from "@/utils/three/interactions/handleCanvasMouseMove";
import { handleTouchStart } from "@/utils/three/interactions/handleTouchStart";
import { handleTouchMove } from "@/utils/three/interactions/handleTouchMove";
import type { InteractionDeps } from "@/utils/three/interactions/types";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    // On-screen hint to indicate the monitor is clickable
    // Start hidden; show after the intro zoom completes
    const [showMonitorHint, setShowMonitorHint] = useState(false);
    const [monitorHintPos, setMonitorHintPos] = useState<{ left: number; top: number } | null>(null);

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
    // Track whether the initial intro zoom has been triggered
    const introZoomDoneRef = useRef<boolean>(false);

    // Provide a way to trigger blur from UI elements outside the effect scope
    const blurMonitorRef = useRef<() => void>(() => {});
    // Provide a way to trigger focus from UI elements (monitor hint)
    const focusMonitorRef = useRef<() => void>(() => {});

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

    // Detect mobile/touch device once on mount for UI text and sizing
    useEffect(() => {
        if (typeof window !== "undefined") {
            const mobile = ("ontouchstart" in window) || ((navigator.maxTouchPoints ?? 0) > 0);
            setIsMobile(mobile);
        }
    }, []);

    useEffect(() => {

        const { scene, camera, renderer } = useThreeScene(mountRef);
        const controls = useOrbitControls(camera, renderer);

        // Set camera reference for interaction system
        monitorInteraction.setCamera(camera);
        // Set camera reference for canvas monitor (used to align iframe overlay to monitor bounds)
        canvasMonitor.setCamera(camera);

        // Assemble shared dependencies for handlers
        const deps: InteractionDeps = {
            camera,
            controls,
            renderer,
            monitorRef,
            gitHubRef,
            animatorRef,
            hoveredRef,
            focusRef,
            savedCamRef,
            animationRef,
            canvasMonitor,
            setIsFocused,
            setShowMonitorHint,
        };

        // Expose blur function to UI (e.g., exit button)
        blurMonitorRef.current = () => blurMonitor(deps);
        // Expose focus function to UI (e.g., monitor hint CTA)
        focusMonitorRef.current = () => focusMonitor(deps);



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
                // Compute a screen-space position for hint (top-center of monitor bounds)
                try {
                    const box = new THREE.Box3().setFromObject(monitorRef.current);
                    const topCenter = new THREE.Vector3(
                        (box.min.x + box.max.x) / 2,
                        box.max.y,
                        (box.min.z + box.max.z) / 2
                    );
                    // Offset the hint in world space: move along Y (up) and Z (forward)
                    // Increase offsets to move the hint further up and right on screen
                    const hintWorldOffset = new THREE.Vector3(0, 0.35, 0.35);
                    topCenter.add(hintWorldOffset);
                    const projected = topCenter.clone().project(camera);
                    const x = (projected.x + 1) / 2 * window.innerWidth;
                    const y = (1 - projected.y) / 2 * window.innerHeight;
                    setMonitorHintPos({ left: Math.round(x + 70), top: Math.round(y - 100) });
                } catch {}
            }
            setIsLoading(false);

            // After the scene/model is loaded, perform a gentle intro zoom
            // to the requested camera position. This runs only once on mount.
            try {
                if (!introZoomDoneRef.current) {
                    introZoomDoneRef.current = true;
                    const targetPos = new THREE.Vector3(
                        6.496919875240896,
                        6.355091969590323,
                        4.066273028680081
                    );
                    // so the camera looks straight (horizontal) along the XZ plane
                    const targetLook = new THREE.Vector3(
                        5.000000000011038,
                        5.436673874558975,
                        2.95831904089331
                    );
                    // Slow, smooth zoom-in over ~2.6s
                    animateCameraTo(
                        camera,
                        controls,
                        targetPos,
                        targetLook,
                        animationRef,
                        2600,
                        new THREE.Vector3(0, 1, 0)
                    );
                    // Show monitor hint after intro zoom finishes
                    setTimeout(() => {
                        // Only show if not already focused
                        if (!focusRef.current) setShowMonitorHint(true);
                    }, 2650);
                }
            } catch {}
        });

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight.position.set(5, 5, 2);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Stable handler references (delegating to external modules)
        const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event, deps);
        const onCanvasClick = (event: MouseEvent) => handleCanvasClick(event, deps);
        const onCanvasMouseMove = (event: MouseEvent) => handleCanvasMouseMove(event, deps);
        const onTouchStart = (event: TouchEvent) => handleTouchStart(event, deps);
        const onTouchMove = (event: TouchEvent) => handleTouchMove(event, deps);

        // Wheel event handler to prevent zoom when iframe is in focus
        const handleWheel = (event: WheelEvent) => {
            if (focusRef.current) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        // Add event listeners
        document.addEventListener('keydown', onKeyDown);
        renderer.domElement.addEventListener('click', onCanvasClick);
        renderer.domElement.addEventListener('mousemove', onCanvasMouseMove);
        renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
        
        // Add touch event listeners for mobile support
        renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
        renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true });

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

            console.log("Camera: ", camera.position)
            console.log("target: ", controls.target);
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
            document.removeEventListener('keydown', onKeyDown);
            renderer.domElement.removeEventListener('click', onCanvasClick);
            renderer.domElement.removeEventListener('mousemove', onCanvasMouseMove);
            renderer.domElement.removeEventListener('wheel', handleWheel);
            renderer.domElement.removeEventListener('touchstart', onTouchStart);
            renderer.domElement.removeEventListener('touchmove', onTouchMove);
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

    // Auto-hide the monitor hint after a short time
    useEffect(() => {
        if (!showMonitorHint) return;
        const t = setTimeout(() => setShowMonitorHint(false), 8000);
        return () => clearTimeout(t);
    }, [showMonitorHint]);

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
                    className={`${styles.helperOverlay} ${isMobile ? styles.helperOverlayMobile : ""} ${isLoading ? styles.helperLoading : (isFocused ? styles.helperFocused : styles.helperVisible)}`}
                >
                    {isMobile ? (
                        <>
                            <div className={styles.helperTitle}>Tap monitor to focus; use Exit to leave</div>
                            <div className={styles.helperSubtitle}>Drag to look around; use two fingers to zoom</div>
                        </>
                    ) : (
                        <>
                            <div className={styles.helperTitle}>Click monitor or Space to focus; Esc to exit</div>
                            <div className={styles.helperSubtitle}>Click and drag to look around; scroll to zoom</div>
                        </>
                    )}
                </div>
                {/* Clickable hint near the monitor (visible until first interaction) */}
                {!isLoading && !isFocused && showMonitorHint && monitorHintPos && (
                    <button
                        className={styles.monitorHint}
                        style={{ left: monitorHintPos.left, top: monitorHintPos.top }}
                        onClick={() => focusMonitorRef.current()}
                        aria-label={isMobile ? "Tap the monitor" : "Click the monitor"}
                    >
                        <span className={styles.monitorHintPulse} />
                        {isMobile ? "Tap the monitor" : "Click the monitor"}
                    </button>
                )}
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
