import { POINTS_PER_HEIGHT, PRINTABLE_SHAPES, RADIUS } from '../constants/printable.constants';
import * as THREE from 'three';
import { getThreeShape } from './shape.helper';

export const generatePrintableMesh = (
    shape: PRINTABLE_SHAPES,
    twistAngle: number,
    height: number,
    material: THREE.Material,
): THREE.Mesh => {
    if (height <= 0) throw new Error(`height must be > 0 (height=${height})`);

    let geometry: THREE.BufferGeometry;
    if (isRevolution(shape)) {
        geometry = generateRevolutionGeometry(shape, height);
    } else if (isExtrude(shape)) {
        geometry = generateExtrudeGeometry(shape, twistAngle);
    } else {
        throw new Error(`shape is not revolution nor extrude (shape = ${shape})`);
    }

    const mesh: THREE.Mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(RADIUS, height, RADIUS);

    return mesh;
};

const isRevolution = (shape: PRINTABLE_SHAPES): boolean => {
    const revolution: PRINTABLE_SHAPES[] = [
        PRINTABLE_SHAPES.A1,
        PRINTABLE_SHAPES.A2,
        PRINTABLE_SHAPES.A3,
        PRINTABLE_SHAPES.A4,
    ];
    return revolution.includes(shape);
};

const isExtrude = (shape: PRINTABLE_SHAPES): boolean => {
    const extrude: PRINTABLE_SHAPES[] = [
        PRINTABLE_SHAPES.B1,
        PRINTABLE_SHAPES.B2,
        PRINTABLE_SHAPES.B3,
        PRINTABLE_SHAPES.B4,
    ];
    return extrude.includes(shape);
};

const generateRevolutionGeometry = (shape: PRINTABLE_SHAPES, height: number): THREE.BufferGeometry => {
    if (!isRevolution(shape)) throw Error(`${shape} is not revolution shape`);

    const points = getThreeShape(shape).getPoints(height * POINTS_PER_HEIGHT);
    return new THREE.LatheGeometry(points);
};

const generateExtrudeGeometry = (shape: PRINTABLE_SHAPES, twistAngle: number): THREE.BufferGeometry => {
    if (!isExtrude(shape)) throw Error(`${shape} is not extrude shape`);

    const extrudeSettings = {
        steps: POINTS_PER_HEIGHT,
        depth: 1,
        bevelEnabled: false,
    };

    const threeShape: THREE.Shape = getThreeShape(shape);
    const geometry = new THREE.ExtrudeGeometry(threeShape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);
    twistGeometry(geometry, twistAngle);

    return geometry;
};

const twistGeometry = (geometry: THREE.BufferGeometry, twistAmount: number): void => {
    const quaternion = new THREE.Quaternion();
    const positionAttribute = geometry.getAttribute('position');
    const point = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        point.fromBufferAttribute(positionAttribute, i);

        // a single vertex Y position
        const yPos = point.y;
        const upVec = new THREE.Vector3(0, 1, 0);

        quaternion.setFromAxisAngle(upVec, (Math.PI / 180) * twistAmount * yPos);

        point.applyQuaternion(quaternion);

        positionAttribute.setXYZ(i, point.x, point.y, point.z);
    }

    geometry.setAttribute('position', positionAttribute);
};
