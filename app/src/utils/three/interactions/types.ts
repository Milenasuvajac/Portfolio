import type React from "react";
import * as THREE from "three";
import type { CameraAnimationState } from "@/utils/three/animation/cameraAnimation";
import { InteractiveObjectAnimator } from "@/utils/three/animation/interactiveAnimations";

// Shared dependencies passed into interaction handlers to avoid coupling to component scope
export interface InteractionDeps {
  camera: THREE.Camera;
  controls: any; // OrbitControls or compatible control with target and enabled
  renderer: THREE.WebGLRenderer;
  monitorRef: React.MutableRefObject<THREE.Mesh | null>;
  gitHubRef: React.MutableRefObject<THREE.Object3D | null>;
  animatorRef: React.MutableRefObject<InteractiveObjectAnimator>;
  hoveredRef: React.MutableRefObject<THREE.Object3D | null>;
  focusRef: React.MutableRefObject<boolean>;
  savedCamRef: React.MutableRefObject<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    up: THREE.Vector3;
    controlsEnabled: boolean;
  } | null>;
  animationRef: React.MutableRefObject<CameraAnimationState | null>;
  canvasMonitor: {
    setZoomState: (zoomed: boolean) => void;
    handleMonitorClick: () => void;
  };
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMonitorHint: React.Dispatch<React.SetStateAction<boolean>>;
}