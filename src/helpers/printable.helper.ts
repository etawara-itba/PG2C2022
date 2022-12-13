import {
    POINTS_PER_HEIGHT,
    PRINTABLE_DIFFUSE_MATERIALS,
    PRINTABLE_SHAPES,
    PRINT_STATE,
    RADIUS,
} from '../constants/printable.constants';
import * as THREE from 'three';
import { getThreeShape } from './shape.helper';
import { BoundingBoxUVGenerator } from './uv.helper';

export const generatePrintableMesh = (
    shape: PRINTABLE_SHAPES,
    twistAngle: number,
    height: number,
    material: THREE.Material | THREE.Material[],
): THREE.Mesh => {
    if (height <= 0) throw new Error(`height must be > 0 (height=${height})`);

    const divisions = POINTS_PER_HEIGHT * height;
    let geometry: THREE.BufferGeometry;
    if (isRevolution(shape)) {
        geometry = generateRevolutionGeometry(shape, divisions);
    } else if (isExtrude(shape)) {
        geometry = generateExtrudeGeometry(shape, divisions, twistAngle);
    } else {
        throw new Error(`shape is not revolution nor extrude (shape = ${shape})`);
    }
    geometry.scale(RADIUS, height, RADIUS);

    return new THREE.Mesh(geometry, material);
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

const generateRevolutionGeometry = (shape: PRINTABLE_SHAPES, divisions: number): THREE.BufferGeometry => {
    if (!isRevolution(shape)) throw Error(`${shape} is not revolution shape`);

    const points = getThreeShape(shape).getSpacedPoints(divisions);
    return new THREE.LatheGeometry(points);
};

const generateExtrudeGeometry = (
    shape: PRINTABLE_SHAPES,
    divisions: number,
    twistAngle: number,
): THREE.BufferGeometry => {
    if (!isExtrude(shape)) throw Error(`${shape} is not extrude shape`);

    const extrudeSettings = {
        steps: divisions,
        depth: 1,
        bevelEnabled: false,
        uvGenerator: BoundingBoxUVGenerator,
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
    const normalAttribute = geometry.getAttribute('normal');
    const positionPoint = new THREE.Vector3();
    const normalPoint = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        positionPoint.fromBufferAttribute(positionAttribute, i);
        normalPoint.fromBufferAttribute(normalAttribute, i);

        // a single vertex Y position
        const yPos = positionPoint.y;
        const upVec = new THREE.Vector3(0, 1, 0);

        quaternion.setFromAxisAngle(upVec, (Math.PI / 180) * twistAmount * yPos);

        positionPoint.applyQuaternion(quaternion);
        normalPoint.applyQuaternion(quaternion);

        positionAttribute.setXYZ(i, positionPoint.x, positionPoint.y, positionPoint.z);
        normalAttribute.setXYZ(i, normalPoint.x, normalPoint.y, normalPoint.z);
    }

    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('normal', normalAttribute);
};

export const getPrintableTexture = (
    textureId: PRINTABLE_DIFFUSE_MATERIALS | string,
    state: PRINT_STATE,
): THREE.Texture => {
    return new THREE.TextureLoader().load(`maps/printableMaterial${textureId}${state}.png`);
};
