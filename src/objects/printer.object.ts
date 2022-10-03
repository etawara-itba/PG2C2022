import * as THREE from 'three';
import { PRINTABLE_SHAPES } from '../constants/printable.constants';
import { generatePrintableMesh } from '../helpers/printable.helper';
import Holder from './holder.object';
import { deleteMesh } from '../helpers/delete.helper';

class Printer extends THREE.Group {
    private readonly handMovementSpeed: number;
    private readonly printSlowdown: number;
    private readonly maxPrintedObjectHeight: number;
    private isPrinting = false;
    private _holder: Holder = new Holder();
    // printing hand related
    private printingHand: THREE.Object3D;
    private printingHandMaxHeight: number;
    private printingHandMovementDirection: 1 | -1 = 1;
    private clippingPlane: THREE.Plane;
    // printedObject related
    private printingMaterial: THREE.Material;
    private printedObjectMaterial: THREE.Material | undefined;
    private printedObjectHeight: number | undefined;
    private _printedObject: THREE.Mesh | undefined;

    public constructor(
        handMovementSpeed: number,
        printSlowdown: number,
        maxPrintedObjectHeight: number,
        printingMaterial?: THREE.Material,
        baseMaterial?: THREE.Material,
        rodMaterial?: THREE.Material,
        rodBoxMaterial?: THREE.Material,
        rodHandBarMaterial?: THREE.Material,
        handBoxMaterial?: THREE.Material,
        handMaterial?: THREE.Material,
    ) {
        super();
        this.handMovementSpeed = handMovementSpeed;
        this.printSlowdown = printSlowdown;
        this.maxPrintedObjectHeight = maxPrintedObjectHeight;

        // MESH RELATED

        // BASE
        const PRINTER_BASE_DEFAULT_RGB = '#FFDEDD';
        const PRINTER_BASE_POINTS = 16;
        const PRINTER_BASE_RADIUS = 20;
        const PRINTER_BASE_HEIGHT = 24;
        const PRINTER_HOLE_RADIUS = 16;
        const PRINTER_HOLE_HEIGHT = 20;
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
        if (!baseMaterial)
            baseMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_BASE_DEFAULT_RGB, flatShading: true });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        this.add(baseMesh);

        // HOLDER
        this._holder.position.set(0, PRINTER_HOLE_HEIGHT, 0);
        this.add(this._holder);

        // ELEVATOR: ROD + PRINTING HAND
        const PRINTER_ELEVATOR_DISPLACEMENT = (-1 * (PRINTER_BASE_RADIUS + PRINTER_HOLE_RADIUS)) / 2;
        const elevator = new THREE.Group();
        elevator.position.set(PRINTER_ELEVATOR_DISPLACEMENT, PRINTER_BASE_HEIGHT, 0);
        this.add(elevator);

        // ROD
        const PRINTER_ROD_DEFAULT_RGB = '#E2E9C8';
        const PRINTER_ROD_RADIUS = 1;
        const PRINTER_ROD_HEIGHT = this.maxPrintedObjectHeight + 20;
        const PRINTER_ROD_SEGMENTS = 12;
        const rodGeometry = new THREE.CylinderGeometry(
            PRINTER_ROD_RADIUS,
            PRINTER_ROD_RADIUS,
            PRINTER_ROD_HEIGHT,
            PRINTER_ROD_SEGMENTS,
        );
        if (!rodMaterial) rodMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_ROD_DEFAULT_RGB });
        const rod = new THREE.Mesh(rodGeometry, rodMaterial);
        rod.position.set(0, PRINTER_ROD_HEIGHT / 2, 0);
        elevator.add(rod);

        // PRINTING HAND: ROD_BOX + H_BARS + HAND_BOX + HAND
        const printingHand = new THREE.Group();
        this.printingHandMaxHeight = this.maxPrintedObjectHeight + 5;
        printingHand.position.set(0, this.printingHandMaxHeight, 0);
        elevator.add(printingHand);
        this.printingHand = printingHand;

        // HAND
        const PRINTER_HAND_DEFAULT_RGB = '#64E664';
        const PRINTER_HAND_LENGTH = 24;
        const PRINTER_HAND_HEIGHT = 1;
        const PRINTER_HAND_WIDTH = 18;
        const handGeometry = new THREE.BoxGeometry(PRINTER_HAND_LENGTH, PRINTER_HAND_HEIGHT, PRINTER_HAND_WIDTH);
        if (!handMaterial) handMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_HAND_DEFAULT_RGB });
        const hand = new THREE.Mesh(handGeometry, handMaterial);
        hand.position.set(-PRINTER_ELEVATOR_DISPLACEMENT, PRINTER_HAND_HEIGHT / 2, 0);
        printingHand.add(hand);

        // ROD BOX
        const PRINTER_ROD_BOX_DEFAULT_RGB = '#64E664';
        const PRINTER_ROD_BOX_LENGTH = 6;
        const PRINTER_ROD_BOX_HEIGHT = 6;
        const PRINTER_ROD_BOX_WIDTH = 8;
        const rodBoxGeometry = new THREE.BoxGeometry(
            PRINTER_ROD_BOX_LENGTH,
            PRINTER_ROD_BOX_HEIGHT,
            PRINTER_ROD_BOX_WIDTH,
        );
        if (!rodBoxMaterial) rodBoxMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_ROD_BOX_DEFAULT_RGB });
        const rodBox = new THREE.Mesh(rodBoxGeometry, rodBoxMaterial);
        rodBox.position.set(0, PRINTER_ROD_BOX_HEIGHT / 2, 0);
        printingHand.add(rodBox);

        // HAND BOX
        const PRINTER_HAND_BOX_DEFAULT_RGB = '#64E664';
        const PRINTER_HAND_BOX_LENGTH = PRINTER_ROD_BOX_LENGTH - 2 * PRINTER_HAND_HEIGHT;
        const PRINTER_HAND_BOX_HEIGHT = PRINTER_ROD_BOX_HEIGHT - 2 * PRINTER_HAND_HEIGHT;
        const PRINTER_HAND_BOX_WIDTH = PRINTER_ROD_BOX_HEIGHT + 2;
        const handBoxGeometry = new THREE.BoxGeometry(
            PRINTER_HAND_BOX_LENGTH,
            PRINTER_HAND_BOX_HEIGHT,
            PRINTER_HAND_BOX_WIDTH,
        );
        if (!handBoxMaterial) handBoxMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_HAND_BOX_DEFAULT_RGB });
        const handBox = new THREE.Mesh(handBoxGeometry, handBoxMaterial);
        handBox.position.set(-PRINTER_ELEVATOR_DISPLACEMENT, PRINTER_ROD_BOX_HEIGHT / 2, 0);
        printingHand.add(handBox);

        // ROD_HAND_BARS
        const PRINTER_ROD_HAND_BAR_DEFAULT_RGB = '#3C8CC8';
        const PRINTER_ROD_HAND_BAR_LENGTH = PRINTER_ELEVATOR_DISPLACEMENT;
        const PRINTER_ROD_HAND_BAR_HEIGHT = 3;
        const PRINTER_ROD_HAND_BAR_WIDTH = 1.5;
        const PRINTER_ROD_HAND_BAR_GAP = 4;
        const rodHandBarGeometry = new THREE.BoxGeometry(
            PRINTER_ROD_HAND_BAR_LENGTH,
            PRINTER_ROD_HAND_BAR_HEIGHT,
            PRINTER_ROD_HAND_BAR_WIDTH,
        );
        if (!rodHandBarMaterial)
            rodHandBarMaterial = new THREE.MeshLambertMaterial({ color: PRINTER_ROD_HAND_BAR_DEFAULT_RGB });
        const rodHandBarL = new THREE.Mesh(rodHandBarGeometry, rodHandBarMaterial);
        rodHandBarL.position.set(
            -PRINTER_ELEVATOR_DISPLACEMENT / 2,
            PRINTER_ROD_BOX_HEIGHT / 2,
            -PRINTER_ROD_HAND_BAR_GAP / 2,
        );
        printingHand.add(rodHandBarL);
        const rodHandBarR = new THREE.Mesh(rodHandBarGeometry.clone(), rodHandBarMaterial);
        rodHandBarR.position.set(
            -PRINTER_ELEVATOR_DISPLACEMENT / 2,
            PRINTER_ROD_BOX_HEIGHT / 2,
            PRINTER_ROD_HAND_BAR_GAP / 2,
        );
        printingHand.add(rodHandBarR);

        // CLIPPING PLANE: CANNOT BE PUT INSIDE PRINTING HAND
        const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0));
        clippingPlane.constant = 20;
        this.clippingPlane = clippingPlane;

        // PRINTING MATERIAL
        if (!printingMaterial)
            printingMaterial = new THREE.MeshLambertMaterial({ color: 0x633b63, side: THREE.DoubleSide });
        printingMaterial.clippingPlanes = [clippingPlane];
        // printingMaterial.needsUpdate = true;
        this.printingMaterial = printingMaterial;
    }

    print(shape: PRINTABLE_SHAPES, height: number, twistAngle: number, material: THREE.Material): void {
        height = Math.min(height, this.maxPrintedObjectHeight);
        const printedObject: THREE.Mesh = generatePrintableMesh(shape, twistAngle, height, this.printingMaterial);
        printedObject.visible = false;
        this._printedObject = printedObject;
        this.printedObjectMaterial = material;
        this.printedObjectHeight = height;

        // manage object on holder
        this._holder.setLock(false);
        try {
            const previousObject = this._holder.give() as THREE.Mesh;
            deleteMesh(previousObject);
        } catch (_) {
            // no need to print catch error
        }
        this._holder.receive(printedObject);
        this._holder.setLock(true);

        // setting speed to start printing
        this.printingHandMovementDirection = -1;
    }

    animate(delta: number): void {
        // move hand
        const printingHandNewHeight =
            this.printingHand.position.y +
            this.printingHandMovementDirection *
                delta *
                this.handMovementSpeed *
                (this.isPrinting ? this.printSlowdown : 1);
        // start printing condition
        if (printingHandNewHeight < 0) {
            this._startPrinting();
            this.printingHandMovementDirection = 1;
        }
        // finish printing condition
        if (
            this.isPrinting &&
            this.printingHandMovementDirection > 0 &&
            this.printedObjectHeight &&
            printingHandNewHeight > this.printedObjectHeight
        ) {
            this._finishedPrinting();
        }
        // clamp to avoid inconsistencies around ends
        this.printingHand.position.y = Math.min(Math.max(printingHandNewHeight, 0), this.printingHandMaxHeight);

        // update clipping plane to match height with printing hand
        this.clippingPlane.constant = this.printingHand.getWorldPosition(new THREE.Vector3()).y;
    }

    // getter / setter logic

    get printedObject(): THREE.Mesh | undefined {
        return this._printedObject;
    }

    get holder(): Holder {
        return this._holder;
    }

    // private functions

    _startPrinting() {
        this.isPrinting = true;
        if (!this.printedObject) return;
        this.printedObject.visible = true;
    }

    _finishedPrinting() {
        this.isPrinting = false;
        if (!this.printedObject) return;
        this.printedObject.material = this.printedObjectMaterial ?? this.printedObject.material;
        this._holder.setLock(false);
    }
}
export default Printer;
