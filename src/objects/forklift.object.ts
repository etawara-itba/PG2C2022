import * as THREE from "three";


class Forklift extends THREE.Group {
    private cabin: THREE.Group;
    private wheels: THREE.Mesh[] = [];
    private lift: THREE.Group;
    private movementSpeed: number;
    private rotationSpeed: number;
    private liftSpeed: number;
    private liftUpLimit: number;
    private liftDownLimit: number;

    // Reference to the moving panel of the lift to then move up and down
    private movingPanel: THREE.Object3D | undefined = undefined;
    // Reference to the object that the forklift is carrying
    private carryingObject: THREE.Object3D | undefined = undefined;

    constructor(
        movementSpeed: number,
        rotationSpeed: number,
        liftSpeed: number,
        cabinLength: number,
        cabinHeight: number,
        cabinWidth: number,
        wheelRadius: number,
        wheelWidth: number,
        wheelsMaterial?: THREE.Material,
        cabinBodyMaterial?: THREE.Material,
        cabinChairMaterial?: THREE.Material,
        cabinPanelMaterial?: THREE.Material,
        liftVerticalRodMaterial?: THREE.Material,
        liftHorizontalRodMaterial?: THREE.Material,
        liftPanelMaterial?: THREE.Material
    ) {
        super();
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed;
        this.liftSpeed = liftSpeed;

        // Create cabin
        this.cabin = this.createCabin(cabinLength, cabinHeight, cabinWidth, cabinBodyMaterial, cabinChairMaterial, cabinPanelMaterial);

        // We place the cabin higher up, so it's not touching the floor. This depends on wheel radius
        this.cabin.position.set(0, wheelRadius/ 2,0);

        // Create wheels
        for (let i = 0; i < 4; i++) {
            this.wheels.push(this.createWheel(wheelRadius, wheelWidth, wheelsMaterial));
        }

        // Positions wheels relative to the group
        // Front right wheel
        this.wheels[0].position.set(cabinLength * 0.75, this.wheels[0].position.y, cabinWidth);
        // Front left wheel
        this.wheels[1].position.set(cabinLength * 0.75, this.wheels[1].position.y, 0);
        // Back right wheel
        this.wheels[2].position.set(cabinLength * 0.25, this.wheels[2].position.y, cabinWidth);
        // Back left wheel
        this.wheels[3].position.set(cabinLength * 0.25, this.wheels[3].position.y, 0);

        // Create lift
        const liftHeight = cabinHeight * 4.5;
        this.lift = this.createLift(cabinLength * 0.5, liftHeight, cabinWidth, liftVerticalRodMaterial, liftHorizontalRodMaterial, liftPanelMaterial);

        // Position lift relative to cabin
        this.lift.position.set(cabinLength, wheelRadius / 2, cabinWidth / 2);

        // Add to group
        this.add(this.cabin);
        this.wheels.forEach(wheel => this.add(wheel));
        this.add(this.lift);

        // Move members of the group, so they are centered around cabin center
        this.children.forEach(child => child.position.set(child.position.x - (cabinLength / 2), child.position.y, child.position.z - (cabinWidth / 2)));

        // Calculate lift up limit and lift down limit
        this.liftUpLimit = (liftHeight + (wheelRadius / 2)) * 0.9;
        this.liftDownLimit = (liftHeight + (wheelRadius / 2)) * 0.2;
    }

