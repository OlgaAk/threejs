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

    // createAShapeForTest(line)

    line.geometry.attributes.position.needsUpdate = true;

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
    const positions = new Float32Array();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
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

    const sprite = new THREE.TextureLoader().load('/disc.png');

    const markerMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 50,
        map: sprite,
        transparent: true,
        blending: THREE.AdditiveBlending,
        fog: false,
        depthTest: false,
    })

    const particles = new THREE.Points(line.geometry, markerMaterial);
    scene.add(particles);
}


// Updates coordinates of a point in the Line Object
function modifyVectorCoordinates(line, object) {
    const index = objects.indexOf(object)
    if (index != -1) {
        addVerticeToGeometry(line.geometry, index * 3, object.position)
    }
}

function addDot(x, y, z, index) {
    console.log(x, y, z)
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
        addVerticeToGeometry(line.geometry, pointCount, pos)
        updateGeometryIndexes(line.geometry)
        pointCount += 3
        // addDot(pos.x, pos.y, pos.z, pointCount)
        animate()
    } else {
        dragStarted = false
        animate()
    }
}

function addVerticeToGeometry(geometry, index, newCoordinates) {
    let positions = geometry.attributes.position.array;
    if (positions.length > 0) {
        let newpositions = Array.from(positions);
        newpositions[index++] = newCoordinates.x;
        newpositions[index++] = newCoordinates.y;
        newpositions[index] = newCoordinates.z;
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
    } else {
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([newCoordinates.x, newCoordinates.y, newCoordinates.z], 3))
    }
}

function updateGeometryIndexes(geometry) {
    let positions = geometry.attributes.position.array;
    if (positions.length == 9) {
        geometry.setIndex([1, 2, 0])
        return
    }
    if (geometry.getIndex() && geometry.getIndex().count >= 3) {
        let newIndexes = Array.from(geometry.getIndex().array);
        let lastElement = newIndexes[newIndexes.length - 2]
        newIndexes.push(lastElement)
        newIndexes.push(lastElement + 1)
        newIndexes.push(0)
        geometry.setIndex(newIndexes)
        console.log(geometry.getIndex())
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
    removeVectorFromGeometry(line.geometry, index)
    pointCount -= 3
    removeObjectFromObjectsArray(pointObject, index)
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

function removeObjectFromObjectsArray(pointObject, index) {
    objects.splice(index, 1)
    pointObject.geometry.dispose();
    pointObject.material.dispose();
    scene.remove(pointObject);
}

function removeVectorFromGeometry(geometry, index) {
    let newpositions = Array.from(geometry.attributes.position.array);
    for (let i = index * 3; i < (objects.length - 1) * 3; i++) {
        newpositions[i] = newpositions[i + 3]
    }
    newpositions.splice(newpositions.length - 4, 3)
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
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
        0);
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


function createAShapeForTest(line) {

    addVerticeToGeometry(line.geometry, 0, {x: -200, y: -100, z: 0})
    addVerticeToGeometry(line.geometry, 3, {x: -100, y: 100, z: 0})
    addVerticeToGeometry(line.geometry, 6, {x: 0, y: 0, z: 0})
    addVerticeToGeometry(line.geometry, 9, {x: -10, y: -50, z: 0})
    addVerticeToGeometry(line.geometry, 12, {x: -20, y: -100, z: 0})

    const sprite = new THREE.TextureLoader().load('/disc.png');

    const markerMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 50,
        map: sprite,
        transparent: true,
        blending: THREE.AdditiveBlending,
        fog: false,
        depthTest: false,
    })

    const particles = new THREE.Points(line.geometry, markerMaterial);
    scene.add(particles);
    //
    // addDot(-200, -100, 0, 0)
    // addDot(-100, 100, 0, 3)
    // addDot(0, 0, 0, 6)
    // addDot(-10, -50, 0, 9)
    // addDot(-20, -100, 0, 12)

    line.geometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5]);

    loop()
    //
    // const geometry = new THREE.BufferGeometry();
    // const vertices = [];

    // const sprite = new THREE.TextureLoader().load( 'textures/sprites/disc.png' );
    //
    // for ( let i = 0; i < 10000; i ++ ) {
    //
    //     const x = 2000 * Math.random() - 1000;
    //     const y = 2000 * Math.random() - 1000;
    //     const z = 2000 * Math.random() - 1000;
    //
    //     vertices.push( x, y, z );
    //
    // }
    //
    // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    //
    // material = new THREE.PointsMaterial( { size: 35, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true } );
    // material.color.setHSL( 1.0, 0.3, 0.7 );
    //
    // const particles = new THREE.Points( geometry, material );
    // scene.add( particles );

}

function loop() {
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}