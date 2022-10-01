import React, { Component } from 'react';
import * as THREE from 'three';
import {
    TP01_CAMERA_CONTROLS_MAX_DOLLY,
    TP01_CAMERA_CONTROLS_MIN_DOLLY,
    TP01_CAMERA_FOV,
    TP01_CENTER_CAMERA_X,
    TP01_CENTER_CAMERA_Y,
    TP01_CENTER_CAMERA_Z,
    TP01_SETTINGS_DEFAULT_HEIGHT,
    TP01_SETTINGS_DEFAULT_SHAPE,
    TP01_SETTINGS_DEFAULT_TWIST_ANGLE,
    TP01_GROUND_RGB,
    TP01_GROUND_SIZE,
    TP01_MAX_DELTA,
    TP01_SKY_RGB,
    TP01_SETTINGS_MIN_HEIGHT,
    TP01_SETTINGS_MAX_HEIGHT,
    TP01_PRINT_SPEED,
    TP01_PRINTED_OBJECT_MAX_HEIGHT,
    TP01_PRINTER_X,
    TP01_PRINTER_Y,
    TP01_PRINTER_Z,
    TP01_SETTINGS_MIN_TWIST_ANGLE,
    TP01_SETTINGS_MAX_TWIST_ANGLE,
} from '../constants/tp01.constants';
import { PRINTABLE_OBJECT_RGB, PRINTABLE_SHAPES } from '../constants/printable.constants';
import { OrbitControls } from '../scripts/OrbitControls';
import { GUI } from 'dat.gui';
import Printer from '../objects/printer.object';
import i18n from 'i18next';

class Tp01 extends Component {
    // objects
    ui = undefined;
    clock = undefined;
    cameras = [];
    currentCamera = undefined;
    scene = undefined;
    settings = {
        shape: TP01_SETTINGS_DEFAULT_SHAPE,
        height: TP01_SETTINGS_DEFAULT_HEIGHT,
        twistAngle: TP01_SETTINGS_DEFAULT_TWIST_ANGLE,
        eventOnPrint: () => {
            this.eventPrintObject();
        },
    };
    printer = undefined;

    componentDidMount() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        // scene creation
        const scene = new THREE.Scene();
        this.scene = scene;

        // renderer logic
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(TP01_SKY_RGB);
        renderer.setSize(width, height);
        this.renderer = renderer;

        // camera logic
        this.setUpCameras(width / height);

        // ui logic
        this.setUpUI();

        // light logic
        this.setUpLightning(scene);

        // set up scene objects
        this.setUpObjects(scene);

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
        const delta = Math.min(this.clock.getDelta(), TP01_MAX_DELTA);

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
            .add(this.settings, 'height', TP01_SETTINGS_MIN_HEIGHT, TP01_SETTINGS_MAX_HEIGHT)
            .name(i18n.t('page.tp01.settings.printer.height'));
        // twist angle
        printerSettings
            .add(this.settings, 'twistAngle', TP01_SETTINGS_MIN_TWIST_ANGLE, TP01_SETTINGS_MAX_TWIST_ANGLE)
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
        const centerCamera = new THREE.PerspectiveCamera(TP01_CAMERA_FOV, aspect, 0.1, 1000);
        centerCamera.position.set(TP01_CENTER_CAMERA_X, TP01_CENTER_CAMERA_Y, TP01_CENTER_CAMERA_Z);
        const centerControls = new OrbitControls(centerCamera, this.renderer.domElement);
        centerControls.listenToKeyEvents(window);
        centerControls.enablePan = false;
        centerControls.minDistance = TP01_CAMERA_CONTROLS_MIN_DOLLY;
        centerControls.maxDistance = TP01_CAMERA_CONTROLS_MAX_DOLLY;

        this.cameras.push(centerCamera);

        this.currentCamera = centerCamera;
    };

    setUpGround = (scene) => {
        const groundGeometry = new THREE.PlaneGeometry(TP01_GROUND_SIZE, TP01_GROUND_SIZE, 1, 1);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: TP01_GROUND_RGB });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        scene.add(ground);
    };

    setUpPrinter = (scene) => {
        const printer = new Printer(TP01_PRINT_SPEED, TP01_PRINTED_OBJECT_MAX_HEIGHT);
        printer.position.set(TP01_PRINTER_X, TP01_PRINTER_Y, TP01_PRINTER_Z);
        this.printer = printer;
        scene.add(printer);
    };

    setUpObjects = (scene) => {
        this.setUpGround(scene);
        this.setUpPrinter(scene);
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
