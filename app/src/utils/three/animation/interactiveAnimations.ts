import * as THREE from "three";

export interface InteractiveAnimationState {
    originalScale: THREE.Vector3;
    originalPosition: THREE.Vector3;
    originalRotation: THREE.Euler;
    targetScale: number;
    targetPosition: THREE.Vector3;
    targetRotation: THREE.Euler;
}

export interface AnimationConfig {
    hoverScaleFactor: number;
    pulseScaleFactor: number;
    hoverPositionOffset: number;
    pulsePositionOffset: number;
    rotationSpeed: number;
    smoothingFactor: number;
    chairSmoothingFactor: number; // Separate smoothing factor for chairs
    chairXOffset: number; // X offset for chair objects to move them away from table
    cactusHoverScaleFactor: number; // Smaller scale factor for cactus
    monitorHoverScaleFactor: number; // Smaller scale factor for monitor
    frameHoverScaleFactor: number; // Larger scale factor for frame
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
    hoverScaleFactor: 1.18,
    pulseScaleFactor: 1.32,
    hoverPositionOffset: 0.08,
    pulsePositionOffset: 0.12,
    rotationSpeed: Math.PI * 0.25, // 45 degrees 
    smoothingFactor: 0.5, // Faster for non-chair objects
    chairSmoothingFactor: 0.15, // Slower for chairs
    chairXOffset: 0.6,
    cactusHoverScaleFactor: 1.08, // Smaller scale for cactus
    monitorHoverScaleFactor: 1.10, // Smaller scale for monitor
    frameHoverScaleFactor: 1.25 // Larger scale for frame
};

export class InteractiveObjectAnimator {
    private objects: Map<THREE.Object3D, InteractiveAnimationState> = new Map();
    private config: AnimationConfig;

    constructor(config: AnimationConfig = DEFAULT_ANIMATION_CONFIG) {
        this.config = config;
    }

    addObject(object: THREE.Object3D): void {
        console.log('Adding object to animator:', object.name);
        this.objects.set(object, {
            originalScale: object.scale.clone(),
            originalPosition: object.position.clone(),
            originalRotation: object.rotation.clone(),
            targetScale: 1.0,
            targetPosition: object.position.clone(),
            targetRotation: object.rotation.clone(),
        });
    }

    removeObject(object: THREE.Object3D): void {
        this.objects.delete(object);
    }

    setHoverState(object: THREE.Object3D, isHovered: boolean): void {
        const state = this.objects.get(object);
        if (!state) return;

        const objectName = (object.name || '').toLowerCase();
        const isChair = objectName.includes('chair');

        if (isChair) {
            // Handle chair as a group (both top and bottom parts)
            this.setChairGroupState(object, isHovered, false);
        } else {
            // Handle other objects individually
            if (isHovered) {
                // Determine scale factor based on object type
                let scaleFactor = this.config.hoverScaleFactor; // Default scale
                
                if (objectName.includes('cactus')) {
                    scaleFactor = this.config.cactusHoverScaleFactor;
                } else if (objectName.includes('monitor')) {
                    scaleFactor = this.config.monitorHoverScaleFactor;
                } else if (objectName.includes('frame')) {
                    scaleFactor = this.config.frameHoverScaleFactor;
                }
                
                // Other objects: scale and position
                state.targetScale = scaleFactor;
                state.targetPosition = state.originalPosition.clone();
                state.targetPosition.y += this.config.hoverPositionOffset;
                state.targetRotation = state.originalRotation.clone();
            } else {
                // Reset to original state
                state.targetScale = 1.0;
                state.targetPosition = state.originalPosition.clone();
                state.targetRotation = state.originalRotation.clone();
            }
        }
    }

    setPulseState(object: THREE.Object3D): void {
        const state = this.objects.get(object);
        if (!state) return;

        const objectName = (object.name || '').toLowerCase();
        const isChair = objectName.includes('chair');

        if (isChair) {
            // Handle chair as a group (both top and bottom parts)
            this.setChairGroupState(object, true, true);
        } else {
            // Other objects: larger scale and position
            state.targetScale = this.config.pulseScaleFactor;
            state.targetPosition = state.originalPosition.clone();
            state.targetPosition.y += this.config.pulsePositionOffset;
            state.targetRotation = state.originalRotation.clone();
        }
    }

