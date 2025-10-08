import type { InteractionDeps } from "./types";

export function handleTouchMove(event: TouchEvent, deps: InteractionDeps): void {
  const { focusRef, animatorRef, hoveredRef } = deps;

  // Disable all touch move when iframe is in focus mode
  if (focusRef.current) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // On mobile, we don't want hover effects during touch move
  // Reset any hovered object
  if (hoveredRef.current) {
    animatorRef.current.setHoverState(hoveredRef.current, false);
    hoveredRef.current = null;
  }
}