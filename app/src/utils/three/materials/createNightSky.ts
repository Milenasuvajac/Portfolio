import {createStars} from "@/utils/three/materials/createStars";

import * as THREE from "three";
import {createSkySphere} from "@/utils/three/materials/createSkySphere";
import {createMilkyWay} from "@/utils/three/materials/createMilkyWay";


export async function createNightSky(): Promise<THREE.Group> {
    const skyGroup = new THREE.Group();

    createSkySphere(skyGroup);
    await createStars(skyGroup);
    createMilkyWay(skyGroup);
    return skyGroup;
}
