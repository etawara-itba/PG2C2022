import * as THREE from 'three';

// (heavily) based on code from https://stackoverflow.com/questions/35523405/adding-a-texture-to-extrudegeometry
export const BoundingBoxUVGenerator: THREE.UVGenerator = {
    generateTopUV(geometry: THREE.ExtrudeGeometry, vertices: number[], idxA: number, idxB: number, idxC: number) {
        const ax = vertices[idxA * 3];
        const ay = vertices[idxA * 3 + 1];
        const bx = vertices[idxB * 3];
        const by = vertices[idxB * 3 + 1];
        const cx = vertices[idxC * 3];
        const cy = vertices[idxC * 3 + 1];
        return [new THREE.Vector2(ax, ay), new THREE.Vector2(bx, by), new THREE.Vector2(cx, cy)];
    },
    generateSideWallUV(
        geometry: THREE.ExtrudeGeometry,
        vertices: number[],
        idxA: number,
        idxB: number,
        idxC: number,
        idxD: number,
    ) {
        geometry.computeBoundingBox();

        const ax = vertices[idxA * 3];
        const ay = vertices[idxA * 3 + 1];
        const az = vertices[idxA * 3 + 2];
        const bx = vertices[idxB * 3];
        const by = vertices[idxB * 3 + 1];
        const bz = vertices[idxB * 3 + 2];
        const cx = vertices[idxC * 3];
        const cy = vertices[idxC * 3 + 1];
        const cz = vertices[idxC * 3 + 2];
        const dx = vertices[idxD * 3];
        const dy = vertices[idxD * 3 + 1];
        const dz = vertices[idxD * 3 + 2];

        if (Math.abs(ay - by) < 0.01) {
            return [
                new THREE.Vector2(ax, 1 - az),
                new THREE.Vector2(bx, 1 - bz),
                new THREE.Vector2(cx, 1 - cz),
                new THREE.Vector2(dx, 1 - dz),
            ];
        } else {
            return [
                new THREE.Vector2(ay, 1 - az),
                new THREE.Vector2(by, 1 - bz),
                new THREE.Vector2(cy, 1 - cz),
                new THREE.Vector2(dy, 1 - dz),
            ];
        }
    },
};
