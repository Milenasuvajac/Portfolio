import type { InteractionDeps } from "./types";
import { focusMonitor } from "./focusMonitor";
import { blurMonitor } from "./blurMonitor";

export function handleKeyDown(event: KeyboardEvent, deps: InteractionDeps): void {
  const { animationRef, focusRef } = deps;

  // Prevent toggling while animation is in progress
  if (animationRef.current?.isAnimating) {
    event.preventDefault();
    return;
  }

  if (event.key === " ") { // Space key
    event.preventDefault();
    if (focusRef.current) {
      blurMonitor(deps);
    } else {
      focusMonitor(deps);
    }
  } else if (event.key === "Escape") {
    event.preventDefault();
    if (focusRef.current) {
      blurMonitor(deps);
    }
  }
}