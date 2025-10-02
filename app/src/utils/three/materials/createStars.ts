import * as THREE from "three";

export async function createStars(skyGroup: THREE.Group) {

    const res = await fetch("/BSC_filtered.json");
    const starCatalog = await res.json() as StarRecord[];

    starCatalog.forEach((st: StarRecord) => {
        const raParts = st.RA.split(":").map(parseFloat);
        const ra =
            (raParts[0] / 24 +
                raParts[1] / (24 * 60) +
                raParts[2] / (24 * 3600)) *
            2 *
            Math.PI;

        const decParts = st.DEC.replace("+", "").split(":").map(parseFloat);
        let de =
            (decParts[0] / 360 +
                decParts[1] / (360 * 60) +
                decParts[2] / (360 * 3600)) *
            2 *
            Math.PI;
        if (st.DEC.startsWith("-")) de = -de;

        const sx = 10000 * Math.cos(de) * Math.cos(ra);
        const sy = 10000 * Math.cos(de) * Math.sin(ra);
        const sz = 10000 * Math.sin(de);

        const vmag = parseFloat(st.MAG);
        const size = 50 * Math.pow(1.35, Math.min(-vmag, 0.15));

        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const spectralClass = st["Title HD"];
        const color = spectralTypeToColor(spectralClass);

        const material = new THREE.MeshBasicMaterial({ color });


        const star = new THREE.Mesh(geometry, material);
        star.position.set(sy, sz, sx);
        skyGroup.add(star);
    });
}

type StarRecord = {
    RA: string;
    DEC: string;
    MAG: string;
    "Title HD"?: string;
};

function spectralTypeToColor(spectral: string | undefined): number {
    if (!spectral) return 0xffffff;
    const type = spectral[0].toUpperCase();

    switch (type) {
        case "O": return 0x9bb0ff; // blue
        case "B": return 0xaabfff; // blue-white
        case "A": return 0xcad7ff; // white
        case "F": return 0xf8f7ff; // yellow white
        case "G": return 0xfff4e8; // yellow
        case "K": return 0xffddb4; // orange
        case "M": return 0xffbd6f; // red
        default:  return 0xffffff; // fallback
    }
}
