import * as THREE from "three";
import {useCallback, useEffect, useRef, useState} from "react";
import logger from "@/utils/logger";
import { isMobileDevice } from "@/utils/device";

interface CanvasMonitorOptions {
  width?: number;
  height?: number;
  pixelRatio?: number;
  iframeUrl?: string;
}

export function useCanvasMonitor(options: CanvasMonitorOptions = {}) {
  const {
    width = 1024,
    height = 576,  // Maintains 16:9 aspect ratio
    pixelRatio = 1,
    iframeUrl = "/aboutme/public"
  } = options;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const monitorMeshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const updateOverlayBoundsRef = useRef<() => void>(() => {});

  const [isZoomed, setIsZoomed] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  // Create iframe element for interaction (only used when zoomed)
  const createIframe = useCallback(() => {
    if (iframeRef.current) return iframeRef.current;
    if (typeof document === 'undefined') return null; // SSR safety

    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    // Initial iframe style; concrete size/position will be computed to match monitor bounds when zooming
    iframe.style.cssText = `
         position: fixed;
         left: 0px;
         top: 0px;
         transform: none;
         transform-origin: top left;
         width: 0px;
         height: 0px;
         border-radius: 3px;
         background: #000;
         z-index: 10000;
         display: none;
         opacity: 0;
         transition: opacity 0.5s ease-in-out;
         box-shadow: 0 0 30px rgba(74, 158, 255, 0.3);
         overscroll-behavior: contain;
     `;

    // Allow same-origin access for navigation
    iframe.setAttribute('allow', 'same-origin');

    // Prevent interaction when not zoomed
    iframe.style.pointerEvents = 'none';

    iframe.onerror = (error) => {
      logger.error('Iframe failed to load:', error);
    };

    document.body.appendChild(iframe);
    iframeRef.current = iframe;
    return iframe;
  }, [width, height, iframeUrl]);


  // Render iframe content to canvas
  const renderIframeToCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Reset transform and clear full pixel canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

    } catch (error) {
      logger.warn('Could not render canvas content:', error);
    }
  }, [width, height, pixelRatio, isInteractive]);

  // Start continuous rendering
  const startRendering = useCallback(() => {
    const render = () => {
      try { updateOverlayBoundsRef.current(); } catch {}
      animationFrameRef.current = requestAnimationFrame(render);
    };

    if (!animationFrameRef.current) {
      render();
    }
  }, [renderIframeToCanvas]);

  // Stop rendering
  const stopRendering = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Compute screen-space bounds of the monitor mesh and update iframe overlay to match
  const updateOverlayBounds = useCallback(() => {
    try {
      if (!iframeRef.current || !monitorMeshRef.current || !cameraRef.current) return;
      const cam = cameraRef.current;

      // Compute bounding box in world space
      const box = new THREE.Box3().setFromObject(monitorMeshRef.current);
      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ];

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of corners) {
        const projected = p.clone().project(cam);
        const x = (projected.x + 1) / 2 * viewportWidth;
        const y = (1 - projected.y) / 2 * viewportHeight;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      const widthPx = Math.max(0, Math.round(maxX - minX));
      const heightPx = Math.max(0, Math.round(maxY - minY));
      const leftPx = Math.round(minX);
      const topPx = Math.round(minY);

      if (widthPx > 0 && heightPx > 0) {
        const mobile = isMobileDevice();
        if (!mobile) {
          iframeRef.current.style.left = `${leftPx}px`;
          iframeRef.current.style.top = `${topPx}px`;
          iframeRef.current.style.width = `${widthPx}px`;
          iframeRef.current.style.height = `${heightPx}px`;
          iframeRef.current.style.transform = 'none';
        } else {
          const baseW = Math.max(width, 1024);
          const baseH = Math.round(baseW * (height / width));
          const scale = heightPx / baseH;
          const scaledWidth = baseW * scale;
          const centeredLeft = Math.round(leftPx + (widthPx - scaledWidth) / 2);
          iframeRef.current.style.left = `${centeredLeft}px`;
          iframeRef.current.style.top = `${topPx}px`;
          iframeRef.current.style.width = `${baseW}px`;
          iframeRef.current.style.height = `${baseH}px`;
          iframeRef.current.style.transform = `scale(${scale})`;
        }
      }
    } catch (error) {
      logger.warn('Failed to update overlay bounds:', error);
    }
  }, []);

  // Keep a ref to avoid use-before-declaration when called inside startRendering
  useEffect(() => {
    updateOverlayBoundsRef.current = updateOverlayBounds;
  }, [updateOverlayBounds]);


  // Initialize iframe and start rendering (no texture/material assignment)
  const initializeMonitor = useCallback(() => {
    createIframe();
    
    // Enable VirtualKeyboard API for Android Chrome to prevent viewport jumping
    if (typeof navigator !== 'undefined' && 'virtualKeyboard' in navigator) {
      try {
        (navigator as any).virtualKeyboard.overlaysContent = true;
      } catch (error) {
        logger.warn('VirtualKeyboard API not supported:', error);
      }
    }
    
    // Start rendering after a short delay to allow iframe to load
    setTimeout(() => {
      startRendering();
    }, 500);
  }, [createIframe, startRendering]);

  // Attach to monitor mesh
  const attachToMonitor = useCallback((mesh: THREE.Mesh) => {
    monitorMeshRef.current = mesh;
    initializeMonitor();
  }, [initializeMonitor]);

  // Convert 3D intersection point to 2D iframe coordinates
  const worldToIframe = useCallback((intersectionPoint: THREE.Vector3): { x: number; y: number } | null => {
    if (!monitorMeshRef.current) return null;

    const localPoint = monitorMeshRef.current.worldToLocal(intersectionPoint.clone());

    // Convert to UV coordinates (assuming monitor surface is from -1 to 1)
    const u = (localPoint.x + 1) / 2;
    const v = 1 - (localPoint.y + 1) / 2;

    // Convert to iframe pixel coordinates
    const iframeX = u * width;
    const iframeY = v * height;

    if (iframeX >= 0 && iframeX <= width && iframeY >= 0 && iframeY <= height) {
      return { x: iframeX, y: iframeY };
    }

    return null;
  }, [width, height]);

  // Handle zoom state changes
  const setZoomState = useCallback((zoomed: boolean) => {
    setIsZoomed(zoomed);

    if (iframeRef.current) {
      if (zoomed) {
        // Wait for camera animation to complete before showing iframe
        setTimeout(() => {
          if (iframeRef.current && zoomed) {
            updateOverlayBounds();
            // Show iframe overlay and enable interaction when zoomed
            iframeRef.current.style.display = 'block';
            iframeRef.current.style.pointerEvents = 'auto';
            // Trigger fade-in after display is set
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.style.opacity = '1';
              }
            }, 50);
            setIsInteractive(true);
          }
        }, 800); // Wait 1 seconds for animation to complete
      } else {
        // Hide iframe overlay with fade-out when not zoomed
        iframeRef.current.style.opacity = '0';
        iframeRef.current.style.pointerEvents = 'none';
        setIsInteractive(false);
        // Hide completely after fade-out
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.style.display = 'none';
          }
        }, 300);
      }
    }
  }, [updateOverlayBounds]);

  // Handle click events on the monitor
  const handleMonitorClick = useCallback(() => {
  }, [isInteractive]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopRendering();

    if (textureRef.current) {
      textureRef.current.dispose();
      textureRef.current = null;
    }
    if (materialRef.current) {
      materialRef.current.dispose();
      materialRef.current = null;
    }
    if (iframeRef.current) {
      document.body.removeChild(iframeRef.current);
      iframeRef.current = null;
    }

    canvasRef.current = null;
    monitorMeshRef.current = null;
  }, [stopRendering]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    attachToMonitor,
    worldToIframe,
    handleMonitorClick,
    setZoomState,
    updateOverlayBounds,
    cleanup,
    isZoomed,
    isInteractive,
    iframe: iframeRef.current,
    canvas: canvasRef.current,
    texture: textureRef.current,
    material: materialRef.current,
    setCamera: (camera: THREE.PerspectiveCamera) => { cameraRef.current = camera; }
  };
}