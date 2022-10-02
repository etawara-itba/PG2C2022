import * as THREE from 'three';

export const deleteMesh = (mesh: THREE.Mesh): void => {
    if (mesh.geometry) mesh.geometry.dispose();
    deleteMaterial(mesh.material);
    mesh.removeFromParent();
};

export const deleteMaterial = (material?: THREE.Material | THREE.Material[]): void => {
    if (material) {
        if (material instanceof Array) {
            // for better memory management and performance
            material.forEach((m) => m.dispose());
        } else {
            // for better memory management and performance
            material.dispose();
        }
    }
};
