import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {createSimpleMeshMaterial} from "@/utils/three/materials/createSimpleMeshMaterial";
import {createRockWithMossMaterial} from "@/utils/three/materials/createRockWithMossMaterial";
import {createSeaweedMaterial} from "@/utils/three/materials/createSeaweedMaterial";
import {createChocolateCookieMaterial} from "@/utils/three/materials/createChocolateCookieMaterial";
import {createWoodMaterial} from "@/utils/three/materials/createWoodMaterial";
import {hangingPlantMaterial} from "@/utils/three/materials/hangingPlantMaterial";
import {glassMaterial} from "@/utils/three/materials/glassMaterial";


// Handle the GLTF loading and material assignments
export const useRoomModel = (scene: THREE.Scene) => {
    const textureLoader = new THREE.TextureLoader();

    const catTexture = textureLoader.load('/textures/Color_7c0ec996-cf6b-498a-a581-82a24d8f65b2.png');
    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
        "/models/RoomV17.gltf",
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);

            gltf.scene.traverse((child: any) => {
                if(!child.name.includes("Sun")) {
                    child.castShadow = true;
                }
                if (child.material && child.material.name.includes("Glass")) {
                    child.material = glassMaterial;
                }
                if (child.material && child.material.name.includes("Hanging Plant")) {
                    child.material = hangingPlantMaterial;
                }
                if (child.name === "cat") {
                    child.material.map = catTexture;
                    child.material.roughness = 0.9;
                    child.material.metalness = 0.0;
                    child.material.needsUpdate = true;
                    catTexture.wrapS = THREE.RepeatWrapping;
                    catTexture.wrapT = THREE.RepeatWrapping;
                    catTexture.flipY = false;
                    child.castShadow = true;
                }
                if (child.material && child.material.name.includes("Wood")) {
                    child.material = createWoodMaterial();
                    child.castShadow = true;
                    child.receiveShadow = true;

                }
                if (child.name.includes("cookie")){
                    child.material = createChocolateCookieMaterial();
                }
                if (child.name.includes("Seaweed")){
                    child.material = createSeaweedMaterial();
                }
                if (child.name.includes("Mossy")){
                    child.material = createRockWithMossMaterial();
                }
                if (child.material && child.material.name.includes("Speaker Inside"))
                {
                    child.material = createSimpleMeshMaterial();
                }
            });

            scene.add(model);
        },
        undefined,
        (error) => {
            console.error("Error loading GLB:", error);
        }
    );

}