import * as THREE from "three";
import { RefObject } from "react";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
// If you have OrbitControls types installed, you can import them; otherwise use 'any' for controls
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Options {
  mountRef: RefObject<HTMLDivElement | null>;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: any; // OrbitControls
  url: string;
  widthPx: number;
  heightPx: number;
}

export function useCss3DIframeOverlay(options: Options) {
  const { mountRef, renderer, controls, url, widthPx, heightPx } = options;

  // CSS3D scene and renderer
  const cssScene = new THREE.Scene();
  const cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = "0";
  cssRenderer.domElement.style.left = "0";
  cssRenderer.domElement.style.pointerEvents = "none"; // only iframe should receive events
  cssRenderer.domElement.style.zIndex = "1";
  mountRef.current!.appendChild(cssRenderer.domElement);

  // internal refs
  let monitorMesh: THREE.Mesh | null = null;
  let cssMonitor: CSS3DObject | null = null;
  let iframeEl: HTMLIFrameElement | null = null;

  // listeners for cleanup
  let onIFPointerEnter: ((ev: Event) => void) | null = null;
  let onIFPointerLeave: ((ev: Event) => void) | null = null;
  let onIFMouseEnter: ((ev: Event) => void) | null = null;
  let onIFMouseLeave: ((ev: Event) => void) | null = null;
  let onIFWheel: ((ev: WheelEvent) => void) | null = null;
  let onCanvasWheel: ((ev: WheelEvent) => void) | null = null;

  // temp math vars
  const tmpPos = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  const tmpScale = new THREE.Vector3();
  const monitorWorldMatrix = new THREE.Matrix4();
  // Rotate 90deg around Y so iframe faces outward if needed
  const yRotOffset = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    Math.PI / 2
  );

  const disableControls = () => {
    controls.enabled = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
  };
  const enableControls = () => {
    controls.enabled = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
  };

  const attachMonitorMesh = (mesh: THREE.Mesh) => {
    monitorMesh = mesh;

    // Create iframe element
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = String(widthPx);
    iframe.height = String(heightPx);
    iframe.style.border = "0";
    iframe.style.borderRadius = "6px";
    iframe.style.pointerEvents = "auto"; // allow iframe to receive events
    iframe.setAttribute(
      "sandbox",
      "allow-same-origin allow-scripts allow-forms allow-popups"
    );

    cssMonitor = new CSS3DObject(iframe);
    cssScene.add(cssMonitor);

    // Events to pause controls when cursor is over the iframe
    onIFPointerEnter = () => disableControls();
    onIFPointerLeave = () => enableControls();
    onIFMouseEnter = () => disableControls();
    onIFMouseLeave = () => enableControls();
    onIFWheel = (e: WheelEvent) => {
      // prevent bubbling to canvas
      e.stopPropagation();
    };

    iframe.addEventListener("pointerenter", onIFPointerEnter!);
    iframe.addEventListener("pointerleave", onIFPointerLeave!);
    iframe.addEventListener("mouseenter", onIFMouseEnter!);
    iframe.addEventListener("mouseleave", onIFMouseLeave!);
    iframe.addEventListener("wheel", onIFWheel!, { passive: true });

    iframeEl = iframe;

    // Additionally intercept wheel at canvas-level if cursor overlaps iframe rect
    onCanvasWheel = (e: WheelEvent) => {
      if (!iframeEl) return;
      const rect = iframeEl.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (inside) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    renderer.domElement.addEventListener("wheel", onCanvasWheel, {
      passive: false,
      capture: true,
    });

    // Compute scale to fit the monitor surface width
    const bbox = new THREE.Box3().setFromObject(monitorMesh);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const monitorWidthWorld = size.x > 0 ? size.x : 1.6; // fallback value

    // Above formula keeps previous behavior (800px baseline mapped to 25 units)
    // Simpler: monitorWidthWorld / 25; but we keep widthPx influence if customized
    cssMonitor.scale.setScalar(monitorWidthWorld / 25);
  };

  const updateCss3D = () => {
    if (!monitorMesh || !cssMonitor) return;
    monitorMesh.updateWorldMatrix(true, false);
    monitorWorldMatrix.copy(monitorMesh.matrixWorld);
    monitorWorldMatrix.decompose(tmpPos, tmpQuat, tmpScale);
    cssMonitor.position.copy(tmpPos);
    cssMonitor.quaternion.copy(tmpQuat).multiply(yRotOffset);
  };

  const handleResize = (width: number, height: number) => {
    cssRenderer.setSize(width, height);
  };

  const cleanup = () => {
    try {
      if (iframeEl) {
        if (onIFPointerEnter) iframeEl.removeEventListener("pointerenter", onIFPointerEnter);
        if (onIFPointerLeave) iframeEl.removeEventListener("pointerleave", onIFPointerLeave);
        if (onIFMouseEnter) iframeEl.removeEventListener("mouseenter", onIFMouseEnter);
        if (onIFMouseLeave) iframeEl.removeEventListener("mouseleave", onIFMouseLeave);
        if (onIFWheel) iframeEl.removeEventListener("wheel", onIFWheel);
      }
      if (onCanvasWheel) {
        renderer.domElement.removeEventListener("wheel", onCanvasWheel, true);
      }
      enableControls();
      if (mountRef.current && cssRenderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(cssRenderer.domElement);
      }
    } catch {}
  };

  return {
    cssScene,
    cssRenderer,
    attachMonitorMesh,
    updateCss3D,
    handleResize,
    cleanup,
  };
}