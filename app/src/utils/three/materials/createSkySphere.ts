import * as THREE from "three";

export function createSkySphere(skyGroup: THREE.Group): void {
    // Create sky sphere geometry
    const skyGeometry = new THREE.SphereGeometry(1000, 64, 32);

    // Create gradient material for realistic sky
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            sunPosition: { value: new THREE.Vector3(0, -0.1, 0) }, // Below horizon for night
            nightIntensity: { value: 0.7 }, // How "night" it is (0 = day, 1 = deep night)
            horizonColor: { value: new THREE.Color(0x040917) },
            zenithColor: { value: new THREE.Color(0x40007d) },
            starFieldColor: { value: new THREE.Color(0x0e0e1a) }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 sunPosition;
            uniform float nightIntensity;
            uniform vec3 horizonColor;
            uniform vec3 zenithColor;
            uniform vec3 starFieldColor;
            
            varying vec3 vWorldPosition;
            varying vec2 vUv;
            
            // Noise function for atmospheric variations
            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float smoothNoise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            void main() {
                vec3 direction = normalize(vWorldPosition);
                float elevation = direction.y;
                
                // Create atmospheric gradient
                float horizonFade = smoothstep(-0.1, 0.3, elevation);
                float zenithFade = smoothstep(0.3, 0.9, elevation);
                
                // Base sky color mixing
                vec3 skyColor = mix(horizonColor, starFieldColor, horizonFade);
                skyColor = mix(skyColor, zenithColor, zenithFade);
                
                // Add subtle atmospheric scattering
                float atmosphericDensity = exp(-elevation * 2.0);
                vec3 scatterColor = vec3(0.1, 0.15, 0.3) * atmosphericDensity * 0.3;
                
                // Add subtle noise for atmospheric variation
                float noiseValue = smoothNoise(direction.xz * 10.0 + time * 0.1) * 0.05;
                
                // Combine colors
                vec3 finalColor = skyColor + scatterColor + noiseValue;
                
                // Apply night intensity
                finalColor *= nightIntensity;
                
                // Add very subtle horizon glow
                if (elevation < 0.1) {
                    float horizonGlow = exp(-abs(elevation) * 20.0) * 0.1;
                    finalColor += vec3(horizonGlow * 0.3, horizonGlow * 0.4, horizonGlow * 0.8);
                }
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.BackSide,
        transparent: false,
        depthWrite: false,
        depthTest: true
    });

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.name = 'SkySphere';
    skyGroup.add(skyMesh);
}