import { PRINTABLE_SHAPES } from '../constants/printable.constants';
import * as THREE from 'three';

export const getThreeShape = (shape: PRINTABLE_SHAPES): THREE.Shape => {
    switch (shape) {
        case PRINTABLE_SHAPES.A1:
            return getA1Shape();
        case PRINTABLE_SHAPES.A2:
            return getA2Shape();
        case PRINTABLE_SHAPES.A3:
            return getA3Shape();
        case PRINTABLE_SHAPES.A4:
            return getA4Shape();
        case PRINTABLE_SHAPES.B1:
            return getB1Shape();
        case PRINTABLE_SHAPES.B2:
            return getB2Shape();
        case PRINTABLE_SHAPES.B3:
            return getB3Shape();
        case PRINTABLE_SHAPES.B4:
            return getB4Shape();
        default:
            throw new Error(`No THREE.Shape defined for ${shape}`);
    }
};

// Revolution Shapes

const getA1Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const A1_HEIGHT = 1;
    const A1_OUTER_WIDTH = 1;
    const A1_OUTER_HEIGHT = A1_HEIGHT * 0.2;
    const A1_VALLEY_HEIGHT = A1_HEIGHT * 0.1;
    const A1_INNER_WIDTH = A1_OUTER_WIDTH * 0.3;
    const A1_MIDDLE_WIDTH = A1_OUTER_WIDTH * 0.6;
    const A1_CP_HEIGHT = 0.1;

    shape.moveTo(0, 0);
    shape.lineTo(A1_OUTER_WIDTH, 0);
    shape.lineTo(A1_OUTER_WIDTH, A1_OUTER_HEIGHT);
    shape.bezierCurveTo(
        A1_OUTER_WIDTH,
        A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT,
        A1_INNER_WIDTH,
        A1_OUTER_HEIGHT,
        A1_INNER_WIDTH,
        A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT,
    );
    shape.bezierCurveTo(
        A1_INNER_WIDTH,
        A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT + A1_CP_HEIGHT,
        A1_MIDDLE_WIDTH,
        A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT,
        A1_MIDDLE_WIDTH,
        A1_HEIGHT / 2,
    );
    shape.bezierCurveTo(
        A1_MIDDLE_WIDTH,
        A1_HEIGHT - (A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT + A1_CP_HEIGHT),
        A1_INNER_WIDTH,
        A1_HEIGHT - (A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT + A1_CP_HEIGHT),
        A1_INNER_WIDTH,
        A1_HEIGHT - (A1_OUTER_HEIGHT + A1_VALLEY_HEIGHT),
    );
    shape.lineTo(A1_OUTER_WIDTH, A1_HEIGHT);
    shape.lineTo(0, A1_HEIGHT);

    return shape;
};

const getA2Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const A2_HEIGHT = 1;
    const A2_WIDTH = 1;
    const A2_MOUNT_LOWER_HEIGHT = A2_HEIGHT * 0.15;
    const A2_MOUNT_LOWER_CP = 0.075;
    const A2_VALLEY_LOWER_HEIGHT = A2_HEIGHT * 0.25;
    const A2_VALLEY_LOWER_WIDTH = A2_WIDTH * 0.4;
    const A2_VALLEY_LOWER_CP = 0.2;
    const A2_MOUNT_HIGHER_HEIGHT = A2_HEIGHT * 0.4;
    const A2_VALLEY_HIGHER_WIDTH = A2_WIDTH * 0.7;
    const A2_VALLEY_HIGHER_CP = 0.1;

    const A2_MOUNT_HIGHER_CP1_Y = 0.7 * A2_MOUNT_HIGHER_HEIGHT + (A2_MOUNT_LOWER_HEIGHT + A2_VALLEY_LOWER_HEIGHT);
    const A2_MOUNT_HIGHER_CP1_X = 0.2 * (A2_WIDTH - A2_VALLEY_LOWER_WIDTH) + A2_VALLEY_LOWER_WIDTH;

    shape.moveTo(0, 0);
    shape.bezierCurveTo(A2_WIDTH - A2_MOUNT_LOWER_CP, 0, A2_WIDTH, A2_MOUNT_LOWER_CP, A2_WIDTH, A2_MOUNT_LOWER_HEIGHT);
    shape.bezierCurveTo(
        A2_WIDTH,
        A2_MOUNT_LOWER_HEIGHT + A2_VALLEY_LOWER_CP,
        A2_VALLEY_LOWER_WIDTH,
        A2_MOUNT_LOWER_HEIGHT + A2_VALLEY_LOWER_HEIGHT - A2_VALLEY_LOWER_CP,
        A2_VALLEY_LOWER_WIDTH,
        A2_MOUNT_LOWER_HEIGHT + A2_VALLEY_LOWER_HEIGHT,
    );
    shape.bezierCurveTo(
        A2_MOUNT_HIGHER_CP1_X,
        A2_MOUNT_HIGHER_CP1_Y,
        A2_WIDTH,
        A2_MOUNT_HIGHER_CP1_Y,
        A2_WIDTH,
        A2_MOUNT_LOWER_HEIGHT + A2_VALLEY_LOWER_HEIGHT + A2_MOUNT_HIGHER_HEIGHT,
    );
    shape.bezierCurveTo(
        A2_MOUNT_HIGHER_CP1_X,
        A2_MOUNT_HIGHER_CP1_Y,
        A2_WIDTH,
        A2_MOUNT_HIGHER_CP1_Y,
        A2_WIDTH,
        A2_MOUNT_LOWER_HEIGHT + A2_VALLEY_LOWER_HEIGHT + A2_MOUNT_HIGHER_HEIGHT,
    );
    shape.bezierCurveTo(
        A2_WIDTH,
        A2_HEIGHT - A2_VALLEY_HIGHER_CP,
        A2_VALLEY_HIGHER_WIDTH,
        A2_HEIGHT - A2_VALLEY_HIGHER_CP,
        A2_VALLEY_HIGHER_WIDTH,
        A2_HEIGHT,
    );

    return shape;
};

