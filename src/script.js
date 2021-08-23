import * as THREE from '../node_modules/three/build/three.module.js';

let renderer, scene, camera, raycaster, mouse;
let line, area, particles, group;
let MAX_POINTS;
let pointCount;

let selectedPointIndex = null;
let selectedPointInfoDiv;

//mouse events
let dragging = false;

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
    camera.position.z = 250;

    initEventListeners()

    initObjects()

    // createAShapeForTest(line)

    line.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}


function initEventListeners() {
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mouseup", mouseUp, false);

    //document.querySelector("canvas").addEventListener('mousemove', onMouseMove, false);
    document.querySelector("canvas").addEventListener('click', onClickHandler, false);
    window.addEventListener('resize', onWindowResize);
}

function initObjects() {
    // line
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array();
    const colors = new Float32Array();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.LineBasicMaterial({color: "grey"});
    line = new THREE.Line(lineGeometry, material);

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

    const sprite = new THREE.TextureLoader().load('/circle.png');

    const markerMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 14,
        map: sprite,
        //blending: THREE.AdditiveBlending,
        transparent: true, depthTest: false
    })

    particles = new THREE.Points(line.geometry, markerMaterial);
    scene.add(particles);
}


function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Mouse Events

function onClickHandler(event) {
    event.preventDefault();
    let intersections = getIntersections(event)
    console.log(intersections)
    if (intersections.length > 0) {
        if (intersections[0].index == selectedPointIndex) return
        if (selectedPointIndex != null && intersections[0].index != selectedPointIndex) {
            unselectPoint(selectedPointIndex, line.geometry)
            selectPoint(intersections[0].index)
            return
        }
        selectPoint(intersections[0].index)
        return
    } else {
        if (selectedPointIndex != null) {
            unselectPoint(selectedPointIndex, line.geometry)
            return
        }
    }

    if (!dragging) { // prevent from creating new points if drag event started
        let pos = getMousePosition(event)
        addVerticeToGeometry(line.geometry, pointCount, pos)
        updateGeometryIndexes(line.geometry)
        pointCount += 3
        animate()
    }
    //  else {
    //     dragging = false
    //     animate()
    // }
}

function addVerticeToGeometry(geometry, index, newCoordinates) {
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color.array;
    const color = new THREE.Color("rgb(255, 255, 255)");
    if (positions.length > 0) {
        let newpositions = Array.from(positions);
        let newColors = Array.from(colors);
        newColors[index] = color.r
        newpositions[index++] = newCoordinates.x;
        newColors[index] = color.g
        newpositions[index++] = newCoordinates.y;
        newColors[index] = color.b
        newpositions[index] = newCoordinates.z;
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(newColors, 3))
    } else {
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([newCoordinates.x, newCoordinates.y, newCoordinates.z], 3))
        geometry.setAttribute("color", new THREE.Float32BufferAttribute([color.r, color.g, color.b], 3))
    }
    geometry.computeBoundingSphere() // needed for intersection detection
}


function updateVertice(geometry, index, newCoordinates) {
    index *= 3
    const positions = geometry.attributes.position.array;
    positions[index++] = newCoordinates.x;
    positions[index++] = newCoordinates.y;
    positions[index] = newCoordinates.z;
}


// indexes are used to form faces (triangles), example [1,2,0,2,3,0], new group ex 3,4,0
function updateGeometryIndexes(geometry) {
    let positions = geometry.attributes.position.array;
    if (positions.length == 9) { // first triangle needs three vertices or 9 positions
        geometry.setIndex([1, 2, 0])
        return
    }
    if (geometry.getIndex() && geometry.getIndex().count >= 3) { // if first triangle was already formed
        let newIndexes = Array.from(geometry.getIndex().array);
        let lastElement = newIndexes[newIndexes.length - 2]
        newIndexes.push(lastElement)
        newIndexes.push(lastElement + 1)
        newIndexes.push(0)
        geometry.setIndex(newIndexes)
        console.log(geometry.getIndex())
    }
}

function changePointColor(index, color, geometry, colorsArray) {
    colorsArray[index * 3] = color.r
    colorsArray[index * 3 + 1] = color.g
    colorsArray[index * 3 + 2] = color.b
    geometry.attributes.color.needsUpdate = true;
}

function unselectPoint(index, geometry) {
    const colors = geometry.attributes.color.array;
    const defaultColor = new THREE.Color("rgb(255, 255, 255)");
    changePointColor(index, defaultColor, geometry, colors)
    selectedPointIndex = null
    selectedPointInfoDiv.innerHTML = "Selected point: "
}

function selectPoint(index) {
    selectedPointIndex = index
    const colors = line.geometry.attributes.color.array;
    const colorOfSelection = new THREE.Color("rgb(255, 255, 0)");
    changePointColor(selectedPointIndex, colorOfSelection, line.geometry, colors)
    addSelectedPointInfoText(selectedPointIndex)
}

function addSelectedPointInfoText(index) {
    selectedPointInfoDiv.innerHTML = "Selected point: " + index
    const btn = document.createElement("button")
    btn.textContent = "Delete"
    btn.addEventListener("click", (event) => deletePoint(selectedPointIndex))
    selectedPointInfoDiv.appendChild(btn)
}


function deletePoint(index) {
    const positions = line.geometry.attributes.position.array;
    removeVectorFromGeometry(line.geometry, index)
    pointCount -= 3
    removeIndexFromGeometry(line.geometry)
    animate()
    selectedPointInfoDiv.innerHTML = "Selected point: "
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
    newpositions = shiftElementsLeft(newpositions, index)
    newcolors = shiftElementsLeft(newcolors, index)
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(newcolors, 3))
}

function shiftElementsLeft(elements, index) {
    for (let i = index * 3; i < (elements.length / 3 - 1) * 3; i++) {
        elements[i] = elements[i + 3]
    }
    // delete the tail of the array with 3 elements
    elements.splice(elements.length - 4, 3)
    return elements
}

function mouseDown(event) {
    selectedPointIndex = null
    setRaycaster(event);
    getIndex();
    dragging = true;
}

function mouseMove(event) {
    if (dragging && selectedPointIndex !== null) {
        setRaycaster(event);
        let pos = getMousePosition(event)
        updateVertice(line.geometry, selectedPointIndex, pos)
        line.geometry.attributes.position.needsUpdate = true;
    }
}

function mouseUp(event) {
    dragging = false;
    selectedPointIndex = null;
}


function setRaycaster(event) {
    getMouse(event);
    raycaster.setFromCamera(mouse, camera);
}

function getMouse(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


function getIndex() {
    let intersects = raycaster.intersectObject(particles);
    if (intersects.length === 0) {
        selectedPointIndex = null;
        return;
    }
    selectedPointIndex = intersects[0].index;
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
    return raycaster.intersectObject(particles, true);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}




