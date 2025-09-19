"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRoomModel } from "@/hooks/three/useRoomModel";
import { createNightSky } from "@/utils/three/materials/createNightSky";
import { createSea2 } from "@/utils/three/materials/createSea2";
import MonitorIframeHtml from "@/components/three/MonitorIframeHtml";


function SceneContent() {
  const { scene } = useThree();
  const controlsRef = useRef<any>(null);
  const monitorRef = useRef<THREE.Mesh | null>(null);

  // Add sea
  const sea = useMemo(() => createSea2(), []);
  useEffect(() => {
    scene.add(sea);
    return () => {
      scene.remove(sea);
    };
  }, [scene, sea]);

  // Add sky when loaded
  useEffect(() => {
    let mounted = true;
    createNightSky().then((sky) => {
      if (mounted) scene.add(sky);
    });
    return () => {
      mounted = false;
    };
  }, [scene]);

  // Load room model and capture monitor surface mesh
  useRoomModel(scene, (gltf) => {
    gltf.scene.traverse((child: any) => {
      if (child.userData && child.userData.isMonitorSurface) {
        monitorRef.current = child as THREE.Mesh;
      }
    });
  });

  // Lights
  useEffect(() => {
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 5, 2);
    dirLight.castShadow = true;
    scene.add(dirLight);
    return () => {
      scene.remove(dirLight);
      (dirLight as any).dispose?.();
    };
  }, [scene]);

  return (
    <>
      <OrbitControls ref={controlsRef} makeDefault enableDamping />
{/*      <MonitorIframeHtml
        target={monitorRef.current}
        url="/aboutme/public"
        widthPx={80}
        heightPx={46}
        controls={controlsRef}
      /> */}
    </>
  );
}

export default function ThreeScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows camera={{ fov: 75, position: [4.150419508853013, 1.7776508792813757, 10] }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
