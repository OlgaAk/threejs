import * as THREE from './three.module.js';
import {DragControls} from './DragControls.js';

let renderer, scene, camera, raycaster, controls, mouse;
let line, area, group;
let MAX_POINTS;
let pointCount;

//mouse events
let dragStarted = false;
const objects = []
let latestMouseProjection;
let hoveredObj;

init();

function init() {
    const info = initInfoDiv();

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

function initInfoDiv() {
    const info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = "three.js animataed line using BufferGeometry";
    document.body.appendChild(info);
    return info
}

function initEventListeners(){
    controls.addEventListener('dragstart',()=>  dragStarted = true)
    controls.addEventListener('drag', function (event) {
        modifyVectorCoordinates(line, event.object.position, event.object.userData.indexInLine, pointCount);
        updateArea(area, line.geometry, pointCount)
    })
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onClickHandler, false);
}

function initObjects(){
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
    const areaShape = new THREE.Shape();
    const areaGeometry = new THREE.ShapeGeometry(areaShape);
    areaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    area = new THREE.Mesh(areaGeometry, areaMaterial);
    scene.add(area);
}

// creates a new Shape Geometry for the Area Object with copied vectors from the Line Object
function updateArea(area, geometry, pointsCount) {
    const vectors = []
    for (let i = 0; i < pointsCount / 3; i++) {
        const vert = new THREE.Vector2().fromArray(geometry.attributes.position.array, i * 3);
        vectors.push(vert)
    }
    const lastVert = new THREE.Vector2().fromArray(geometry.attributes.position.array, 0);
    vectors.push(lastVert)
    const areaShape = new THREE.Shape(vectors);
    const areaGeometry = new THREE.ShapeGeometry(areaShape);
    area.geometry.copy(areaGeometry)
}

// Updates coordinates of a point in the Line Object
function modifyVectorCoordinates(object, newPosition, index, pointCount) {
    const positions = object.geometry.attributes.position.array;
    positions[index - 3] = newPosition.x;
    positions[index - 2] = newPosition.y;
    positions[index - 1] = newPosition.z;
    object.geometry.setDrawRange(0, pointCount / 3);
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
    if (!dragStarted) { // prevent from creating new points if drag event started
        event.preventDefault();
        let pos = getMousePosition(event)
        const positions = line.geometry.attributes.position.array;
        positions[pointCount++] = pos.x;
        positions[pointCount++] = pos.y;
        positions[pointCount++] = pos.z;
        addDot(pos.x, pos.y, pos.z, pointCount)
        line.geometry.setDrawRange(0, pointCount / 3)
        updateArea(area, line.geometry, pointCount)
        animate()
    } else {
        dragStarted = false
        animate()
    }
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