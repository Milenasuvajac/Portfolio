"use client";

import {useEffect, useRef} from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {createWoodMaterial} from "@/utils/createWoodMaterial";
//import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current!.clientWidth / mountRef.current!.clientHeight,
            0.1,
            1000
        );
        camera.position.set( 4.150419508853013,  1.7776508792813757, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            mountRef.current!.clientWidth,
            mountRef.current!.clientHeight
        );
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current!.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;  // smooth movement
        controls.dampingFactor = 0.05;
        controls.enablePan = true;      // allow moving scene
        controls.enableZoom = true;     // allow zoom with scroll
        controls.target.set( -0.00763346160769606, 0.9865404956019542, 0.2127792947689923);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(5, 10, 5);
        scene.add(dirLight);

        const textureLoader = new THREE.TextureLoader();

        const catTexture = textureLoader.load('/textures/Color_7c0ec996-cf6b-498a-a581-82a24d8f65b2.png');
        // Load GLB model
        const loader = new GLTFLoader();
        loader.load(
            "/models/RoomV15.gltf",
            (gltf) => {
                const model = gltf.scene;
                model.scale.set(1, 1, 1);

                gltf.scene.traverse((child: any) => {
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
                        // flip vertically
                        catTexture.flipY = false;
                    }
                    if (child.material && child.material.name.includes("Wood")) {
                        child.material = createWoodMaterial();
                    }
            });

                scene.add(model);
            },
            undefined,
            (error) => {
                console.error("Error loading GLB:", error);
            }
        );


        const glassMaterial = new THREE.MeshPhysicalMaterial({
            transmission: 0.6,
            opacity: 1,
            color: 0xfbfbfb,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            thickness: 0.05,
            specularIntensity: 0.7,
            envMapIntensity: 0.9,
            depthWrite: false,
            specularColor: 0xE574B9,
        });

        const hangingPlantMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x498644,
            roughness: 0.9,
            metalness: 0.0,
            transmission: 0.0,
            thickness: 0.0,
            clearcoat: 0.3,
            clearcoatRoughness: 0.7,
        });


// FBX loader
/*        const loader = new FBXLoader();
        loader.load(
            "models/RoomV10.fbx",
            function (object: THREE.Object3D<THREE.Object3DEventMap>) {
                object.scale.set(0.01, 0.01, 0.01);

                object.traverse((child: any) => {
                    if (child.isMesh) {
                        if (child.name.includes("Glass")) {
                            console.log("Glass found:", child);
                            child.material = glassMaterial;

                        }
                    }
                });

                scene.add(object);
            },
            undefined,
            function (error: any) {
                console.error(error);
            }
        );*/

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            //console.log("Camera position: ", camera.position);
            //console.log("Target position: ", controls.target);
        };
        animate();

        // Resize handling
        const handleResize = () => {
            if (mountRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();

            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