const getA3Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const A3_HEIGHT = 1;
    const A3_WIDTH = 1;
    const A3_BASE_HEIGHT = A3_HEIGHT * 0.15;
    const A3_HANDLE_WIDTH = A3_WIDTH * 0.2;
    const A3_HANDLE_HEIGHT = A3_HEIGHT * 0.1;
    const A3_CUP_MOUNT_HEIGHT = A3_HEIGHT * 0.2;
    const A3_CUP_MOUNT_CP = 0.06;
    const A3_CUP_WIDTH = A3_WIDTH * 0.8;
    const A3_CUP_VALLEY_HEIGHT = A3_HEIGHT * 0.2;
    const A3_CUP_VALLEY_WIDTH = A3_WIDTH * 0.4;
    const A3_CUP_VALLEY_CP = 0.15;

    shape.moveTo(0, 0);
    shape.lineTo(A3_WIDTH, 0);
    shape.lineTo(A3_HANDLE_WIDTH, A3_BASE_HEIGHT);
    shape.lineTo(A3_HANDLE_WIDTH, A3_BASE_HEIGHT + A3_HANDLE_HEIGHT);
    shape.bezierCurveTo(
        A3_HANDLE_WIDTH,
        A3_BASE_HEIGHT + A3_HANDLE_HEIGHT + A3_CUP_MOUNT_CP,
        A3_CUP_WIDTH,
        A3_BASE_HEIGHT + A3_HANDLE_HEIGHT + A3_CUP_MOUNT_CP,
        A3_CUP_WIDTH,
        A3_BASE_HEIGHT + A3_HANDLE_HEIGHT + A3_CUP_MOUNT_HEIGHT,
    );
    shape.lineTo(A3_CUP_WIDTH, A3_HEIGHT - A3_CUP_VALLEY_HEIGHT);
    shape.bezierCurveTo(
        A3_CUP_WIDTH,
        A3_HEIGHT,
        A3_CUP_VALLEY_WIDTH + A3_CUP_VALLEY_CP,
        A3_HEIGHT - A3_CUP_VALLEY_HEIGHT,
        A3_CUP_VALLEY_WIDTH,
        A3_HEIGHT,
    );

    return shape;
};

const getA4Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const A4_HEIGHT = 1;
    const A4_WIDTH = 1;
    const A4_BASE_LOWER_WIDTH = A4_WIDTH * 0.4;
    const A4_BASE_UPPER_WIDTH = A4_WIDTH * 0.6;
    const A4_BASE_HEIGHT = A4_WIDTH * 0.25;
    const A4_BASE_CP_WIDTH = A4_WIDTH * 0.9;
    const A4_LOWER_POINTY_CP_WIDTH = A4_WIDTH * 0.3;
    const A4_LOWER_POINTY_HEIGHT = A4_WIDTH * 0.35;
    const A4_UPPER_POINTY_CP = (A4_HEIGHT - (A4_BASE_HEIGHT + A4_LOWER_POINTY_HEIGHT)) * 0.25;

    shape.moveTo(0, 0);
    shape.lineTo(A4_BASE_LOWER_WIDTH, 0);
    shape.bezierCurveTo(A4_BASE_CP_WIDTH, 0, A4_BASE_CP_WIDTH, A4_BASE_HEIGHT, A4_BASE_UPPER_WIDTH, A4_BASE_HEIGHT);
    shape.bezierCurveTo(
        A4_LOWER_POINTY_CP_WIDTH,
        A4_BASE_HEIGHT,
        A4_LOWER_POINTY_CP_WIDTH,
        A4_BASE_HEIGHT + A4_LOWER_POINTY_HEIGHT,
        A4_WIDTH,
        A4_BASE_HEIGHT + A4_LOWER_POINTY_HEIGHT,
    );
    shape.bezierCurveTo(
        0,
        A4_BASE_HEIGHT + A4_LOWER_POINTY_HEIGHT + A4_UPPER_POINTY_CP,
        A4_WIDTH,
        A4_HEIGHT - A4_UPPER_POINTY_CP,
        0,
        A4_HEIGHT,
    );

    return shape;
};

// Extrude Shapes