    /**
     * Creates forklift body as extrusion geometry
     * @param length            (from front to back)
     * @param height            (from bottom to top)
     * @param width             (from side to side)
     * @param bodyMaterial
     * @param chairMaterial
     * @param panelMaterial
     */
    createCabin(length: number, height: number, width: number, bodyMaterial?: THREE.Material, chairMaterial?: THREE.Material, panelMaterial?: THREE.Material): THREE.Group {
        // Body object
        const body = this._createCabinBody(length, height, width, bodyMaterial);

        // Chair object
        const chairLength = length * 0.10;  // Length of chair is 10% of cabin's length
        const chairHeight = height;         // Height of chair is 100% of cabin's height
        const chairWidth = width * 0.8;     // Width of chair is 80% of cabin's width
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
    createWheel(radius: number, width: number, material?: THREE.Material): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(radius, radius, width, 16);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0x333333});
        const wheel = new THREE.Mesh(geometry, material);
        wheel.rotateX(Math.PI / 2);         // Cylinders are made upright, but wheels should be to the side, so we rotate them
        wheel.position.set(0, radius - 0.2, 0);  // We set them at origin with bottom of the wheel touching the ground (0.2 so its kind of sinking a bit)
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
    createLift(lengthOfPanel: number, height: number, widthOfPanel: number, verticalRodsMaterial?: THREE.Material, horizontalRodsMaterial?: THREE.Material, panelMaterial?: THREE.Material): THREE.Group {
        // We create 2 vertical rods
        const vRods = this._createVerticalRods(height, widthOfPanel * 0.6, verticalRodsMaterial);

        // We create 3 horizontal rods
        const hRods = this._createHorizontalRods(widthOfPanel * 0.8, height * 0.43, horizontalRodsMaterial);

        // We create the panel
        const panel = this._createLiftPanel(lengthOfPanel, height * 0.5, widthOfPanel, panelMaterial);
        this.movingPanel = panel;

        // Create group
        const lift = new THREE.Group();
        vRods.forEach(rod => lift.add(rod));
        hRods.forEach(rod => lift.add(rod));
        lift.add(panel);
        return lift;
    }


    rotateLeft(delta: number): void {
        this.rotateY(delta * this.rotationSpeed);
    }

    rotateRight(delta: number): void {
        this.rotateLeft(-delta);
    }

    moveForward(delta: number): void {
        this.translateX(delta * this.movementSpeed);
    }

    moveBackwards(delta: number): void {
        this.moveForward(-delta);
    }

    liftUp(delta: number): void {
        if (delta < 0)
            return this.liftDown(-delta);
        if (this.movingPanel && delta > 0 && this.movingPanel.position.y < this.liftUpLimit)
            this.movingPanel.translateY(delta * this.liftSpeed);
    }

    liftDown(delta: number): void {
        if (delta < 0)
            return this.liftUp(-delta);
        if (this.movingPanel && delta > 0 && this.movingPanel.position.y > this.liftDownLimit)
            this.movingPanel.translateY(-delta * this.liftSpeed);
    }

    // Helper functions

    _createCabinBody(length = 30, height = 10, width = 15, material?: THREE.Material): THREE.Mesh {
        // We define some points of interest based on parameters
        const tipY = height / 3;
        const tipX = length * 0.10; // 10% of length on front and back

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
            bevelEnabled: false
        }

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0xF3FD12});

        return new THREE.Mesh(geometry, material);
    }

    _createCabinChair(chairLength: number, chairHeight: number, chairWidth: number, material?: THREE.Material): THREE.Mesh {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(-chairLength, 0);
        shape.lineTo(-(chairLength + 2), chairHeight);
        shape.lineTo(-chairLength, chairHeight);
        shape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 1,
            depth: chairWidth,
            bevelEnabled: false
        }

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0xEA6A1C});
        return new THREE.Mesh(geometry, material);
    }

    _createCabinPanel(panelLength: number, panelHeight: number, panelWidth: number, material?: THREE.Material): THREE.Mesh {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, panelHeight);
        shape.lineTo(-panelLength, panelHeight);
        shape.lineTo(-(panelLength + 1), 0);
        shape.lineTo(0 , 0);

        const extrudeSettings = {
            steps: 1,
            depth: panelWidth,
            bevelEnabled: false
        }

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0x920D0D});
        return new THREE.Mesh(geometry, material);
    }

    _createVerticalRods(height: number, separation: number, material?: THREE.Material): THREE.Mesh[] {
        const geometry = new THREE.BoxGeometry(1, height, 1.5);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0xDACACA});
        const leftRod = new THREE.Mesh(geometry, material);
        const rightRod = new THREE.Mesh(geometry, material);
        leftRod.position.set(0.5, height / 2, -(separation / 2));
        rightRod.position.set(0.5, height / 2, separation / 2);
        return [leftRod, rightRod];
    }

    _createHorizontalRods(width: number, separation: number, material?: THREE.Material): THREE.Mesh[] {
        const geometry = new THREE.BoxGeometry(1, 1.5, width);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0x983D3D});
        const bottomRod = new THREE.Mesh(geometry, material);
        const middleRod = new THREE.Mesh(geometry, material);
        const topRod = new THREE.Mesh(geometry, material);
        bottomRod.position.set(0, separation * 0.25, 0);
        middleRod.position.set(bottomRod.position.x, bottomRod.position.y + separation, bottomRod.position.z);
        topRod.position.set(middleRod.position.x, middleRod.position.y + separation, middleRod.position.z);
        return [bottomRod, middleRod, topRod];
    }

    _createLiftPanel(length: number, initialHeight: number, width: number, material?: THREE.Material): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(length, 0.5, width);
        if (!material)
            material = new THREE.MeshLambertMaterial({color: 0xD19123});
        const panel = new THREE.Mesh(geometry, material);
        panel.position.set(length / 2 + 0.5, initialHeight, panel.position.z);
        return panel;
    }
}

export default Forklift;