import React, { Component } from 'react';
import * as THREE from 'three';
import * as TP01 from '../constants/tp01.constants';
import { PRINTABLE_OBJECT_RGB, PRINTABLE_SHAPES } from '../constants/printable.constants';
import { OrbitControls } from '../scripts/OrbitControls';
import { GUI } from 'dat.gui';
import Printer from '../objects/printer.object';
import i18n from 'i18next';
import Forklift from '../objects/forklift.object';

class Tp01 extends Component {
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
        shape: TP01.SETTINGS_DEFAULT_SHAPE,
        height: TP01.SETTINGS_DEFAULT_HEIGHT,
        twistAngle: TP01.SETTINGS_DEFAULT_TWIST_ANGLE,
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
        renderer.setClearColor(TP01.SKY_RGB);
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
        const delta = Math.min(this.clock.getDelta(), TP01.MAX_DELTA);

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
            .add(this.settings, 'height', TP01.SETTINGS_MIN_HEIGHT, TP01.SETTINGS_MAX_HEIGHT)
            .name(i18n.t('page.tp01.settings.printer.height'));
        // twist angle
        printerSettings
            .add(this.settings, 'twistAngle', TP01.SETTINGS_MIN_TWIST_ANGLE, TP01.SETTINGS_MAX_TWIST_ANGLE)
            .name(i18n.t('page.tp01.settings.printer.twistAngle'));
        // print
        printerSettings.add(this.settings, 'eventOnPrint').name(i18n.t('page.tp01.settings.printer.print'));
        // keep open
        printerSettings.open();

