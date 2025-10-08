import { animateCameraTo } from "@/utils/three/animation/cameraAnimation";
import type { InteractionDeps } from "./types";

// Exit focus mode and return the camera to its saved position
export function blurMonitor(deps: InteractionDeps): void {
  const { camera, controls, animationRef, focusRef, savedCamRef, setIsFocused, canvasMonitor } = deps;

  // Block re-entry while animating
  if (animationRef.current?.isAnimating) return;
  if (!focusRef.current || !savedCamRef.current) return;

  // Start animation back to saved position
  animateCameraTo(
    camera as any,
    controls as any,
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
}