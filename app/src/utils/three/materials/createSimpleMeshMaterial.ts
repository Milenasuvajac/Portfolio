import * as THREE from "three";


export function createSimpleMeshMaterial() {
    const size = 52;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base color
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, size, size);

    // Draw mesh lines
    ctx.strokeStyle = "#242323";
    ctx.lineWidth = 2;

    const spacing = 8;

    // Vertical lines
    for (let x = 0; x <= size; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= size; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.3,
    });
}