import * as THREE from "three";

export function createChocolateCookieMaterial() {
    const size = 212;
    // === Color texture (cookie base) ===
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#3e2014");
    gradient.addColorStop(1, "#261109");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Bump map with noise + lumps
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bumpCtx = bumpCanvas.getContext("2d")!;

    const imageData = bumpCtx.createImageData(size, size);
    const data = imageData.data;

    // Base grainy noise
    for (let i = 0; i < size * size * 4; i += 4) {
        const val = 100 + Math.random() * 80;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
    }
    bumpCtx.putImageData(imageData, 0, 0);

    bumpCtx.fillStyle = "rgba(40,40,40,0.5)"; // darker
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 6 + Math.random() * 15;
        bumpCtx.beginPath();
        bumpCtx.arc(x, y, r, 0, Math.PI * 2);
        bumpCtx.fill();
    }

    // Textures
    const colorTexture = new THREE.CanvasTexture(canvas);
    colorTexture.wrapS = THREE.RepeatWrapping;
    colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.repeat.set(2, 2);

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(2, 2);

    // Material
    return new THREE.MeshStandardMaterial({
        map: colorTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.4,
        roughness: 1,
        metalness: 0,
    });
}
