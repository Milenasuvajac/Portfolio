import * as THREE from "three";
import type { InteractionDeps } from "./types";
import { focusMonitor } from "./focusMonitor";
import { isMobileDevice } from "./isMobileDevice";

export function handleCanvasClick(event: MouseEvent, deps: InteractionDeps): void {
  const { renderer, camera, monitorRef, gitHubRef, animatorRef, hoveredRef, focusRef, animationRef, canvasMonitor } = deps;

  // Prevent toggling while animation is in progress
  if (animationRef.current?.isAnimating) {
    event.preventDefault();
    return;
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // When in focus mode, only allow monitor clicks for iframe interaction
  if (focusRef.current) {
    if (!renderer || !monitorRef.current) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(monitorRef.current);

    if (intersects.length > 0) {
      canvasMonitor.handleMonitorClick();
    }
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
      focusMonitor(deps);
    }
  }
}