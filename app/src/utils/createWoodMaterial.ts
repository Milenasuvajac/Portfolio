import * as THREE from "three";

export function createWoodMaterial() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Could not get 2D context for canvas");
    }

    // Base wood color gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, "#403424");
    gradient.addColorStop(1, "#492E19");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Wood grain rings with gradients
    for (let i = 0; i < 12; i++) {
        const centerX = size/2 + (Math.random() - 0.5) * 80;
        const centerY = size/2 + (Math.random() - 0.5) * 80;
        const radius = 25 + i * 20 + Math.random() * 15;

        const ringGradient = ctx.createRadialGradient(centerX, centerY, radius-5, centerX, centerY, radius+5);
        ringGradient.addColorStop(0, "#4f3d24");
        ringGradient.addColorStop(0.5, "#3b2f1e");
        ringGradient.addColorStop(1, "#36322e");

        ctx.strokeStyle = ringGradient;
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Convert canvas to Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    // Return a standard PBR material with the wood texture
    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.0,
    });
}