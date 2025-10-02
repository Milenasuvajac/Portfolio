import * as THREE from "three";
import { easeInOutCubic } from "@/utils/three/animation/easing";
import type { MutableRefObject } from "react";

export type CameraAnimationState = {
  startTime: number;
  duration: number;
  startPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  endPos: THREE.Vector3;
  endTarget: THREE.Vector3;
  isAnimating: boolean;
};

// Minimal controls interface needed by the camera animation helpers.
// Matches the subset of OrbitControls we use.
export interface CameraControlsLike {
  target: THREE.Vector3;
  enabled: boolean;
  enableRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
}

export function animateCameraTo(
  camera: THREE.PerspectiveCamera,
  controls: CameraControlsLike,
  targetPos: THREE.Vector3,
  targetTarget: THREE.Vector3,
  animationRef: MutableRefObject<CameraAnimationState | null>,
  duration: number = 1000
) {
  if (animationRef.current?.isAnimating) return;

  animationRef.current = {
    startTime: performance.now(),
    duration,
    startPos: camera.position.clone(),
    startTarget: controls.target.clone(),
    endPos: targetPos.clone(),
    endTarget: targetTarget.clone(),
    isAnimating: true,
  };
}

export function stepCameraAnimation(
  camera: THREE.PerspectiveCamera,
  controls: CameraControlsLike,
  focusRef: MutableRefObject<boolean>,
  savedCamRef: MutableRefObject<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    up: THREE.Vector3;
    controlsEnabled: boolean;
  } | null>,
  animationRef: MutableRefObject<CameraAnimationState | null>
) {
  if (!animationRef.current?.isAnimating) return;

  const elapsed = performance.now() - animationRef.current.startTime;
  const progress = Math.min(elapsed / animationRef.current.duration, 1);
  const easedProgress = easeInOutCubic(progress);

  camera.position.lerpVectors(
    animationRef.current.startPos,
    animationRef.current.endPos,
    easedProgress
  );
  controls.target.lerpVectors(
    animationRef.current.startTarget,
    animationRef.current.endTarget,
    easedProgress
  );

  camera.lookAt(controls.target);

  if (progress >= 1) {
    animationRef.current.isAnimating = false;

    if (focusRef.current) {
      controls.enabled = false;
      controls.enableRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
      camera.lookAt(controls.target);
    } else if (savedCamRef.current) {
      controls.enabled = savedCamRef.current.controlsEnabled;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      camera.up.copy(new THREE.Vector3(0, 1, 0));
      camera.lookAt(controls.target);
    }
  }
}