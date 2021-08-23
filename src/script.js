import * as THREE from '../node_modules/three/build/three.module.js';

let renderer, scene, camera, raycaster, mouse;
let line, geometry, area, particles, group;

let pointCount = 0;
let selectedPointIndex = null;
let selectedPointInfoDiv;

//mouse events
let dragging = false;

const DEFAULT_COLOR = "rgb(255, 255, 255)"
const SELECTION_COLOR = "rgb(255, 255, 0)"
const SELECTION_TEXT = "Selected point: ";

init();

function init() {

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

    initEventListeners()
    initObjects()
    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}


function initEventListeners() {
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mouseup", mouseUp, false);
    document.querySelector("canvas").addEventListener('click', onClickHandler, false);
    window.addEventListener('resize', onWindowResize);
}

function initObjects() {
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(), 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(), 3));

    // area
    const areaMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        color: "green",
        alphaTest: 0.2,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    area = new THREE.Mesh(geometry, areaMaterial);
    scene.add(area);

    // points
    const sprite = new THREE.TextureLoader().load('/circle.png');
    const markerMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 14,
        map: sprite,
        //blending: THREE.AdditiveBlending,
        transparent: true, depthTest: false
    })
    particles = new THREE.Points(geometry, markerMaterial);
    scene.add(particles);
}

// Mouse Events

function onClickHandler(event) {
    event.preventDefault();
    let intersections = getIntersections(event)
    if (intersections.length > 0) {
        if (intersections[0].index == selectedPointIndex) return
        unselectPoint(selectedPointIndex, geometry)
        selectPoint(intersections[0].index)
        return
    }
    if (!dragging) { // prevent from creating new points if drag event started
        let pos = getMousePosition(event)
        addVerticeToGeometry(geometry, pointCount, pos)
        updateGeometryIndexes(geometry)
        pointCount += 3
        animate()
    }
}

function addVerticeToGeometry(geometry, index, newCoordinates) {
    addNewPositionsToGeometry(geometry, index, newCoordinates)
    addNewColorsToGeometry(geometry, index, newCoordinates)
}

function addNewPositionsToGeometry(geometry, index, newCoordinates) {
    const positions = geometry.attributes.position.array;
    if (positions.length > 0) {
        // creates a new array from existing, because arrray size can`t be changed
        let newpositions = Array.from(positions);
        newpositions[index] = newCoordinates.x;
        newpositions[index + 1] = newCoordinates.y;
        newpositions[index + 2] = newCoordinates.z;
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
    } else {
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([newCoordinates.x, newCoordinates.y, newCoordinates.z], 3))
    }
    geometry.computeBoundingSphere() // needed for intersection detection
}

function addNewColorsToGeometry(geometry, index, newCoordinates) {
    const colors = geometry.attributes.color.array;
    const color = new THREE.Color(DEFAULT_COLOR)
    if (colors.length > 0) {
        // creates a new array from existing, because arrray size can`t be changed
        let newColors = Array.from(colors);
        newColors[index] = color.r
        newColors[index + 1] = color.g
        newColors[index + 2] = color.b
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(newColors, 3))
    } else {
        geometry.setAttribute("color", new THREE.Float32BufferAttribute([color.r, color.g, color.b], 3))
    }
}

// updates positions without creating a new copy of array, bacause array size stays the same
function updateVerticePositions(geometry, index, newCoordinates) {
    const positions = geometry.attributes.position.array;
    positions[index++] = newCoordinates.x;
    positions[index++] = newCoordinates.y;
    positions[index] = newCoordinates.z;
}

// indexes are used to form faces (triangles), example [1,2,0] -> [1,2,0,2,3,0] -> [1,2,0,2,3,0,3,4,0]
function updateGeometryIndexes(geometry) {
    let positions = geometry.attributes.position.array;
    if (positions.length == 9) { // first triangle needs three vertices or 9 positions
        geometry.setIndex([1, 2, 0]) // first index
        return
    }
    if (geometry.getIndex() && geometry.getIndex().count >= 3) { // if first triangle was already formed
        let newIndexes = Array.from(geometry.getIndex().array);
        let lastElement = newIndexes[newIndexes.length - 2]
        newIndexes.push(lastElement)
        newIndexes.push(lastElement + 1)
        newIndexes.push(0)
        geometry.setIndex(newIndexes)
    }
}

function changePointColor(index, color, geometry, colorsArray) {
    colorsArray[index] = color.r
    colorsArray[index + 1] = color.g
    colorsArray[index + 2] = color.b
    geometry.attributes.color.needsUpdate = true;
}

function unselectPoint(index, geometry) {
    const colors = geometry.attributes.color.array;
    const defaultColor = new THREE.Color(DEFAULT_COLOR);
    changePointColor(index * 3, defaultColor, geometry, colors)
    selectedPointIndex = null
    selectedPointInfoDiv.innerHTML = SELECTION_TEXT
}

function selectPoint(index) {
    selectedPointIndex = index
    const colors = geometry.attributes.color.array;
    const colorOfSelection = new THREE.Color(SELECTION_COLOR);
    changePointColor(selectedPointIndex * 3, colorOfSelection, geometry, colors)
    addSelectedPointInfoText(selectedPointIndex)
}

function addSelectedPointInfoText(index) {
    selectedPointInfoDiv.innerHTML = SELECTION_TEXT + index
    const btn = document.createElement("button")
    btn.textContent = "Delete"
    btn.addEventListener("click", (event) => deletePoint(selectedPointIndex))
    selectedPointInfoDiv.appendChild(btn)
}

function deletePoint(index) {
    const positions = geometry.attributes.position.array;
    removeVectorFromGeometry(geometry, index)
    pointCount -= 3
    removeIndexFromGeometry(geometry)
    animate()
    selectedPointInfoDiv.innerHTML = SELECTION_TEXT
}

function removeIndexFromGeometry(geometry) {
    if (geometry.getIndex().count >= 3) {
        let newIndexes = Array.from(geometry.getIndex().array);
        newIndexes.splice(newIndexes.length - 4, 3)
        geometry.setIndex(newIndexes)
    }
}

function removeVectorFromGeometry(geometry, index) {
    let newpositions = Array.from(geometry.attributes.position.array);
    let newcolors = Array.from(geometry.attributes.color.array);
    // shift elements after the one to be removed left
    newpositions = shiftElementsInAttributeArrayLeft(newpositions, index)
    newcolors = shiftElementsInAttributeArrayLeft(newcolors, index)
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(newcolors, 3))
}

function shiftElementsInAttributeArrayLeft(elements, index) {
    for (let i = index * 3; i < (elements.length / 3 - 1) * 3; i++) {
        elements[i] = elements[i + 3]
    }
    // delete the tail of the array with 3 elements
    elements.splice(elements.length - 4, 3)
    return elements
}

function mouseDown(event) {
    let intersections = getIntersections(event)
    if (intersections.length > 0) {
        if (intersections[0].index == selectedPointIndex) {
            unselectPoint(selectedPointIndex, geometry)
        } else {
            unselectPoint(selectedPointIndex, geometry)
            selectedPointIndex = intersections[0].index
            selectPoint(selectedPointIndex)
        }
    }
    dragging = true;
}

function mouseMove(event) {
    if (dragging && selectedPointIndex !== null) {
        let pos = getMousePosition(event)
        updateVerticePositions(geometry, selectedPointIndex * 3, pos)
        geometry.attributes.position.needsUpdate = true;
    }
}

function mouseUp(event) {
    dragging = false;
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
    return raycaster.intersectObject(particles, true);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}





