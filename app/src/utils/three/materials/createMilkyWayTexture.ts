import * as THREE from "three";

export function createMilkyWayTexture(): THREE.Texture {
    const size = 5;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillRect(0, 0, size, size);

    // Add star clusters
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * size;
        const y = size * 0.3 + Math.random() * size * 0.4; // Concentrate in middle band
        const brightness = Math.random() * 0.7 + 0.2;
        const radius = Math.random() * 1.5 + 0.5;

        ctx.fillStyle = `rgba(250, 3, 0, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}