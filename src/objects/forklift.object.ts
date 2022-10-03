import * as THREE from 'three';
import * as FORKLIFT from '../constants/forklift.constants';
import Grabber from './grabber.object';
import Holder from './holder.object';

class Forklift extends THREE.Group {
    private cabin: THREE.Group;
    private wheels: THREE.Object3D[] = [];
    private lift: THREE.Group;
    private movementSpeed: number;
    private rotationSpeed: number;
    private liftSpeed: number;
    private liftUpLimit: number;
    private liftDownLimit: number;
    private grabber: Grabber;
    private frontCamera: THREE.Camera;
    private backCamera: THREE.Camera;
    private sideCamera: THREE.Camera;

    // Reference to the moving panel of the lift to then move up and down
    private movingPanel: THREE.Object3D | undefined = undefined;

    constructor(
        movementSpeed: number,
        rotationSpeed: number,
        liftSpeed: number,
        interactionMaxDistance: number,
        cameraFov?: number,
        cameraAspect?: number,
        cameraNear?: number,
        cameraFar?: number,
        wheelsMaterial?: THREE.Material,
        cabinBodyMaterial?: THREE.Material,
        cabinChairMaterial?: THREE.Material,
        cabinPanelMaterial?: THREE.Material,
        liftVerticalRodMaterial?: THREE.Material,
        liftHorizontalRodMaterial?: THREE.Material,
        liftPanelMaterial?: THREE.Material,
    ) {
        super();
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed;
        this.liftSpeed = liftSpeed;
        this.grabber = new Grabber(interactionMaxDistance);

        // Create cabin
        this.cabin = this.createCabin(
            FORKLIFT.CABIN_LENGTH,
            FORKLIFT.CABIN_HEIGHT,
            FORKLIFT.CABIN_WIDTH,
            cabinBodyMaterial,
            cabinChairMaterial,
            cabinPanelMaterial,
        );

        // We place the cabin higher up, so it's not touching the floor. This depends on wheel radius
        this.cabin.position.set(0, FORKLIFT.WHEEL_RADIUS / 2, 0);

        // Create wheels
        for (let i = 0; i < 4; i++) {
            this.wheels.push(this.createWheel(FORKLIFT.WHEEL_RADIUS, FORKLIFT.WHEEL_WIDTH, wheelsMaterial));
        }

        // Positions wheels relative to the group (assert right wheels to have i%2=0)
        // Front right wheel
        this.wheels[0].position.set(FORKLIFT.CABIN_LENGTH * 0.75, this.wheels[0].position.y, FORKLIFT.CABIN_WIDTH);
        // Front left wheel
        this.wheels[1].position.set(FORKLIFT.CABIN_LENGTH * 0.75, this.wheels[1].position.y, 0);
        // Back right wheel
        this.wheels[2].position.set(FORKLIFT.CABIN_LENGTH * 0.25, this.wheels[2].position.y, FORKLIFT.CABIN_WIDTH);
        // Back left wheel
        this.wheels[3].position.set(FORKLIFT.CABIN_LENGTH * 0.25, this.wheels[3].position.y, 0);

        // Create lift
        const liftHeight = FORKLIFT.CABIN_HEIGHT * 4.5;
        this.lift = this.createLift(
            FORKLIFT.CABIN_LENGTH * 0.5,
            liftHeight,
            FORKLIFT.CABIN_WIDTH,
            liftVerticalRodMaterial,
            liftHorizontalRodMaterial,
            liftPanelMaterial,
        );

        // Position lift relative to cabin
        this.lift.position.set(FORKLIFT.CABIN_LENGTH, FORKLIFT.WHEEL_RADIUS / 2, FORKLIFT.CABIN_WIDTH / 2);

        // Add to group
        this.add(this.cabin);
        this.wheels.forEach((wheel) => this.add(wheel));
        this.add(this.lift);

        // Move members of the group, so they are centered around cabin center
        this.children.forEach((child) =>
            child.position.set(
                child.position.x - FORKLIFT.CABIN_LENGTH / 2,
                child.position.y,
                child.position.z - FORKLIFT.CABIN_WIDTH / 2,
            ),
        );

        // Calculate lift up limit and lift down limit
        this.liftUpLimit = (liftHeight + FORKLIFT.WHEEL_RADIUS / 2) * 0.9;
        this.liftDownLimit = (liftHeight + FORKLIFT.WHEEL_RADIUS / 2) * 0.2;

        // Add cameras
        const driverPosition = new THREE.Vector3(
            FORKLIFT.CAMERA_FRONT_X,
            FORKLIFT.CAMERA_FRONT_Y,
            FORKLIFT.CAMERA_FRONT_Z,
        );
        const frontCamera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);
        frontCamera.position.set(FORKLIFT.CAMERA_FRONT_X, FORKLIFT.CAMERA_FRONT_Y, FORKLIFT.CAMERA_FRONT_Z);
        frontCamera.lookAt(FORKLIFT.CAMERA_FRONT_X + 100, FORKLIFT.CAMERA_FRONT_Y, FORKLIFT.CAMERA_FRONT_Z);
        this.frontCamera = frontCamera;
        this.add(frontCamera);
        const backCamera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);
        backCamera.position.set(FORKLIFT.CAMERA_BACK_X, FORKLIFT.CAMERA_BACK_Y, FORKLIFT.CAMERA_BACK_Z);
        backCamera.lookAt(driverPosition.x, driverPosition.y, driverPosition.z);
        this.backCamera = backCamera;
        this.add(backCamera);
        const sideCamera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);
        sideCamera.position.set(FORKLIFT.CAMERA_SIDE_X, FORKLIFT.CAMERA_SIDE_Y, FORKLIFT.CAMERA_SIDE_Z);
        sideCamera.lookAt(driverPosition.x, FORKLIFT.CAMERA_SIDE_Y, driverPosition.z);
        this.sideCamera = sideCamera;
        this.add(sideCamera);
    }

    // movement related

    rotateLeft(delta: number): void {
        this.rotateY(delta * this.rotationSpeed);
        // update wheels
        const rotAngle = (delta * this.rotationSpeed * (FORKLIFT.CABIN_WIDTH / 2)) / FORKLIFT.WHEEL_RADIUS;
        for (let i = 0; i < 4; i++) {
            // left wheels backwards(1), right wheels forward(-1). right wheels have i%2=0
            const direction = i % 2 === 0 ? -1 : 1;
            this.wheels[i].rotateY(direction * rotAngle);
        }
    }

    rotateRight(delta: number): void {
        this.rotateLeft(-delta);
    }

    moveForward(delta: number): void {
        this.translateX(delta * this.movementSpeed);
        // update wheels
        const scaleFactor = Math.sqrt((Math.pow(this.scale.x, 2) + Math.pow(this.scale.z, 2)) / 2);
        const rotAngle = (delta * this.movementSpeed) / (FORKLIFT.WHEEL_RADIUS * scaleFactor);
        for (let i = 0; i < 4; i++) {
            this.wheels[i].rotateY(-1 * rotAngle);
        }
    }

    moveBackwards(delta: number): void {
        this.moveForward(-delta);
    }

    liftUp(delta: number): void {
        if (delta < 0) return this.liftDown(-delta);
        if (this.movingPanel && delta > 0 && this.movingPanel.position.y < this.liftUpLimit) {
            this.movingPanel.translateY(delta * this.liftSpeed);
            this.movingPanel.position.y = Math.min(
                Math.max(this.movingPanel.position.y, this.liftDownLimit),
                this.liftUpLimit,
            );
        }
    }

    liftDown(delta: number): void {
        if (delta < 0) return this.liftUp(-delta);
        if (this.movingPanel && delta > 0 && this.movingPanel.position.y > this.liftDownLimit) {
            this.movingPanel.translateY(-delta * this.liftSpeed);
            this.movingPanel.position.y = Math.min(
                Math.max(this.movingPanel.position.y, this.liftDownLimit),
                this.liftUpLimit,
            );
        }
    }

    interactGrabber(holders: Holder[]): void {
        this.grabber.interactClosest(holders);
    }

    // getters

    getGrabber(): Grabber {
        return this.grabber;
    }

    getFrontCamera(): THREE.Camera {
        return this.frontCamera;
    }

    getBackCamera(): THREE.Camera {
        return this.backCamera;
    }

    getSideCamera(): THREE.Camera {
        return this.sideCamera;
    }

    // mesh related

    /**
     * Creates forklift body as extrusion geometry
     * @param length            (from front to back)
     * @param height            (from bottom to top)
     * @param width             (from side to side)
     * @param bodyMaterial
     * @param chairMaterial
     * @param panelMaterial
     */
    createCabin(
        length: number,
        height: number,
        width: number,
        bodyMaterial?: THREE.Material,
        chairMaterial?: THREE.Material,
        panelMaterial?: THREE.Material,
    ): THREE.Group {
        // Body object
        const body = this._createCabinBody(length, height, width, bodyMaterial);

        // Chair object
        const chairLength = length * 0.1; // Length of chair is 10% of cabin's length
        const chairHeight = height; // Height of chair is 100% of cabin's height
        const chairWidth = width * 0.8; // Width of chair is 80% of cabin's width
        const chair = this._createCabinChair(chairLength, chairHeight, chairWidth, chairMaterial);

        // We position the chair relative to the body
        chair.position.set(length * 0.3, height, (width - chairWidth) / 2);

        // Panel object
        const panelLength = length * 0.1;
        const panelHeight = height * 0.3;
        const panelWidth = width * 0.8;
        const panel = this._createCabinPanel(panelLength, panelHeight, panelWidth, panelMaterial);

        // We position the panel relative to the body
        panel.position.set(length * 0.8, height, (width - panelWidth) / 2);

        // Create group
        const cabin = new THREE.Group();
        cabin.add(body);
        cabin.add(chair);
        cabin.add(panel);
        return cabin;
    }

    /**
     * Creates wheel as a cylinders
     * @param radius        Radius of the wheel
     * @param width         Width of the wheel
     * @param material
     */
    createWheel(radius: number, width: number, material?: THREE.Material): THREE.Object3D {
        const wheelShape = new THREE.Shape();
        wheelShape.moveTo(0, -FORKLIFT.WHEEL_HOLE_WIDTH / 2);
        wheelShape.lineTo(FORKLIFT.WHEEL_HOLE_RADIUS, -FORKLIFT.WHEEL_HOLE_WIDTH / 2);
        wheelShape.lineTo(FORKLIFT.WHEEL_TIRE_RADIUS, -FORKLIFT.WHEEL_WIDTH / 2);
        wheelShape.lineTo(FORKLIFT.WHEEL_RADIUS, -FORKLIFT.WHEEL_WIDTH / 2);
        wheelShape.lineTo(FORKLIFT.WHEEL_RADIUS, FORKLIFT.WHEEL_WIDTH / 2);
        wheelShape.lineTo(FORKLIFT.WHEEL_TIRE_RADIUS, FORKLIFT.WHEEL_WIDTH / 2);
        wheelShape.lineTo(FORKLIFT.WHEEL_HOLE_RADIUS, FORKLIFT.WHEEL_HOLE_WIDTH / 2);
        wheelShape.lineTo(0, FORKLIFT.WHEEL_HOLE_WIDTH / 2);

        const points = wheelShape.getPoints(24);
        const geometry = new THREE.LatheGeometry(points);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0x67567c, flatShading: true });
        const wheel = new THREE.Mesh(geometry, material);
        wheel.rotateX(Math.PI / 2); // Cylinders are made upright, but wheels should be to the side, so we rotate them
        wheel.position.set(0, radius - 0.2, 0); // We set them at origin with bottom of the wheel touching the ground (0.2 so its kind of sinking a bit)
        return wheel;
    }

    /**
     * Creates the lift thingy that goes up and down
     * @param lengthOfPanel
     * @param height
     * @param widthOfPanel
     * @param verticalRodsMaterial
     * @param horizontalRodsMaterial
     * @param panelMaterial
     */
    createLift(
        lengthOfPanel: number,
        height: number,
        widthOfPanel: number,
        verticalRodsMaterial?: THREE.Material,
        horizontalRodsMaterial?: THREE.Material,
        panelMaterial?: THREE.Material,
    ): THREE.Group {
        // We create 2 vertical rods
        const vRods = this._createVerticalRods(height, widthOfPanel * 0.6, verticalRodsMaterial);

        // We create 3 horizontal rods
        const hRods = this._createHorizontalRods(widthOfPanel * 0.8, height * 0.43, horizontalRodsMaterial);

        // We create the panel
        const panel = this._createLiftPanel(lengthOfPanel, height * 0.5, widthOfPanel, panelMaterial);
        this.movingPanel = panel;

        // Create group
        const lift = new THREE.Group();
        vRods.forEach((rod) => lift.add(rod));
        hRods.forEach((rod) => lift.add(rod));
        lift.add(panel);
        return lift;
    }

    // Helper functions

    _createCabinBody(length = 30, height = 10, width = 15, material?: THREE.Material): THREE.Mesh {
        // We define some points of interest based on parameters
        const tipY = height / 3;
        const tipX = length * 0.1; // 10% of length on front and back

        // Now we define the shape
        const shape = new THREE.Shape();
        shape.moveTo(0, tipY);
        shape.lineTo(0, height - tipY);
        shape.lineTo(tipX, height);
        shape.lineTo(length - tipX, height);
        shape.lineTo(length, height - tipY);
        shape.lineTo(length, tipY);
        shape.lineTo(length - tipX, 0);
        shape.lineTo(tipX, 0);
        shape.lineTo(0, tipY);

        // Extrude settings
        const extrudeSettings = {
            steps: 1,
            depth: width,
            bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0xf3fd12 });

        return new THREE.Mesh(geometry, material);
    }

    _createCabinChair(
        chairLength: number,
        chairHeight: number,
        chairWidth: number,
        material?: THREE.Material,
    ): THREE.Object3D {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(-chairLength, 0);
        shape.lineTo(-(chairLength + 2), chairHeight);
        shape.lineTo(-chairLength, chairHeight);
        shape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: chairWidth,
            bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0xea6a1c });
        return new THREE.Mesh(geometry, material);
    }

    _createCabinPanel(
        panelLength: number,
        panelHeight: number,
        panelWidth: number,
        material?: THREE.Material,
    ): THREE.Object3D {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, panelHeight);
        shape.lineTo(-panelLength, panelHeight);
        shape.lineTo(-(panelLength + 1), 0);
        shape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: panelWidth,
            bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0x920d0d });
        return new THREE.Mesh(geometry, material);
    }

    _createVerticalRods(height: number, separation: number, material?: THREE.Material): THREE.Object3D[] {
        const geometry = new THREE.BoxGeometry(1, height, 1.5);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0xdacaca });
        const leftRod = new THREE.Mesh(geometry, material);
        const rightRod = new THREE.Mesh(geometry, material);
        leftRod.position.set(0.5, height / 2, -(separation / 2));
        rightRod.position.set(0.5, height / 2, separation / 2);
        return [leftRod, rightRod];
    }

    _createHorizontalRods(width: number, separation: number, material?: THREE.Material): THREE.Object3D[] {
        const geometry = new THREE.BoxGeometry(1, 1.5, width);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0x983d3d });
        const bottomRod = new THREE.Mesh(geometry, material);
        const middleRod = new THREE.Mesh(geometry, material);
        const topRod = new THREE.Mesh(geometry, material);
        bottomRod.position.set(0, separation * 0.25, 0);
        middleRod.position.set(bottomRod.position.x, bottomRod.position.y + separation, bottomRod.position.z);
        topRod.position.set(middleRod.position.x, middleRod.position.y + separation, middleRod.position.z);
        return [bottomRod, middleRod, topRod];
    }

    _createLiftPanel(length: number, initialHeight: number, width: number, material?: THREE.Material): THREE.Object3D {
        const panelGroup = new THREE.Group();
        const panelHeight = 0.5;

        const geometry = new THREE.BoxGeometry(length, panelHeight, width);
        if (!material) material = new THREE.MeshLambertMaterial({ color: 0xd19123 });
        const panel = new THREE.Mesh(geometry, material);

        this.grabber.position.set(0, panelHeight / 2, 0);

        panelGroup.add(panel);
        panelGroup.add(this.grabber);

        panelGroup.position.set(length / 2 + 0.5, initialHeight, panel.position.z);
        return panelGroup;
    }
}

export default Forklift;
