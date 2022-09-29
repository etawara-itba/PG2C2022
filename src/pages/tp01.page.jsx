import React, { Component } from 'react';
import * as THREE from 'three';
import { GROUND_RGB, GROUND_SIZE, SKY_RGB } from '../constants/scene.constants';
import { generatePrintableMesh } from '../helpers/printable.helper';
import { PRINTABLE_OBJECT_RGB } from '../constants/printable.constants';

class Tp01 extends Component {
    // objects
    clock = undefined;
    printedObject = undefined; //TODO: send to printer when implemented
    cameras = [];
    currentCamera = undefined;
    scene = undefined;

    componentDidMount() {
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        // scene creation
        const scene = new THREE.Scene();
        this.scene = scene;

        // center camera logic
        const centerCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.cameras.push(centerCamera);
        this.currentCamera = centerCamera;
        centerCamera.position.set(0, 5, 40);

        // renderer logic
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(SKY_RGB);
        renderer.setSize(width, height);
        this.renderer = renderer;

        // light logic
        this.setUpLightning(scene);

        // ground generation
        this.setUpGround(scene);

        // printedObject TODO: replace printer here
        const printedObject = generatePrintableMesh(
            'A2',
            720,
            40,
            new THREE.MeshLambertMaterial({ color: PRINTABLE_OBJECT_RGB }),
        );
        scene.add(printedObject);
        this.printedObject = printedObject;

        // other stuff
        window.addEventListener('resize', this.handleResize);
        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }

    componentWillUnmount() {
        this.stop();
        this.mount?.removeChild(this.renderer.domElement);
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
        const delta = this.clock.getDelta();

        // TODO Placeholder animation
        this.printedObject.rotation.y += 3 * delta;

        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    };

    renderScene = () => {
        this.renderer.render(this.scene, this.currentCamera);
    };

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

    // aux setup functions

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

    setUpGround = (scene) => {
        const groundGeometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1);
        groundGeometry.rotateX(-Math.PI / 2);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: GROUND_RGB });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        scene.add(ground);
    };
}

export default Tp01;
