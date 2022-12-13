import React, { Component } from 'react';
import * as THREE from 'three';
import * as TP02 from '../constants/tp02.constants';
import { PRINTABLE_OBJECT_RGB, PRINTABLE_SHAPES } from '../constants/printable.constants';
import { OrbitControls } from '../scripts/OrbitControls';
import { GUI } from 'dat.gui';
import Printer from '../objects/printer.object';
import i18n from 'i18next';
import Forklift from '../objects/forklift.object';
import Shelf from '../objects/shelf.object';
import { getSpotLightObject } from '../helpers/light.helper';
import { BoundingBoxUVGenerator } from '../helpers/uv.helper';

class Tp02 extends Component {
    // objects
    ui = undefined;
    clock = undefined;
    cameraControlPair = [];
    currentCamera = undefined;
    currentControls = undefined;
    scene = undefined;
    keyStates = [];
    keyDownStates = [];
    settings = {
        shape: TP02.SETTINGS_DEFAULT_SHAPE,
        height: TP02.SETTINGS_DEFAULT_HEIGHT,
        twistAngle: TP02.SETTINGS_DEFAULT_TWIST_ANGLE,
        eventOnPrint: () => {
            this.eventPrintObject();
        },
    };
    holders = [];
    printer = undefined;
    forklift = undefined;

    componentDidMount() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;
        const aspect = width / height;

        // scene creation
        const scene = new THREE.Scene();
        this.scene = scene;

        // renderer logic
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(TP02.SKY_RGB);
        renderer.setSize(width, height);
        renderer.localClippingEnabled = true;
        this.renderer = renderer;

        // ui logic
        this.setUpUI();

        // light logic
        this.setUpLightning(scene);

        // set up scene objects
        this.setUpObjects(scene, aspect);

        // camera logic
        this.setUpCameras(aspect);

        // set up controls
        this.setUpControls(document);

        // other stuff
        window.addEventListener('resize', this.handleResize);
        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    componentWillUnmount() {
        this.stop();
        this.mount?.removeChild(this.renderer.domElement);
        this.ui?.destroy();
    }

    handleResize = () => {
        const width = this.mount?.clientWidth;
        const height = this.mount?.clientHeight;
        if (!width || !height) return;

        this.renderer?.setSize(width, height);
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    };

    start = () => {
        this.clock = new THREE.Clock();
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    };

    stop = () => {
        cancelAnimationFrame(this.frameId);
    };

    animate = () => {
        // call all animate functions here
        const delta = Math.min(this.clock.getDelta(), TP02.MAX_DELTA);

        // controls
        this.animateKeyPress(delta);

        // printer related
        this.printer.animate(delta);

        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    };

    renderScene = () => {
        this.renderer.render(this.scene, this.currentCamera);
    };

    // aux setup functions

    setUpUI = () => {
        const ui = new GUI();

        // printer settings
        const printerSettings = ui.addFolder(i18n.t('page.tp01.settings.printer.title'));
        // shape
        const shapes = Object.values(PRINTABLE_SHAPES);
        printerSettings.add(this.settings, 'shape', shapes).name(i18n.t('page.tp01.settings.printer.shape'));
        // height
        printerSettings
            .add(this.settings, 'height', TP02.SETTINGS_MIN_HEIGHT, TP02.SETTINGS_MAX_HEIGHT)
            .name(i18n.t('page.tp01.settings.printer.height'));
        // twist angle
        printerSettings
            .add(this.settings, 'twistAngle', TP02.SETTINGS_MIN_TWIST_ANGLE, TP02.SETTINGS_MAX_TWIST_ANGLE)
            .name(i18n.t('page.tp01.settings.printer.twistAngle'));
        // print
        printerSettings.add(this.settings, 'eventOnPrint').name(i18n.t('page.tp01.settings.printer.print'));
        // keep open
        printerSettings.open();

        this.ui = ui;
    };