const getB1Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const B1_RADIUS = 1;
    const B1_ITERATIONS = 3;

    const center = new THREE.Vector2(0, 0);
    const rotAngle = (2 * Math.PI) / B1_ITERATIONS;

    let baseVector: THREE.Vector2 = new THREE.Vector2(0, B1_RADIUS);
    shape.moveTo(baseVector.x, baseVector.y);
    for (let i = 0; i < B1_ITERATIONS; i++) {
        baseVector = baseVector.rotateAround(center, rotAngle);
        shape.lineTo(baseVector.x, baseVector.y);
    }

    return shape;
};

const getB2Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const B2_OUTER_RADIUS = 1;
    const B2_INNER_RADIUS = B2_OUTER_RADIUS * 0.6;
    const B2_ITERATIONS = 7;

    const center = new THREE.Vector2(0, 0);
    const rotAngle = (2 * Math.PI) / B2_ITERATIONS;

    let baseVector: THREE.Vector2 = new THREE.Vector2(0, B2_OUTER_RADIUS);
    shape.moveTo(baseVector.x, baseVector.y);
    for (let i = 0; i < B2_ITERATIONS; i++) {
        const nextVector = baseVector.clone().rotateAround(center, rotAngle);
        const cpVector = baseVector
            .clone()
            .add(nextVector)
            .multiplyScalar(B2_INNER_RADIUS / 2);
        shape.bezierCurveTo(cpVector.x, cpVector.y, cpVector.x, cpVector.y, nextVector.x, nextVector.y);
        baseVector = nextVector;
    }

    return shape;
};

const getB3Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const B3_OUTER_RADIUS = 1;
    const B3_INNER_RADIUS = 0.4;
    const B3_CP_BEVEL = 0.2;
    const B3_ITERATIONS = 4;

    const center = new THREE.Vector2(0, 0);
    const rotAngle = (-2 * Math.PI) / B3_ITERATIONS;
    const basePointVectors = [
        new THREE.Vector2(B3_INNER_RADIUS / 2, B3_INNER_RADIUS),
        new THREE.Vector2(B3_INNER_RADIUS / 2, B3_OUTER_RADIUS),
        new THREE.Vector2(B3_OUTER_RADIUS - B3_CP_BEVEL, B3_OUTER_RADIUS),
        new THREE.Vector2(B3_OUTER_RADIUS, B3_OUTER_RADIUS - B3_CP_BEVEL),
        new THREE.Vector2(B3_OUTER_RADIUS, B3_INNER_RADIUS / 2),
        new THREE.Vector2(B3_INNER_RADIUS, B3_INNER_RADIUS / 2),
    ];

    // Initial position for R(+,+)
    shape.moveTo(-B3_INNER_RADIUS / 2, B3_INNER_RADIUS);

    let cpv = basePointVectors;
    for (let i = 0; i < B3_ITERATIONS; i++) {
        shape.lineTo(cpv[0].x, cpv[0].y);
        shape.lineTo(cpv[1].x, cpv[1].y);
        shape.bezierCurveTo(cpv[2].x, cpv[2].y, cpv[3].x, cpv[3].y, cpv[4].x, cpv[4].y);
        shape.lineTo(cpv[5].x, cpv[5].y);
        cpv = basePointVectors.map((p) => p.rotateAround(center, rotAngle));
    }

    return shape;
};

const getB4Shape = (): THREE.Shape => {
    const shape = new THREE.Shape();

    const B4_RADIUS_X = 0.4;
    const B4_RADIUS_Y = 1;
    const B4_CP_BEVEL = B4_RADIUS_X * 0.45;

    // initial position
    shape.moveTo(0, B4_RADIUS_Y);

    shape.bezierCurveTo(
        B4_RADIUS_X - B4_CP_BEVEL,
        B4_RADIUS_Y,
        B4_RADIUS_X,
        B4_RADIUS_Y - B4_CP_BEVEL,
        B4_RADIUS_X,
        B4_RADIUS_Y - B4_RADIUS_X,
    );
    shape.lineTo(B4_RADIUS_X, -(B4_RADIUS_Y - B4_RADIUS_X));
    shape.bezierCurveTo(
        B4_RADIUS_X,
        -(B4_RADIUS_Y - B4_CP_BEVEL),
        B4_RADIUS_X - B4_CP_BEVEL,
        -B4_RADIUS_Y,
        0,
        -B4_RADIUS_Y,
    );
    shape.bezierCurveTo(
        -(B4_RADIUS_X - B4_CP_BEVEL),
        -B4_RADIUS_Y,
        -B4_RADIUS_X,
        -(B4_RADIUS_Y - B4_CP_BEVEL),
        -B4_RADIUS_X,
        -(B4_RADIUS_Y - B4_RADIUS_X),
    );
    shape.lineTo(-B4_RADIUS_X, B4_RADIUS_Y - B4_RADIUS_X);
    shape.bezierCurveTo(
        -B4_RADIUS_X,
        B4_RADIUS_Y - B4_CP_BEVEL,
        -(B4_RADIUS_X - B4_CP_BEVEL),
        B4_RADIUS_Y,
        0,
        B4_RADIUS_Y,
    );

    return shape;
};
