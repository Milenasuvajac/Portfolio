import type { InteractionDeps } from "./types";
import { handleCanvasClick } from "./handleCanvasClick";

export function handleTouchStart(event: TouchEvent, deps: InteractionDeps): void {
  const { focusRef } = deps;

  // Disable all touch interactions when iframe is in focus mode
  if (focusRef.current) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // Prevent default to avoid triggering mouse events
  event.preventDefault();

  if (event.touches.length === 1) {
    const touch = event.touches[0];
    // Convert touch to mouse event format for consistency
    const mouseEvent = new MouseEvent('click', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true
    });
    handleCanvasClick(mouseEvent, deps);
  }
}