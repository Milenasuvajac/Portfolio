import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";

export function createSea(): THREE.Object3D {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
            "textures/water0325b.jpg",
            (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0x000000,
        waterColor: 0x01141a,
        distortionScale: 1.5,
        //fog: false,
    });

    water.rotation.x = -Math.PI / 2;

    // Position unter dein Model setzen:
    // Dein Modell steht ungefähr bei y = 1.77
    // → Meer leicht darunter z. B. bei y = 0
    water.position.set(0, -5, 0);

    return water;
}
