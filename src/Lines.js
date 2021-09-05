import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"
import {Line2} from '../node_modules/three/examples/jsm/lines/Line2.js';
import {LineMaterial} from '../node_modules/three/examples/jsm/lines/LineMaterial.js';
import {LineGeometry} from '../node_modules/three/examples/jsm/lines/LineGeometry.js';

let line, dashedLine, fatLine, lawnLine, glassLine;
const elementsToAddToScene = []

// lines
export function createDifferentLineTypes() {
    //standard line
    const material = new THREE.LineBasicMaterial({color: 0x000000});
    const points = [];
    points.push(new THREE.Vector3(-100, 81, 0));
    points.push(new THREE.Vector3(-70, 81, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, material);
    elementsToAddToScene.push(line);

    // dashed line
    const dashedMaterial = new THREE.LineDashedMaterial({
        color: 0x000000,
        linewidth: 1,
        dashSize: 3,
        gapSize: 1
    });
    const pointsDashed = [];
    pointsDashed.push(new THREE.Vector3(-100, 75, 0));
    pointsDashed.push(new THREE.Vector3(-70, 75, 0));

    const geometryDashed = new THREE.BufferGeometry().setFromPoints(pointsDashed);
    dashedLine = new THREE.Line(geometryDashed, dashedMaterial);
    dashedLine.computeLineDistances();
    elementsToAddToScene.push(dashedLine);

    // //fat line
    const fatGeometry = new LineGeometry();
    fatGeometry.setPositions([-100, 68, 0, -70, 68, 0]);
    // geometry.setColors( colors );

    const fatMatLine = new LineMaterial({
        color: 0x000000,
        linewidth: 0.01,
        vertexColors: false,
        dashed: false,
        alphaToCoverage: true,
    });

    fatLine = new Line2(fatGeometry, fatMatLine);
    fatLine.computeLineDistances();
    fatLine.scale.set(1, 1, 1);
    elementsToAddToScene.push(fatLine);


    //Lawn line
    const materialLawn = new THREE.LineBasicMaterial({color: 0x339433});
    const pointsLawn = [];
    pointsLawn.push(new THREE.Vector3(-100, 50, 0));
    pointsLawn.push(new THREE.Vector3(-70, 50, 0));
    pointsLawn.push(new THREE.Vector3(-62, 62, 0));
    pointsLawn.push(new THREE.Vector3(-62, 75, 0));
    pointsLawn.push(new THREE.Vector3(-40, 80, 0));
    pointsLawn.push(new THREE.Vector3(-30, 60, 0));

    const geometryLawn = new THREE.BufferGeometry().setFromPoints(pointsLawn);
    lawnLine = new THREE.Line(geometryLawn, materialLawn);
    elementsToAddToScene.push(lawnLine);

    // Grass
    const materialLawnGrass = new THREE.LineBasicMaterial({color: 0x00A300});
    const pointsLawnGrass = getLawnLinePoints(pointsLawn);
    const geometryLawnGrass = new THREE.BufferGeometry().setFromPoints(pointsLawnGrass);
    glassLine = new THREE.Line(geometryLawnGrass, materialLawnGrass);
    elementsToAddToScene.push(glassLine);

    //
    const loader = new THREE.TextureLoader();
    const texture = loader.load('/grass.png');
    const map =  loader.load('/grass_on_black.png');
    // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set( 10, 40 );
    const geometrymesh = new THREE.PlaneBufferGeometry(20, 20);
    const materialmesh = new THREE.MeshBasicMaterial({
        map: texture,
        alphaMap: map,
        color: "green",
        transparent: true,
        blending: 1
    });

    const mesh = new THREE.Mesh(geometrymesh, materialmesh);
    elementsToAddToScene.push(mesh);


    return {elementsToAddToScene}
}

function getLawnLinePoints(pointsLawnMainLine) {
    const lawnHeight = 1.5
    const lawnGaps = 1.3
    const newLawnPoints = []
    for (let i = 0; i < pointsLawnMainLine.length - 1; i++) {
        newLawnPoints.push(pointsLawnMainLine[i])
        const xDistance = Math.abs(pointsLawnMainLine[i + 1].x - pointsLawnMainLine[i].x)
        const yDistance = Math.abs(pointsLawnMainLine[i + 1].y - pointsLawnMainLine[i].y)
        const lineDirectionIsDown = (pointsLawnMainLine[i + 1].y - pointsLawnMainLine[i].y) < 0
        let distance, ratio
        distance = xDistance > yDistance ? xDistance : yDistance
        ratio = xDistance > yDistance ? yDistance / xDistance : xDistance / yDistance
        for (let j = 1; j <= distance; j += lawnGaps) {
            addTwoGrassPointsToLine(pointsLawnMainLine, j, xDistance, yDistance, lineDirectionIsDown, i, lawnHeight, ratio, newLawnPoints)
        }
        newLawnPoints.push(pointsLawnMainLine[i + 1])
    }
    return newLawnPoints
}

function addTwoGrassPointsToLine(pointsLawnMainLine, j, xDistance, yDistance, lineDirectionIsDown, i, lawnHeight, ratio, newLawnPoints) {
    const pointinBetween = getPointInBetweenByLen(pointsLawnMainLine[i], pointsLawnMainLine[i + 1], j)
    let xlawnHeight = lawnHeight
    let ylawnHeight = lawnHeight
    // if angle between 40-70 grades change grass height
    if (ratio > 0.4 && ratio < 0.7) {
        xlawnHeight = lawnHeight / 2
        ylawnHeight = lawnHeight * 1.2
    }
    if (xDistance > yDistance || lineDirectionIsDown) {
        newLawnPoints.push(new THREE.Vector3(pointinBetween.x + xlawnHeight, pointinBetween.y + ylawnHeight, 0))
        newLawnPoints.push(new THREE.Vector3(pointinBetween.x, pointinBetween.y + 0.2 * Math.random(), 0))
    } else {
        // x coordinate decreases
        newLawnPoints.push(new THREE.Vector3(pointinBetween.x - xlawnHeight, pointinBetween.y + ylawnHeight, 0))
        newLawnPoints.push(new THREE.Vector3(pointinBetween.x - 0.2, pointinBetween.y, 0))
    }
}

// get point coordinate between two vectors
function getPointInBetweenByLen(pointA, pointB, length) {
    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);
}

function removeAllLines() {

}