    setUpLightning = (scene) => {
        const ambientLight = new THREE.AmbientLight(0x646464);
        scene.add(ambientLight);
        for (let i = 0; i < 6; i++) {
            const lightX = (Math.floor(i % 3) - 1) * TP02.LIGHT_INTERVAL_X;
            const lightZ = (i < 3 ? 1 : -1) * TP02.LIGHT_INTERVAL_Z;
            const lightObject = getSpotLightObject();
            lightObject.position.set(lightX, TP02.LIGHT_HEIGHT, lightZ);
            scene.add(lightObject);
        }
    };

    setUpCameras = (aspect) => {
        // center camera
        const centerCamera = new THREE.PerspectiveCamera(
            TP02.CAMERA_FOV,
            aspect,
            TP02.CAMERA_DEFAULT_NEAR,
            TP02.CAMERA_DEFAULT_FAR,
        );
        centerCamera.position.set(TP02.CENTER_CAMERA_X, TP02.CENTER_CAMERA_Y, TP02.CENTER_CAMERA_Z);
        const centerControls = new OrbitControls(centerCamera, this.renderer.domElement);
        centerControls.enableRotate = false;
        centerControls.enablePan = false;
        centerControls.minDistance = TP02.CENTER_CAMERA_CONTROLS_MIN_DOLLY;
        centerControls.maxDistance = TP02.CENTER_CAMERA_CONTROLS_MAX_DOLLY;
        this.cameraControlPair.push({
            camera: centerCamera,
            controls: centerControls,
        });

        // printer camera
        const printerCamera = new THREE.PerspectiveCamera(
            TP02.CAMERA_FOV,
            aspect,
            TP02.CAMERA_DEFAULT_NEAR,
            TP02.CAMERA_DEFAULT_FAR,
        );
        printerCamera.position.set(TP02.PRINTER_CAMERA_X, TP02.PRINTER_CAMERA_Y, TP02.PRINTER_CAMERA_Z);
        printerCamera.lookAt(TP02.PRINTER_X, TP02.PRINTER_CAMERA_Y, TP02.PRINTER_Z);
        const printerControls = new OrbitControls(printerCamera, this.renderer.domElement);
        printerControls.enableRotate = false;
        printerControls.enablePan = false;
        printerControls.minDistance = TP02.PRINTER_CAMERA_CONTROLS_MIN_DOLLY;
        printerControls.maxDistance = TP02.PRINTER_CAMERA_CONTROLS_MAX_DOLLY;
        printerControls.target = new THREE.Vector3(TP02.PRINTER_X, TP02.PRINTER_CAMERA_Y, TP02.PRINTER_Z);
        this.cameraControlPair.push({
            camera: printerCamera,
            controls: printerControls,
        });

        // shelf camera
        const shelfCamera = new THREE.PerspectiveCamera(
            TP02.CAMERA_FOV,
            aspect,
            TP02.CAMERA_DEFAULT_NEAR,
            TP02.CAMERA_DEFAULT_FAR,
        );
        shelfCamera.position.set(TP02.SHELF_CAMERA_X, TP02.SHELF_CAMERA_Y, TP02.SHELF_CAMERA_Z);
        shelfCamera.lookAt(TP02.SHELF_X, TP02.SHELF_CAMERA_Y, TP02.SHELF_Z);
        const shelfControls = new OrbitControls(shelfCamera, this.renderer.domElement);
        centerControls.enableRotate = false;
        shelfControls.enablePan = false;
        shelfControls.minDistance = TP02.SHELF_CAMERA_CONTROLS_MIN_DOLLY;
        shelfControls.maxDistance = TP02.SHELF_CAMERA_CONTROLS_MAX_DOLLY;
        shelfControls.target = new THREE.Vector3(TP02.SHELF_X, TP02.SHELF_CAMERA_Y, TP02.SHELF_Z);
        this.cameraControlPair.push({
            camera: shelfCamera,
            controls: shelfControls,
        });

        // forklift cameras
        this.cameraControlPair.push({
            camera: this.forklift.getFrontCamera(),
            controls: null,
        });
        this.cameraControlPair.push({
            camera: this.forklift.getBackCamera(),
            controls: null,
        });
        this.cameraControlPair.push({
            camera: this.forklift.getSideCamera(),
            controls: null,
        });

        // current camera
        this.currentCamera = centerCamera;
        this.currentControls = centerControls;
    };

