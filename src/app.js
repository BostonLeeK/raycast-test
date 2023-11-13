import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import mapGLB from '../public/map.glb';

let camera, scene, renderer, raycaster, mouse;

init();
animate();



function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    camera.position.set(-10, 25, 20);
    camera.rotation.set(-0.5, 0, 0);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(mapGLB, function (gltf) {
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    });

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    camera.add(pointLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('touchstart', onDocumentTouchStart, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentTouchStart(event) {
    event.preventDefault();
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
    }
}

let previouslyIntersected = null;



function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersected = intersects[0].object;

        if (previouslyIntersected !== intersected) {
            if (previouslyIntersected && previouslyIntersected.material) {
                previouslyIntersected.material.emissive.setHex(previouslyIntersected.currentHex);
            }

            intersected.material = intersected.material.clone();
            intersected.currentHex = intersected.material.emissive.getHex();
            intersected.material.emissive.setHex(0xff0000);

            previouslyIntersected = intersected;
        }
    } else {
        if (previouslyIntersected && previouslyIntersected.material) {
            previouslyIntersected.material.emissive.setHex(previouslyIntersected.currentHex);
        }
        previouslyIntersected = null;
    }

    renderer.render(scene, camera);
}