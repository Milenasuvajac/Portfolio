import {useFrame} from "@react-three/fiber";
import React, {useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";
import {Html} from "@react-three/drei";

export default function MonitorIframeHtml({
                                              target,
                                              url,
                                              widthPx,
                                              heightPx,
                                              controls,
                                          }: {
    target: THREE.Mesh | null;
    url: string;
    widthPx: number;
    heightPx: number;
    controls: React.MutableRefObject<any | null>;
}) {
    const groupRef = useRef<THREE.Group>(null!);
    const yRotOffset = useMemo(
        () => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI),
        []
    );
    const tmpPos = useMemo(() => new THREE.Vector3(), []);
    const tmpQuat = useMemo(() => new THREE.Quaternion(), []);
    const tmpScale = useMemo(() => new THREE.Vector3(), []);
    const [scale, setScale] = useState(0.1);

    useEffect(() => {
        if (!target) return;
        const bbox = new THREE.Box3().setFromObject(target);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const monitorWidthWorld = size.x > 0 ? size.x : 1.4;
        const monitorHeightWorld = size.y > 0 ? size.y : 0.9;

        const scaleX = monitorWidthWorld / widthPx;
        const scaleY = monitorHeightWorld / heightPx;

        setScale(Math.min(scaleX, scaleY));
    }, [target, widthPx, heightPx]);

    useFrame(() => {
        if (!target || !groupRef.current) return;
        target.updateWorldMatrix(true, false);
        target.matrixWorld.decompose(tmpPos, tmpQuat, tmpScale);
        groupRef.current.position.copy(tmpPos);
        groupRef.current.quaternion.copy(tmpQuat).premultiply(yRotOffset).normalize();
        groupRef.current.scale.setScalar(scale);
    });

    const onEnter = () => {
        if (controls.current) {
            controls.current.enabled = false;
            controls.current.enableZoom = false;
            controls.current.enablePan = false;
            controls.current.enableRotate = false;
        }
    };
    const onLeave = () => {
        if (controls.current) {
            controls.current.enabled = true;
            controls.current.enableZoom = true;
            controls.current.enablePan = true;
            controls.current.enableRotate = true;
        }
    };

    return (
        <group ref={groupRef}>
            <Html
                transform
                occlude="blending"
                position={[-2.699, 4.5, -1.5]}
                rotation={[0, Math.PI / 2, 0]}
            >
                <div style={{
                    width: widthPx,
                    height: heightPx,
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    <div style={{
                        transform: `scale(${widthPx / 1280})`,
                        transformOrigin: 'top left',
                        width: 1280,
                        height: 720,
                        isolation: 'isolate'
                    }}>
                        <iframe
                            src={url}
                            width="1280"
                            height="720"
                            style={{
                                border: 0,
                                borderRadius: 1,
                                backgroundColor: '#ffffff',
                                pointerEvents: 'auto',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                imageRendering: 'optimizeSpeed'
                            }}
                            onMouseEnter={onEnter}
                            onMouseLeave={onLeave}
                        />
                    </div>
                </div>
            </Html>
        </group>
    );
}