    update(): void {
        for (const [object, state] of this.objects) {
            const objectName = (object.name || '').toLowerCase();
            const isChairTop = objectName.includes('chair') && objectName.includes('top');
            const isChair = objectName.includes('chair');

            if (isChairTop) {
                // Chair Top: rotation and position movement (slow)
                object.rotation.y = THREE.MathUtils.lerp(
                    object.rotation.y,
                    state.targetRotation.y,
                    this.config.chairSmoothingFactor
                );
                object.position.lerp(state.targetPosition, this.config.chairSmoothingFactor);
                console.log('Updating Chair_Top position to:', object.position.x, 'target:', state.targetPosition.x);
            } else if (isChair) {
                // Chair Legs: rotation and position (slow)
                object.rotation.y = THREE.MathUtils.lerp(
                    object.rotation.y,
                    state.targetRotation.y,
                    this.config.chairSmoothingFactor
                );
                object.position.lerp(state.targetPosition, this.config.chairSmoothingFactor);
            } else {
                // Other objects: scale and position (fast)
                const targetScaleVec = new THREE.Vector3(
                    state.originalScale.x * state.targetScale,
                    state.originalScale.y * state.targetScale,
                    state.originalScale.z * state.targetScale
                );
                object.scale.lerp(targetScaleVec, this.config.smoothingFactor);
                object.position.lerp(state.targetPosition, this.config.smoothingFactor);
            }
        }
    }

    getObjects(): THREE.Object3D[] {
        return Array.from(this.objects.keys());
    }

    hasObject(object: THREE.Object3D): boolean {
        return this.objects.has(object);
    }

    private findChairParts(chairObject: THREE.Object3D): THREE.Object3D[] {
        const chairParts: THREE.Object3D[] = [];
        const objectName = (chairObject.name || '').toLowerCase();
        
        if (!objectName.includes('chair')) {
            return [chairObject];
        }

        // Find all chair objects (both top and bottom)
        for (const [obj] of this.objects) {
            const objName = (obj.name || '').toLowerCase();
            if (objName.includes('chair')) {
                chairParts.push(obj);
            }
        }

        return chairParts.length > 0 ? chairParts : [chairObject];
    }

    private setChairGroupState(chairObject: THREE.Object3D, isHovered: boolean, isPulse: boolean = false): void {
        const chairParts = this.findChairParts(chairObject);
        
        // Debug: Log which chair parts are found
        console.log('Chair parts found:', chairParts.map(p => p.name));
        console.log('Triggered by:', chairObject.name, 'isHovered:', isHovered, 'isPulse:', isPulse);
        
        for (const part of chairParts) {
            const state = this.objects.get(part);
            if (!state) {
                console.log('No state found for:', part.name);
                continue;
            }

            console.log('Animating part:', part.name);
            
            if (isHovered || isPulse) {
                state.targetScale = 1.0;
                state.targetPosition = state.originalPosition.clone();
                state.targetRotation = state.originalRotation.clone();
                
                if (part.name === 'Chair_Top') {
                    // Chair_Top: rotation + X movement
                    state.targetRotation.y += isPulse ? 
                        this.config.rotationSpeed * 1.5 : 
                        this.config.rotationSpeed;
                    state.targetPosition.x = state.originalPosition.x + this.config.chairXOffset;
                    console.log('Chair_Top - rotating and moving in X from', state.originalPosition.x, 'to:', state.targetPosition.x);
                } else {
                    // Chair_Legs: rotation + X offset
                    state.targetRotation.y += isPulse ? 
                        this.config.rotationSpeed * 1.5 : 
                        this.config.rotationSpeed;
                    state.targetPosition.x = state.originalPosition.x + this.config.chairXOffset;
                    console.log('Chair_Legs - rotating and moving in X from', state.originalPosition.x, 'to:', state.targetPosition.x);
                }
            } else {
                // Reset to original state
                state.targetScale = 1.0;
                state.targetPosition = state.originalPosition.clone();
                state.targetRotation = state.originalRotation.clone();
            }
        }
    }
}