        this.ui = ui;
    };

    setUpLightning = (scene) => {
        const dirLight1 = new THREE.DirectionalLight(0xffffff);
        dirLight1.position.set(1, 1, 1);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x002288);
        dirLight2.position.set(-1, -1, -1);
        scene.add(dirLight2);

        const ambientLight = new THREE.AmbientLight(0x222222);
        scene.add(ambientLight);
    };

    setUpCameras = (aspect) => {
        // center camera
        const centerCamera = new THREE.PerspectiveCamera(
            TP01.CAMERA_FOV,
            aspect,
            TP01.CAMERA_DEFAULT_NEAR,
            TP01.CAMERA_DEFAULT_FAR,
        );
        centerCamera.position.set(TP01.CENTER_CAMERA_X, TP01.CENTER_CAMERA_Y, TP01.CENTER_CAMERA_Z);
        const centerControls = new OrbitControls(centerCamera, this.renderer.domElement);
        centerControls.enableRotate = false;
        centerControls.enablePan = false;
        centerControls.minDistance = TP01.CENTER_CAMERA_CONTROLS_MIN_DOLLY;
        centerControls.maxDistance = TP01.CENTER_CAMERA_CONTROLS_MAX_DOLLY;
        this.cameraControlPair.push({
            camera: centerCamera,
            controls: centerControls,
        });

        // printer camera
        const printerCamera = new THREE.PerspectiveCamera(
            TP01.CAMERA_FOV,
            aspect,
            TP01.CAMERA_DEFAULT_NEAR,
            TP01.CAMERA_DEFAULT_FAR,
        );
        printerCamera.position.set(TP01.PRINTER_CAMERA_X, TP01.PRINTER_CAMERA_Y, TP01.PRINTER_CAMERA_Z);
        printerCamera.lookAt(TP01.PRINTER_X, TP01.PRINTER_CAMERA_Y, TP01.PRINTER_Z);
        const printerControls = new OrbitControls(printerCamera, this.renderer.domElement);
        printerControls.enableRotate = false;
        printerControls.enablePan = false;
        printerControls.minDistance = TP01.PRINTER_CAMERA_CONTROLS_MIN_DOLLY;
        printerControls.maxDistance = TP01.PRINTER_CAMERA_CONTROLS_MAX_DOLLY;
        printerControls.target = new THREE.Vector3(TP01.PRINTER_X, TP01.PRINTER_CAMERA_Y, TP01.PRINTER_Z);
        this.cameraControlPair.push({
            camera: printerCamera,
            controls: printerControls,
        });

        // shelf camera
        const shelfCamera = new THREE.PerspectiveCamera(
            TP01.CAMERA_FOV,
            aspect,
            TP01.CAMERA_DEFAULT_NEAR,
            TP01.CAMERA_DEFAULT_FAR,
        );
        shelfCamera.position.set(TP01.SHELF_CAMERA_X, TP01.SHELF_CAMERA_Y, TP01.SHELF_CAMERA_Z);
        shelfCamera.lookAt(TP01.SHELF_X, TP01.SHELF_CAMERA_Y, TP01.SHELF_Z);
        const shelfControls = new OrbitControls(shelfCamera, this.renderer.domElement);
        centerControls.enableRotate = false;
        shelfControls.enablePan = false;
        shelfControls.minDistance = TP01.SHELF_CAMERA_CONTROLS_MIN_DOLLY;
        shelfControls.maxDistance = TP01.SHELF_CAMERA_CONTROLS_MAX_DOLLY;
        shelfControls.target = new THREE.Vector3(TP01.SHELF_X, TP01.SHELF_CAMERA_Y, TP01.SHELF_Z);
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

    setUpGround = (scene) => {
        const groundGeometry = new THREE.PlaneGeometry(TP01.GROUND_SIZE, TP01.GROUND_SIZE, 1, 1);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: TP01.GROUND_RGB });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        scene.add(ground);
    };

    setUpPrinter = (scene) => {
        const printer = new Printer(
            TP01.PRINTER_HAND_MOVEMENT_SPEED,
            TP01.PRINTER_PRINT_SLOWDOWN,
            TP01.PRINTED_OBJECT_MAX_HEIGHT,
        );
        printer.position.set(TP01.PRINTER_X, TP01.PRINTER_Y, TP01.PRINTER_Z);
        this.printer = printer;
        this.holders.push(printer.holder);
        scene.add(printer);
    };

    setUpForklift = (scene, aspect) => {
        const forklift = new Forklift(
            TP01.FORKLIFT_MOVEMENT_SPEED,
            TP01.FORKLIFT_ROTATION_SPEED,
            TP01.FORKLIFT_LIFT_SPEED,
            TP01.FORKLIFT_MAX_INTERACTION_DISTANCE,
            TP01.CAMERA_FOV,
            aspect,
            TP01.CAMERA_DEFAULT_NEAR,
            TP01.CAMERA_DEFAULT_FAR,
        );
        forklift.position.set(TP01.FORKLIFT_STARTING_X, TP01.FORKLIFT_STARTING_Y, TP01.FORKLIFT_STARTING_Z);
        forklift.rotateY(Math.PI);
        forklift.scale.multiplyScalar(TP01.FORKLIFT_SCALE_FACTOR);
        forklift.getGrabber().scale.divideScalar(TP01.FORKLIFT_SCALE_FACTOR);
        this.forklift = forklift;
        this.holders.push(forklift.getGrabber());
        scene.add(forklift);
    };

    setUpObjects = (scene, aspect) => {
        this.setUpGround(scene);
        this.setUpPrinter(scene);
        this.setUpForklift(scene, aspect);
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
        if (this.keyStates[TP01.KEY_CONTROLS_DOLLY_IN] && !this.keyStates[TP01.KEY_CONTROLS_DOLLY_OUT]) {
            if (this.currentControls?.enabled) this.currentControls.dollyIn();
        }
        if (!this.keyStates[TP01.KEY_CONTROLS_DOLLY_IN] && this.keyStates[TP01.KEY_CONTROLS_DOLLY_OUT]) {
            if (this.currentControls?.enabled) this.currentControls.dollyOut();
        }

        // forklift related
        if (this.keyStates[TP01.KEY_FORKLIFT_FORWARD] && !this.keyStates[TP01.KEY_FORKLIFT_BACKWARDS]) {
            this.forklift.moveForward(delta);
        }
        if (!this.keyStates[TP01.KEY_FORKLIFT_FORWARD] && this.keyStates[TP01.KEY_FORKLIFT_BACKWARDS]) {
            this.forklift.moveBackwards(delta);
        }
        if (this.keyStates[TP01.KEY_FORKLIFT_LEFT] && !this.keyStates[TP01.KEY_FORKLIFT_RIGHT]) {
            this.forklift.rotateLeft(delta);
        }
        if (!this.keyStates[TP01.KEY_FORKLIFT_LEFT] && this.keyStates[TP01.KEY_FORKLIFT_RIGHT]) {
            this.forklift.rotateRight(delta);
        }
        if (this.keyStates[TP01.KEY_FORKLIFT_LIFT_UP] && !this.keyStates[TP01.KEY_FORKLIFT_LIFT_DOWN]) {
            this.forklift.liftUp(delta);
        }
        if (!this.keyStates[TP01.KEY_FORKLIFT_LIFT_UP] && this.keyStates[TP01.KEY_FORKLIFT_LIFT_DOWN]) {
            this.forklift.liftDown(delta);
        }
        if (this.keyDownStates[TP01.KEY_FORKLIFT_GRABBER]) {
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

export default Tp01;
