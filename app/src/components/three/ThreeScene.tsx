"use client";

import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {useRoomModel} from "@/hooks/three/useRoomModel";
import {useOrbitControls} from "@/hooks/three/useOrbitControls";
import {useThreeScene} from "@/hooks/three/useThreeScene";
import {createNightSky} from "@/utils/three/materials/createNightSky"
import {createSea2} from "@/utils/three/materials/createSea2";
import { useCss3DIframeOverlay } from "@/hooks/three/useCss3DIframeOverlay";
import ThreeLoadingScreen from "../ui/ThreeLoadingScreen";
import { animateCameraTo, stepCameraAnimation } from "@/utils/three/animation/cameraAnimation";
import { calculateMonitorFocusPosition } from "@/utils/three/animation/cameraTargets";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const iframeCleanupRef = useRef<null | (() => void)>(null);
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

    useEffect(() => {

        const { scene, camera, renderer } = useThreeScene(mountRef);
        const controls = useOrbitControls(camera, renderer);

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
        
            // Enable iframe interaction (only the iframe should capture events)
            setIframeInteractive(true);

            // Route mouse events to CSS3D overlay while focused
            try {
                renderer.domElement.style.pointerEvents = 'none';
                cssRenderer.domElement.style.pointerEvents = 'auto';
                cssRenderer.domElement.style.zIndex = '2';
                renderer.domElement.style.zIndex = '1';
            } catch {}

            // Attach key listeners inside iframe so Esc/Space work without mouse click
            attachIframeKeyListeners();
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
        
            // Disable iframe interaction
            setIframeInteractive(false);

            // Restore mouse events to WebGLRenderer when not focused
            try {
                renderer.domElement.style.pointerEvents = 'auto';
                cssRenderer.domElement.style.pointerEvents = 'none';
                cssRenderer.domElement.style.zIndex = '';
                renderer.domElement.style.zIndex = '';
            } catch {}

            // Detach iframe key listeners if attached
            if (iframeCleanupRef.current) {
                try { iframeCleanupRef.current(); } catch {}
                iframeCleanupRef.current = null;
            }
        };

        // Attach/detach key listeners to the iframe content to capture Esc/Space when iframe has focus
        const attachIframeKeyListeners = () => {
            const iframe = getIframeElement?.();
            if (!iframe) return;
        
            const onLoad = () => {
                const win = iframe.contentWindow || undefined;
                const doc = iframe.contentDocument || undefined;
                if (!win && !doc) return;
        
                const handler = (e: KeyboardEvent) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        if (focusRef.current) blurMonitor();
                    } else if (e.key === ' ') {
                        e.preventDefault();
                        if (focusRef.current) {
                            blurMonitor();
                        } else {
                            focusMonitor();
                        }
                    }
                };
        
                try { win?.addEventListener('keydown', handler, { passive: false } as any); } catch {}
                try { doc?.addEventListener('keydown', handler as any, { passive: false } as any); } catch {}
        
                iframeCleanupRef.current = () => {
                    try { win?.removeEventListener('keydown', handler as any); } catch {}
                    try { doc?.removeEventListener('keydown', handler as any); } catch {}
                    try { iframe.removeEventListener('load', onLoad); } catch {}
                };
            };
        
            if (iframe.contentWindow && iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                onLoad();
            } else {
                try { iframe.addEventListener('load', onLoad); } catch {}
            }
        };

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
            cleanup: cleanupCss3D,
            setIframeInteractive,
            getIframeElement
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
        useRoomModel(scene, (gltf) => {
            gltf.scene.traverse((child: any) => {
                if (child.userData && child.userData.isMonitorSurface) {
                    monitorRef.current = child as THREE.Mesh;
                }
            });
            if (monitorRef.current) {
                attachMonitorMesh(monitorRef.current);
            }
            // Mark loading as complete when room model is loaded
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
            // Ignore clicks while animating
            if (animationRef.current?.isAnimating) return;
            if (focusRef.current || !monitorRef.current) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(monitorRef.current);

            if (intersects.length > 0) {
                focusMonitor();
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
            // Clean up event listeners
            document.removeEventListener('keydown', handleKeyDown);
            renderer.domElement.removeEventListener('click', handleCanvasClick);
            window.removeEventListener("resize", handleResize);

            // Reset focus state
            focusRef.current = false;
            animationRef.current = null;
            savedCamRef.current = null;
            monitorRef.current = null;

            cleanupCss3D();
            // Ensure pointer events restored on unmount
            try {
                renderer.domElement.style.pointerEvents = 'auto';
                cssRenderer.domElement.style.pointerEvents = 'none';
                cssRenderer.domElement.style.zIndex = '';
                renderer.domElement.style.zIndex = '';
            } catch {}

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
            <div ref={mountRef} style={{ width: "100vw", height: "100vh", position: "relative" }}>
                {/* Instructions overlay */}
                <div 
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        zIndex: 1000,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "14px",
                        fontWeight: "500",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                        userSelect: "none",
                        pointerEvents: "none",
                        opacity: isLoading ? 0 : 1,
                        transition: "opacity 0.5s ease"
                    }}
                >
                    {isFocused ? "Press ESC to exit" : "Press SPACE to view my portfolio"}
                </div>
                {/* Monitor Focus Mode: Press Space to toggle focus, Esc to exit focus, or click the monitor */}
            </div>
        </>
    );
}
