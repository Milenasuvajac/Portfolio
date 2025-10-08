import * as THREE from "three";
import type { InteractionDeps } from "./types";

export function handleCanvasMouseMove(event: MouseEvent, deps: InteractionDeps): void {
  const { renderer, camera, animatorRef, hoveredRef, focusRef } = deps;
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

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

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
}