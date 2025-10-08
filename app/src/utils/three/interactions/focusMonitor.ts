import * as THREE from "three";
import { animateCameraTo } from "@/utils/three/animation/cameraAnimation";
import { calculateMonitorFocusPosition } from "@/utils/three/animation/cameraTargets";
import type { InteractionDeps } from "./types";

// Focus the camera on the monitor and enable iframe interaction
export function focusMonitor(deps: InteractionDeps): void {
  const { camera, controls, monitorRef, animationRef, focusRef, savedCamRef, setIsFocused, setShowMonitorHint, canvasMonitor } = deps;

  // Block re-entry while animating
  if (animationRef.current?.isAnimating) return;
  if (!monitorRef.current || focusRef.current) return;

  // Save current camera state
  savedCamRef.current = {
    position: camera.position.clone(),
    target: (controls?.target as THREE.Vector3)?.clone?.() ?? new THREE.Vector3(),
    up: camera.up.clone(),
    controlsEnabled: Boolean(controls?.enabled),
  };

  // Calculate focus position
  const { position, target, up } = calculateMonitorFocusPosition(monitorRef.current);

  // Start animation with smoother easing and faster duration
  animateCameraTo(camera as any, controls as any, position, target, animationRef, 900, up);
  focusRef.current = true;
  setIsFocused(true);
  // Hide hint once user focuses the monitor
  setShowMonitorHint(false);

  // Enable iframe interaction in focus mode
  canvasMonitor.setZoomState(true);
}