    setUpControls = (document) => {
        // key up & keydown
        document.addEventListener('keydown', (event) => {
            this.keyDownStates[event.code] = true;
            this.keyStates[event.code] = true;
        });
        document.addEventListener('keyup', (event) => {
            this.keyStates[event.code] = false;
        });
        document.body.addEventListener('mousedown', (e) => {
            switch (e.button) {
                case 2:
                    // right click: invert control enable
                    if (this.currentControls) this.currentControls.enabled = !this.currentControls.enabled;
                    break;
                default:
                // Nothing
            }
        });
        // mouse movement
        document.body.addEventListener('mousemove', (e) => {
            if (this.currentControls?.enabled) {
                this.currentControls.handleMouseMoveRotate(e);
            }
        });
    };

    setUpStage = (scene) => {
        // ground
        const groundDiffuse = new THREE.TextureLoader().load('maps/pisoDiffuse.png');
        const groundNormal = new THREE.TextureLoader().load('maps/pisoNormal.png');
        for (const texture of [groundDiffuse, groundNormal]) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            texture.center.set(0.5, 0.5);
        }
        const groundGeometry = new THREE.PlaneGeometry(TP02.GROUND_SIZE, TP02.GROUND_SIZE, 1, 1);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshPhongMaterial({
            map: groundDiffuse,
            normalMap: groundNormal,
            side: THREE.FrontSide,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        scene.add(ground);

        // roof
        const roofFrontDiffuse = new THREE.TextureLoader().load('maps/paredDiffuse.png');
        const roofFrontNormal = new THREE.TextureLoader().load('maps/paredNormal.png');
        for (const texture of [roofFrontDiffuse, roofFrontNormal]) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1 / 160, 1 / 160);
            texture.center.set(0.5, 0.5);
        }
        const roofSideDiffuse = roofFrontDiffuse.clone();
        const roofSideNormal = roofFrontNormal.clone();
        for (const texture of [roofSideDiffuse, roofSideNormal]) {
            texture.rotation = Math.PI / 2;
        }
        const roofShape = new THREE.Shape();
        roofShape.moveTo(-TP02.GROUND_SIZE / 2, -1);
        roofShape.lineTo(-TP02.GROUND_SIZE / 2, TP02.ROOF_HEIGHT);
        roofShape.bezierCurveTo(
            -TP02.GROUND_SIZE / 2,
            TP02.ROOF_CP,
            TP02.GROUND_SIZE / 2,
            TP02.ROOF_CP,
            TP02.GROUND_SIZE / 2,
            TP02.ROOF_HEIGHT,
        );
        roofShape.lineTo(TP02.GROUND_SIZE / 2, -1);
        const extrudeSettings = {
            steps: 10,
            depth: TP02.GROUND_SIZE,
            bevelEnabled: false,
            material: 0,
            extrudeMaterial: 1,
            uvGenerator: BoundingBoxUVGenerator,
        };
        const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
        const roofMaterialFront = new THREE.MeshPhongMaterial({
            map: roofFrontDiffuse,
            normalMap: roofFrontNormal,
            side: THREE.BackSide,
        });
        const roofMaterialSide = new THREE.MeshPhongMaterial({
            map: roofSideDiffuse,
            normalMap: roofSideNormal,
            side: THREE.BackSide,
        });
        const roofMaterial = [roofMaterialFront, roofMaterialSide];
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.z -= TP02.GROUND_SIZE / 2;
        scene.add(roof);
    };

    setUpPrinter = (scene) => {
        const printer = new Printer(
            TP02.PRINTER_HAND_MOVEMENT_SPEED,
            TP02.PRINTER_PRINT_SLOWDOWN,
            TP02.PRINTED_OBJECT_MAX_HEIGHT,
            true,
        );
        printer.position.set(TP02.PRINTER_X, TP02.PRINTER_Y, TP02.PRINTER_Z);
        this.printer = printer;
        this.holders.push(printer.holder);
        scene.add(printer);
    };

    setUpForklift = (scene, aspect) => {
        // Wheel material
        const tyreRepeatFactorX = 0.9;
        const tyreRepeatFactorY = 10;
        const wheelRotation = Math.PI / 2;
        const wheelLateralDiffuse = new THREE.TextureLoader().load('maps/ruedaLateralDiffuse.jpg');
        const wheelLateralNormal = new THREE.TextureLoader().load('maps/ruedaLateralNormal.jpg');
        const wheelLateralBump = new THREE.TextureLoader().load('maps/ruedaLateralBump.jpg');
        for (const texture of [wheelLateralDiffuse, wheelLateralNormal, wheelLateralBump]) {
            texture.center.set(0.5, 0.5);
        }
        const wheelLateralMaterial = new THREE.MeshPhongMaterial({
            map: wheelLateralDiffuse,
            normalMap: wheelLateralNormal,
            bumpMap: wheelLateralBump,
            side: THREE.DoubleSide,
        });
        const wheelVerticalDiffuse = new THREE.TextureLoader().load('maps/ruedaVerticalDiffuse.jpg');
        const wheelVerticalNormal = new THREE.TextureLoader().load('maps/ruedaVerticalNormal.jpg');
        for (const texture of [wheelVerticalDiffuse, wheelVerticalNormal]) {
            texture.center.set(0.5, 0.5);
            texture.rotation = wheelRotation;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(tyreRepeatFactorX, tyreRepeatFactorY);
        }
        const wheelVerticalMaterial = new THREE.MeshPhongMaterial({
            map: wheelVerticalDiffuse,
            normalMap: wheelVerticalNormal,
            side: THREE.DoubleSide,
        });
        const wheelMaterial = [wheelVerticalMaterial, wheelLateralMaterial, wheelLateralMaterial];

        // cabinBody material
        const cabinBodyDiffuse = new THREE.TextureLoader().load('maps/gruaDiffuse.jpg');
        const cabinBodyNormal = new THREE.TextureLoader().load('maps/gruaNormal.jpg');
        for (const texture of [cabinBodyDiffuse, cabinBodyNormal]) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1 / 24, 1 / 24);
            texture.center.set(0.5, 0.5);
            texture.offset.set(0.4, 0.2);
        }
        const cabinBodyMaterial = new THREE.MeshPhongMaterial({ map: cabinBodyDiffuse, normalMap: cabinBodyNormal });

        // cabinChair material
        const cabinChairMaterial = new THREE.MeshPhongMaterial({ color: '#454545' });

        const forklift = new Forklift(
            TP02.FORKLIFT_MOVEMENT_SPEED,
            TP02.FORKLIFT_ROTATION_SPEED,
            TP02.FORKLIFT_LIFT_SPEED,
            TP02.FORKLIFT_MAX_INTERACTION_DISTANCE,
            TP02.CAMERA_FOV,
            aspect,
            TP02.CAMERA_DEFAULT_NEAR,
            TP02.CAMERA_DEFAULT_FAR,
            true,
            wheelMaterial,
            cabinBodyMaterial,
            cabinChairMaterial,
        );
        forklift.position.set(TP02.FORKLIFT_STARTING_X, TP02.FORKLIFT_STARTING_Y, TP02.FORKLIFT_STARTING_Z);
        forklift.rotateY(Math.PI);
        forklift.scale.multiplyScalar(TP02.FORKLIFT_SCALE_FACTOR);
        forklift.getGrabber().scale.divideScalar(TP02.FORKLIFT_SCALE_FACTOR);
        this.forklift = forklift;
        this.holders.push(forklift.getGrabber());
        scene.add(forklift);
    };

    setUpShelf = (scene) => {
        const shelf = new Shelf(
            TP02.SHELF_ROWS,
            TP02.SHELF_COLUMNS,
            TP02.SHELF_SPACE_LENGTH,
            TP02.SHELF_SPACE_WIDTH,
            TP02.SHELF_SPACE_HEIGHT,
        );
        shelf.position.set(TP02.SHELF_X, TP02.SHELF_Y, TP02.SHELF_Z);
        shelf.rotateY(Math.PI / 2);
        shelf.getHolders().forEach((h) => {
            this.holders.push(h);
        });
        scene.add(shelf);
    };

    setUpObjects = (scene, aspect) => {
        this.setUpStage(scene);
        this.setUpPrinter(scene);
        this.setUpForklift(scene, aspect);
        this.setUpShelf(scene);
    };

    eventPrintObject = () => {
        const defaultPrintableMaterial = new THREE.MeshLambertMaterial({
            color: PRINTABLE_OBJECT_RGB,
            side: THREE.DoubleSide,
        });
        try {
            this.printer.print(
                this.settings.shape,
                this.settings.height,
                this.settings.twistAngle,
                defaultPrintableMaterial,
            );
        } catch (err) {
            console.log(err.message);
        }
    };

    animateKeyPress = (delta) => {
        // camera related, select camera prioritizing lowest i
        for (let i = 0; i < Math.min(this.cameraControlPair.length, 8); i++) {
            const keyEventString = `Digit${i + 1}`;
            if (!this.keyStates[keyEventString]) continue;

            this.currentCamera = this.cameraControlPair[i].camera;
            this.currentControls = this.cameraControlPair[i].controls;
            break;
        }
        // controls related, dolly only if either
        if (this.keyStates[TP02.KEY_CONTROLS_DOLLY_IN] && !this.keyStates[TP02.KEY_CONTROLS_DOLLY_OUT]) {
            if (this.currentControls?.enabled) this.currentControls.dollyIn();
        }
        if (!this.keyStates[TP02.KEY_CONTROLS_DOLLY_IN] && this.keyStates[TP02.KEY_CONTROLS_DOLLY_OUT]) {
            if (this.currentControls?.enabled) this.currentControls.dollyOut();
        }

        // forklift related
        if (this.keyStates[TP02.KEY_FORKLIFT_FORWARD] && !this.keyStates[TP02.KEY_FORKLIFT_BACKWARDS]) {
            this.forklift.moveForward(delta);
        }
        if (!this.keyStates[TP02.KEY_FORKLIFT_FORWARD] && this.keyStates[TP02.KEY_FORKLIFT_BACKWARDS]) {
            this.forklift.moveBackwards(delta);
        }
        if (this.keyStates[TP02.KEY_FORKLIFT_LEFT] && !this.keyStates[TP02.KEY_FORKLIFT_RIGHT]) {
            this.forklift.rotateLeft(delta);
        }
        if (!this.keyStates[TP02.KEY_FORKLIFT_LEFT] && this.keyStates[TP02.KEY_FORKLIFT_RIGHT]) {
            this.forklift.rotateRight(delta);
        }
        if (this.keyStates[TP02.KEY_FORKLIFT_LIFT_UP] && !this.keyStates[TP02.KEY_FORKLIFT_LIFT_DOWN]) {
            this.forklift.liftUp(delta);
        }
        if (!this.keyStates[TP02.KEY_FORKLIFT_LIFT_UP] && this.keyStates[TP02.KEY_FORKLIFT_LIFT_DOWN]) {
            this.forklift.liftDown(delta);
        }
        if (this.keyDownStates[TP02.KEY_FORKLIFT_GRABBER]) {
            this.forklift.interactGrabber(this.holders);
        }

        // reset the keyDownStates so they trigger only once
        this.keyDownStates = [];
    };

    // render
    render() {
        return (
            <div
                className="canvas"
                ref={(mount) => {
                    this.mount = mount;
                }}
            />
        );
    }
}

export default Tp02;
