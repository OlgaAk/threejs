import * as THREE from '../node_modules/three/build/three.module.js';
import {DragControls} from './DragControls.js';

let renderer, scene, camera, raycaster, controls;
let pointCount = 0;
let line;
let area;
let group;
const MAX_POINTS = 50;
let drawCount;
let dragStarted = false;
const objects = []

// this will be 2D coordinates of the current mouse position, [0,0] is middle of the screen.
const mouse = new THREE.Vector2();


let latestMouseProjection; // this is the latest projection of the mouse on object (i.e. intersection with ray)
let hoveredObj; // this objects is ho

init();

// animate();

function init() {

    // info
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

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();


    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);


    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 1000);

    controls = new DragControls(objects, camera, renderer.domElement);
    controls.addEventListener('dragstart', function (event) {
        dragStarted = true
        ;
    })

    controls.addEventListener('drag', function (event) {
        modifyPositions(event.object.position, event.object.userData.indexInLine);
    })

    controls.addEventListener('dragend', function (event) {

    })


    // geometry
    const geometry = new THREE.BufferGeometry();

    // attributes
    const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    //
    // // drawcalls
    // drawCount = 2; // draw the first 2 points, only
    // geometry.setDrawRange(0, drawCount);

    // material
    const material = new THREE.LineBasicMaterial({color: "grey"});

    // line
    line = new THREE.Line(geometry, material);
    scene.add(line);
    console.log(line)
    // update positions


    const areaMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        color: "green",
        alphaTest: 0.2,
        opacity: 0.2,
        side: THREE.DoubleSide
    });

    const californiaPts = [];


    californiaPts.push(new THREE.Vector2(-114.26580810546875, 216.44581604003906));
    californiaPts.push(new THREE.Vector2(220.8406524658203, 85.69935607910156));
    californiaPts.push(new THREE.Vector2(-28.566452026367188, -3.2961292266845703));
    californiaPts.push(new THREE.Vector2(-238.42001342773438, 53.83677673339844));
    californiaPts.push(new THREE.Vector2(-329.6129150390625, 164.80645751953125));

    const areaShape = new THREE.Shape(californiaPts);
    let areaGeometry = new THREE.ShapeGeometry(areaShape);
    // areaGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    let area2 = new THREE.Mesh(areaGeometry, areaMaterial);
    scene.add(area2);

    const areaShape2 = new THREE.Shape();
    let areaGeometry2 = new THREE.ShapeGeometry(areaShape2);
    areaGeometry2.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    area = new THREE.Mesh(areaGeometry2, areaMaterial);
    // scene.add(area);

    // area.geometry.attributes.position.array[0] = -114.26580810546875
    // area.geometry.attributes.position.array[1] = 216.44581604003906
    // area.geometry.attributes.position.array[3] = 220.8406524658203
    // area.geometry.attributes.position.array[4] = 85.69935607910156
    // area.geometry.attributes.position.array[6] = -28.566452026367188
    // area.geometry.attributes.position.array[7] = -3.2961292266845703
    // area.geometry.attributes.position.array[9] = -238.42001342773438
    // area.geometry.attributes.position.array[10] = 53.83677673339844
    // area.geometry.attributes.position.array[12] = -329.6129150390625
    // area.geometry.attributes.position.array[13] = 164.80645751953125
    //

    console.log(area)
    updateArea(area,areaGeometry, 5)
    area.geometry.attributes.position.needsUpdate = true;
    area.geometry.setDrawRange(0, 10);


    renderer.render(scene, camera);
}

function updateArea(area, geometry, pointsCount, newCoordinates) {
    const vectors = []
    for (let i=0; i < pointsCount; i++) {
        const vert = new THREE.Vector2().fromArray(geometry.attributes.position.array, i);
        vectors.push(vert)
    }
    if (newCoordinates) vectors.push(new THREE.Vector2(newCoordinates.x, newCoordinates.x));

    const areaShape = new THREE.Shape(vectors);
    const areaGeometry = new THREE.ShapeGeometry(areaShape);
    area.geometry.copy(areaGeometry)
}


// update positions
function updatePositions() {
    const positions = line.geometry.attributes.position.array;
    let x, y, z;
    x = y = z = 0;
    for (let i = 0, l = 2; i < l; i++) {
        x += (Math.random() - 0.5) * 130;
        y += (Math.random() - 0.5) * 130;
        ;
        positions[pointCount++] = x;
        positions[pointCount++] = y;
        positions[pointCount++] = z;
        addDot(x, y, z, pointCount)
        console.log(x, y, z)
        line.geometry.setDrawRange(0, pointCount / 3);
    }
}

function modifyPositions(newPosition, index) {
    const positions = line.geometry.attributes.position.array;
    positions[index - 3] = newPosition.x;
    positions[index - 2] = newPosition.y;
    positions[index - 1] = newPosition.z;
    line.geometry.setDrawRange(0, pointCount / 3);
    console.log(newPosition, index)
}

function addDot(x, y, z, index) {
    var size = 5;
    var vertGeometry = new THREE.CircleGeometry(size, 32);
    var vertMaterial = new THREE.MeshBasicMaterial({
        color: "white",
        transparent: false,

    });
    var vertMarker = new THREE.Mesh(vertGeometry, vertMaterial);
    vertMarker.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
    scene.add(vertMarker);
    objects.push(vertMarker)
    vertMarker.userData.indexInLine = index;
    console.log(area)
    console.log(line)
}

// render
function render() {
    renderer.render(scene, camera);
}


function animate() {
    renderer.render(scene, camera);
    line.geometry.attributes.position.needsUpdate = true;
    // requestAnimationFrame(animate);
}


// animate
function animate2() {
    if (drawCount === 0) {
        return
    }

    requestAnimationFrame(animate);
    drawCount = (drawCount + 1) % MAX_POINTS;
    console.log(line)
    if (drawCount === 0) {
        return
    }
    line.geometry.setDrawRange(0, drawCount);
    if (drawCount === 0) {
        // periodically, generate new data
        // updatePositions();
        //
        // line.geometry.attributes.position.needsUpdate = true; // required after the first render
        //
        // line.material.color.setHSL( Math.random(), 1, 0.5 );
    }
    render();
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
        var intersects = raycaster.intersectObjects([]);
        if (intersects.length > 0) {
            latestMouseProjection = intersects[0].point;
            hoveredObj = intersects[0].object;
        }
    }
}

function updateMouseCoords(event, coordsObj) {
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse
    vec.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onClickHandler, false);

function onClickHandler(event) {
    console.log(dragStarted)
    if (!dragStarted) {
        event.preventDefault();
        let pos = getMousePosition(event)
        const positions = line.geometry.attributes.position.array;
        positions[pointCount++] = pos.x;
        positions[pointCount++] = pos.y;
        positions[pointCount++] = pos.z;
        addDot(pos.x, pos.y, pos.z, pointCount)
        line.geometry.setDrawRange(0, pointCount / 3)
        // line.geometry.attributes.position.needsUpdate = true;
        animate()

    } else {
        dragStarted = false
        animate()
    }
}

function getMousePosition(event) {
    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse
    vec.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    console.log(pos)
    return pos
}

function getIntersections(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    return raycaster.intersectObjects(objects, true);

}