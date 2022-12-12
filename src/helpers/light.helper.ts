import * as THREE from 'three';

export const getPointLightObject = (radius = 1, intensity = 1, distance = 50): THREE.PointLight => {
    const lightObject = new THREE.PointLight('#FFFFFF', intensity, distance);
    const sphere = new THREE.SphereGeometry(radius, 16, 8);
    lightObject.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: '#FFFFFF' })));
    return lightObject;
};

export const getSpotLightObject = (
    radius = 5,
    height = 1,
    intensity = 1,
    distance = 600,
    angle = Math.PI / 4,
): THREE.SpotLight => {
    const lightObject = new THREE.SpotLight('#FFFFFF', intensity, distance, angle, 1);
    const sphere = new THREE.SphereGeometry(1, 16, 8);
    sphere.scale(radius, height, radius);
    lightObject.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: '#FFFFFF' })));
    const target = new THREE.Object3D();
    lightObject.add(target);
    target.position.set(0, -10, 0);
    lightObject.target = target;
    return lightObject;
};
