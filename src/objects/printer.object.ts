import * as THREE from 'three';
import { PRINTABLE_SHAPES } from '../constants/printable.constants';
import { generatePrintableMesh } from '../helpers/printable.helper';
import Holder from './holder.object';

class Printer extends THREE.Group {
    private readonly printSpeed: number;
    private readonly maxHandHeight: number;
    private _printedObject: THREE.Mesh | undefined;
    private printedObjectHeight: number | undefined;
    private _isPrinting = false;
    private printedHeight = 0;
    private holder: Holder = new Holder();

    public constructor(printSpeed: number, maxHandHeight: number) {
        super();
        this.printSpeed = printSpeed;
        this.maxHandHeight = maxHandHeight;

        this._initMesh();
    }

    print(shape: PRINTABLE_SHAPES, height: number, twistAngle: number, material: THREE.Material): void {
        this._isPrinting = true;
        this.printedHeight = 0;
        const printedObject: THREE.Mesh = generatePrintableMesh(shape, twistAngle, height, material);
        this._printedObject = printedObject;
        this.printedObjectHeight = height;

        // manage object on holder
        this.holder.setLock(false);
        try {
            const previousObject = this.holder.give() as THREE.Object3D & {
                geometry?: THREE.BufferGeometry;
                material?: THREE.Material | THREE.Material[];
            };
            // disposal script
            if (previousObject.geometry) previousObject.geometry.dispose();
            if (previousObject.material) {
                if (previousObject.material instanceof Array) {
                    // for better memory management and performance
                    previousObject.material.forEach((material) => material.dispose());
                } else {
                    // for better memory management and performance
                    previousObject.material.dispose();
                }
            }
            previousObject.removeFromParent();
        } catch (_) {
            // no need to print catch error
        }
        this.holder.receive(printedObject);
        this.holder.setLock(true);
    }

    animate(delta: number): void {
        if (this._isPrinting) {
            // animate print
            this.printedHeight += delta * this.printSpeed;
        }
    }

    // getter / setter logic

    get printedObject(): THREE.Mesh | undefined {
        return this._printedObject;
    }

    set printedObject(value: THREE.Mesh | undefined) {
        this._printedObject = value;
    }

    get isPrinting(): boolean {
        return this._isPrinting;
    }

    set isPrinting(value: boolean) {
        this._isPrinting = value;
    }

    _initMesh() {
        // BASE
        const PRINTER_BASE_RGB = '#FFDEDD';
        const PRINTER_BASE_POINTS = 16;
        const PRINTER_BASE_RADIUS = 20;
        const PRINTER_BASE_HEIGHT = 20;
        const PRINTER_HOLE_RADIUS = 16;
        const PRINTER_HOLE_HEIGHT = 18;
        const PRINTER_HOLE_BEVEL = 1;

        const baseShape = new THREE.Shape();
        baseShape.moveTo(0, 0);
        baseShape.lineTo(PRINTER_BASE_RADIUS, 0);
        baseShape.lineTo(PRINTER_BASE_RADIUS, PRINTER_BASE_HEIGHT - PRINTER_HOLE_BEVEL);
        baseShape.lineTo(PRINTER_BASE_RADIUS - PRINTER_HOLE_BEVEL, PRINTER_BASE_HEIGHT);
        baseShape.lineTo(PRINTER_HOLE_RADIUS + PRINTER_HOLE_BEVEL, PRINTER_BASE_HEIGHT);
        baseShape.lineTo(PRINTER_HOLE_RADIUS, PRINTER_BASE_HEIGHT - PRINTER_HOLE_BEVEL);
        baseShape.lineTo(PRINTER_HOLE_RADIUS, PRINTER_HOLE_HEIGHT);
        baseShape.lineTo(0, PRINTER_HOLE_HEIGHT);
        const points = baseShape.getPoints(PRINTER_BASE_POINTS);
        const baseGeometry = new THREE.LatheGeometry(points);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_BASE_RGB, flatShading: true });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        this.add(baseMesh);

        // HOLDER
        this.holder.position.set(0, PRINTER_HOLE_HEIGHT, 0);
        this.add(this.holder);
    }
}
export default Printer;
