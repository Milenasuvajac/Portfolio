import * as THREE from "three";
import {createMilkyWayTexture} from "@/utils/three/materials/createMilkyWayTexture";

export function createMilkyWay(skyGroup: THREE.Group): void {
    // Create Milky Way band across the sky
    const milkyWayGeometry = new THREE.SphereGeometry(500, 64, 32);

    const milkyWayMaterial = new THREE.ShaderMaterial({
        uniforms: {
            milkyWayTexture: { value: createMilkyWayTexture() },
            opacity: { value: 0.1 },
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D milkyWayTexture;
            uniform float opacity;
            uniform float time;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            
            void main() {
                // Create Milky Way band effect
                vec2 milkyWayUV = vUv;
                
                // Rotate UV coordinates to position Milky Way
                float angle = time * 0.001;
                mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
                milkyWayUV = rotation * (milkyWayUV - 0.5) + 0.5;
                
                // Sample the texture
                vec4 milkyWay = texture2D(milkyWayTexture, milkyWayUV);
                
                // Create band mask - make it more visible and properly positioned
                float bandHeight = 0.15; // Width of Milky Way band
                float bandCenter = 0.65; // Center position
                float distFromCenter = abs(vUv.y - bandCenter);
                float bandMask = 1.0 - smoothstep(0.0, bandHeight, distFromCenter);
                
                // Apply mask and opacity
                milkyWay.a *= bandMask * opacity;
                
                gl_FragColor = milkyWay;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });

    const milkyWayMesh = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
    milkyWayMesh.name = 'MilkyWay';
    skyGroup.add(milkyWayMesh);
}