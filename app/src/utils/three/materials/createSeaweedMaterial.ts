import * as THREE from "three";

export function createSeaweedMaterial() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Base gradient: darker edges, lighter middle
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, "#061805"); // dark green left edge
    gradient.addColorStop(0.5, "#194217"); // bright green middle
    gradient.addColorStop(1, "#0D211D"); // dark green right edge
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle vertical highlight stripe in the middle
    const highlight = ctx.createLinearGradient(size * 0.45, 0, size * 0.55, 0);
    highlight.addColorStop(0, "rgba(255,255,255,0)");
    highlight.addColorStop(0.5, "rgba(255,255,255,0.2)");
    highlight.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.4,
        metalness: 0.2,
    });
}