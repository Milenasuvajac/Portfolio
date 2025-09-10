import * as THREE from "three";

export function createRockWithMossMaterial() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base rock color - dark grey
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, size, size);

    // Add rock texture with noise
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const brightness = Math.random() * 60 + 20;
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.fillRect(x, y, 2, 2);
    }

    // Add moss patches
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 30 + 5;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, "rgba(34, 80, 34, 0.8)");
        gradient.addColorStop(1, "rgba(34, 80, 34, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.1,
    });
}