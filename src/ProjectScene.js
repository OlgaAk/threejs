import * as THREE from '../node_modules/three/build/three.module.js';

export let renderer, scene, camera, raycaster, mouse;

export function initScene() {

    selectedPointInfoDiv = document.getElementById("selected-point-info")

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 250;

    window.addEventListener('resize', onWindowResize);

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}



export function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}



