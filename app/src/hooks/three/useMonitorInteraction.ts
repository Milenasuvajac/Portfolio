import * as THREE from "three";
import { useCallback, useRef } from "react";

interface InteractionZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: () => void;
}

interface MonitorInteractionOptions {
  canvasWidth: number;
  canvasHeight: number;
}

export function useMonitorInteraction(options: MonitorInteractionOptions) {
  const { canvasWidth, canvasHeight } = options;
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const monitorMeshRef = useRef<THREE.Mesh | null>(null);
  const interactionZonesRef = useRef<InteractionZone[]>([]);


  // Convert 3D world coordinates to 2D canvas coordinates
    useCallback((worldPoint: THREE.Vector3): { x: number; y: number } | null => {
    if (!monitorMeshRef.current) return null;

    // Transform world point to local monitor coordinates
    const localPoint = monitorMeshRef.current.worldToLocal(worldPoint.clone());
    
    // Assuming monitor surface is a plane from -1 to 1 in local space
    // Convert to UV coordinates (0 to 1)
    const u = (localPoint.x + 1) / 2;
    const v = 1 - (localPoint.y + 1) / 2; // Flip Y for canvas coordinates
    
    // Convert to canvas pixel coordinates
    const canvasX = u * canvasWidth;
    const canvasY = v * canvasHeight;
    
    // Validate coordinates are within canvas bounds
    if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
      return { x: canvasX, y: canvasY };
    }
    
    return null;
  }, [canvasWidth, canvasHeight]);

  // Set the monitor mesh reference
  const setMonitorMesh = useCallback((mesh: THREE.Mesh) => {
    monitorMeshRef.current = mesh;
  }, []);

  // Set the camera reference
  const setCamera = useCallback((camera: THREE.PerspectiveCamera) => {
    cameraRef.current = camera;
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    monitorMeshRef.current = null;
    interactionZonesRef.current = [];
  }, []);

  return {
    setMonitorMesh,
    setCamera,
    interactionZones: interactionZonesRef.current,
    cleanup
  };
}