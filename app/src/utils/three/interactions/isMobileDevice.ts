// Detect if the current device has touch capabilities
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
}