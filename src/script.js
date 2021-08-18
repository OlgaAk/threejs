import * as THREE from '../node_modules/three/build/three.module.js';
import {DragControls} from '../node_modules/three/examples/jsm/controls/DragControls';

let renderer, scene, camera, raycaster, controls, mouse;
let line, area, group;
let MAX_POINTS;
let pointCount;

let selectedPoint = null;
let selectedPointInfoDiv;

//mouse events
let dragStarted = false;
const objects = []
let latestMouseProjection;
let hoveredObj;

init();

function init() {

    selectedPointInfoDiv = document.getElementById("selected-point-info")

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    MAX_POINTS = 50;
    pointCount = 0;

    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 1000);

    //drag drop
    controls = new DragControls(objects, camera, renderer.domElement);

    initEventListeners()

    initObjects()

    renderer.render(scene, camera);
}


function initEventListeners() {
    controls.addEventListener('dragstart', () => dragStarted = true)
    controls.addEventListener('drag', function (event) {
        modifyVectorCoordinates(line, event.object);
    })
    document.querySelector("canvas").addEventListener('mousemove', onMouseMove, false);
    document.querySelector("canvas").addEventListener('click', onClickHandler, false);
}

function initObjects() {
    // line
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({color: "grey"});
    line = new THREE.Line(lineGeometry, material);
    scene.add(line);

    // area
    const areaMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        color: "green",
        alphaTest: 0.2,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    area = new THREE.Mesh(lineGeometry, areaMaterial);
    scene.add(area);
}


// Updates coordinates of a point in the Line Object
function modifyVectorCoordinates(line, object) {
    const index = objects.indexOf(object)
    if (index != -1) {
        const positions = line.geometry.attributes.position.array;
        positions[index * 3] = object.position.x;
        positions[index * 3 + 1] = object.position.y;
        positions[index * 3 + 2] = object.position.z;
        line.geometry.setDrawRange(0, pointCount / 3);
    }
}

function addDot(x, y, z, index) {
    const size = 10;
    const markerGeometry = new THREE.CircleGeometry(size, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({
        color: "white",
        transparent: false,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
    scene.add(marker);
    objects.push(marker)
    marker.userData.indexInLine = index;
}

function animate() {
    renderer.render(scene, camera);
    line.geometry.attributes.position.needsUpdate = true;
    // requestAnimationFrame(animate);
}

// Mouse Events

function onClickHandler(event) {
    event.preventDefault();
    unselectAllPoints()
    let intersections = getIntersections(event)
    if (intersections.length > 0) {
        selectPoint(intersections[0])
    }
    if (!dragStarted) { // prevent from creating new points if drag event started
        let pos = getMousePosition(event)
        const positions = line.geometry.attributes.position.array;
        positions[pointCount++] = pos.x;
        positions[pointCount++] = pos.y;
        positions[pointCount++] = pos.z;
        addDot(pos.x, pos.y, pos.z, pointCount)
        line.geometry.setDrawRange(0, pointCount / 3)
        animate()
    } else {
        dragStarted = false
        animate()
    }
}

function selectPoint(intersection) {
    selectedPoint = intersection.object
    selectedPoint.material.color.setHex(0xffff00)
    selectedPointInfoDiv.innerHTML = "Selected point: " + selectedPoint.uuid
    const btn = document.createElement("button")
    btn.textContent = "Delete"
    btn.addEventListener("click", (event) => deletePoint(selectedPoint))
    selectedPointInfoDiv.appendChild(btn)
}

function deletePoint(pointObject) {
    const index = objects.indexOf(pointObject)
    const positions = line.geometry.attributes.position.array;
    removeVectorFromGeometry(positions, index)
    pointCount -= 3
    removeObjectFromObjectsArray(pointObject, index)
    line.geometry.setDrawRange(0, pointCount / 3)
    animate()
}

function removeObjectFromObjectsArray(pointObject, index) {
    objects.splice(index, 1)
    pointObject.geometry.dispose();
    pointObject.material.dispose();
    scene.remove(pointObject);
}

function removeVectorFromGeometry(positions, index) {
    for (let i = index * 3; i < (objects.length - 1) * 3; i++) {
        positions[i] = positions[i + 3]
    }
    positions[objects.length * 3 - 1] = 0
    positions[objects.length * 3 - 2] = 0
    positions[objects.length * 3 - 3] = 0
}

function unselectAllPoints() {
    selectedPoint = null;
    objects.forEach(o => {
        o.material.color.setHex(0xffffff)
    })
}

function onMouseMove(event) {
    updateMouseCoords(event, mouse);
    latestMouseProjection = undefined;
    hoveredObj = undefined;
    handleManipulationUpdate();
}

function handleManipulationUpdate() {
    raycaster.setFromCamera(mouse, camera);
    {
        const intersects = raycaster.intersectObjects([]);
        if (intersects.length > 0) {
            latestMouseProjection = intersects[0].point;
            hoveredObj = intersects[0].object;
        }
    }
}

function updateMouseCoords(event, coordsObj) {
    const vec = new THREE.Vector3();
    const pos = new THREE.Vector3();
    vec.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    const distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
}


function getMousePosition(event) {
    const vec = new THREE.Vector3();
    const pos = new THREE.Vector3();
    vec.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    const distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return pos
}

function getIntersections(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects, true);
}