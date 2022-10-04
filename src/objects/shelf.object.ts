import * as THREE from 'three';
import * as SHELF from '../constants/shelf.constants';
import Holder from './holder.object';

class Shelf extends THREE.Group {
    private holders: Holder[] = [];

    constructor(
        rows: number,
        columns: number,
        spaceLength: number,
        spaceWidth: number,
        spaceHeight: number,
        rodMaterial?: THREE.Material,
        baseMaterial?: THREE.Material,
    ) {
        super();

        // generating bases
        const baseLength = spaceLength * columns + 2 * SHELF.BASE_LENGTH_PADDING;
        const baseWidth = spaceWidth + 2 * SHELF.BASE_WIDTH_PADDING;
        for (let i = 0; i <= rows; i++) {
            const base = this._createBase(baseLength, baseWidth, SHELF.BASE_HEIGHT, baseMaterial);
            base.position.y = SHELF.BOTTOM_PADDING + SHELF.BASE_HEIGHT / 2 + i * spaceHeight;
            this.add(base);
        }

        // generating rods
        const rodHeight = SHELF.BOTTOM_PADDING + rows * spaceHeight + SHELF.BASE_HEIGHT + SHELF.ROD_PADDING;
        const firstRodX = (-1 / 2) * spaceLength * columns;
        for (let i = 0; i <= columns; i++) {
            const rodL = this._createRod(SHELF.ROD_LENGTH, rodHeight, rodMaterial);
            rodL.position.set(firstRodX + i * spaceLength, rodHeight / 2, -spaceWidth / 2);
            this.add(rodL);

            const rodR = this._createRod(SHELF.ROD_LENGTH, rodHeight, rodMaterial);
            rodR.position.set(firstRodX + i * spaceLength, rodHeight / 2, spaceWidth / 2);
            this.add(rodR);
        }

        // generating holders
        const firstHolderX = (-1 / 2) * spaceLength * columns + spaceLength / 2;
        const firstHolderY = SHELF.BOTTOM_PADDING + SHELF.BASE_HEIGHT;
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                const holder = new Holder();
                holder.position.set(firstHolderX + i * spaceLength, firstHolderY + j * spaceHeight, 0);
                this.holders.push(holder);
                this.add(holder);
            }
        }
    }

    getHolders(): Holder[] {
        return this.holders;
    }

    // private helpers

    _createRod(rodLength: number, rodHeight: number, material?: THREE.Material): THREE.Object3D {
        if (!material) material = new THREE.MeshLambertMaterial({ color: '#D5E272' });
        const rodGeometry = new THREE.BoxGeometry(rodLength, rodHeight, rodLength);
        return new THREE.Mesh(rodGeometry, material);
    }

    _createBase(baseLength: number, baseWidth: number, baseHeight: number, material?: THREE.Material): THREE.Object3D {
        if (!material) material = new THREE.MeshLambertMaterial({ color: '#A0FFFF' });
        const baseGeometry = new THREE.BoxGeometry(baseLength, baseHeight, baseWidth);
        return new THREE.Mesh(baseGeometry, material);
    }
}

export default Shelf;
