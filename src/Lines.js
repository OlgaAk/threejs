import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"
import {Line2} from '../node_modules/three/examples/jsm/lines/Line2.js';
import {LineMaterial} from '../node_modules/three/examples/jsm/lines/LineMaterial.js';
import {LineGeometry} from '../node_modules/three/examples/jsm/lines/LineGeometry.js';

let line, dashedLine, fatLine, lawnLine, glassLine;
const elementsToAddToScene = []

// lines
export function createDifferentLineTypes() {
    //Type1 standard line
    const material = new THREE.LineBasicMaterial({color: 0x000000});
    const points = [];
    points.push(new THREE.Vector3(-100, 81, 0));
    points.push(new THREE.Vector3(-70, 81, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, material);
    elementsToAddToScene.push(line);

    //Type2 dashed line
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

    //Type3 fat line
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


    //Type4 (1 Variant) Lawn line
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

    //Type4 (2 Variant) Lawn with Mesh and Texture
    const grassMesh = createGrassMesh()
    elementsToAddToScene.push(grassMesh);

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

function createGrassMesh() {

    const grassMeshGeometry = new THREE.BufferGeometry();

    grassMeshGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(600), 3));
    grassMeshGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(400), 2));
    grassMeshGeometry.setDrawRange(0, 0);

    const grassHeight = 3
    const startX = -100

    addVertextToGrassMesh(startX, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 2, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 3, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 4, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 5, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 6, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 7, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 8, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 9, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 10, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 11, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 12, 35, 0, grassHeight, grassMeshGeometry)
    addVertextToGrassMesh(startX + grassHeight * 13, 35, 0, grassHeight, grassMeshGeometry)

    grassMeshGeometry.setDrawRange(0, 100); //tofix drarange vs pointcount
    const grassTexture = new THREE.TextureLoader().load('/grass3.png');
    //const grassTextureAlphamap =  new THREE.TextureLoader().load('/grass_on_black.png');

    const grassMeshMaterial = new THREE.MeshBasicMaterial({
        map: grassTexture,
        // alphaMap: grassTextureAlphamap, //
        // color: "green",
        transparent: true,
       // blending: 1
    });

    const grassMesh = new THREE.Mesh(grassMeshGeometry, grassMeshMaterial);
    return grassMesh
}


function addVertextToGrassMesh(x, y, z, grassHeight, geometry) {
    addPositionsToGrassMesh(x, y, z, grassHeight, geometry)
    addUVsToGrassMesh(geometry)
    addIndexesToGrassMesh(geometry)
}

//adds three points forming a square, z coordinate stays the same, y coordinates are higer by the square side (grass height)
// example -100.0, 45.0, 0.0, // -95.0, 45.0, 0.0, // -95.0, 50.0, 0.0, // -100.0, 50.0, 0.0,
function addPositionsToGrassMesh(x, y, z, grassHeight, geometry) {
    let positions = geometry.attributes.position.array;
    let drawRange = geometry.drawRange.count
    if (drawRange === 0) { // first dot doesnt form grass
        positions[0] = x
        positions[1] = y
        positions[3] = z
        geometry.setDrawRange(0, 1);
        geometry.attributes.position.needsUpdate = true;
        return
    } else if (drawRange >= 1) {
        let previuosPoint
        if (drawRange === 1) {
            previuosPoint = {x: positions[0], y: positions[1], z: positions[3]}
            positions[3] = x
            positions[4] = y
            positions[5] = z
            let leftLowerCoordinate = getLeftLowerCoordinate(previuosPoint, x,y,z,grassHeight)
            let newRightUpperCoordinate = getNewRightUpperCoordinate(x, y, z, leftLowerCoordinate, grassHeight)
            let newLeftUpperCoordinate = getNewLeftUpperCoordinate(x, y, z, leftLowerCoordinate, grassHeight)

            positions[6] = newRightUpperCoordinate.x
            positions[7] = newRightUpperCoordinate.y
            positions[8] = newRightUpperCoordinate.z

            positions[9] = newLeftUpperCoordinate.x
            positions[10] = newLeftUpperCoordinate.y
            positions[11] = newLeftUpperCoordinate.z
            geometry.setDrawRange(0, 4);
        }
        if (drawRange > 1) {
            previuosPoint = {
                x: positions[(drawRange - 3) * 3],
                y: positions[(drawRange - 3) * 3 + 1],
                z: positions[(drawRange - 3) * 3 + 2]
            }
            let leftLowerCoordinate = getLeftLowerCoordinate(previuosPoint, x,y,z,grassHeight)
            let newRightUpperCoordinate = getNewRightUpperCoordinate(x, y, z, leftLowerCoordinate, grassHeight)
            let newLeftUpperCoordinate = getNewLeftUpperCoordinate(x, y, z, leftLowerCoordinate, grassHeight)
            if (previuosPoint.y != y) {
                console.log(x, y, previuosPoint)
                console.log(newLeftUpperCoordinate)
                console.log(newRightUpperCoordinate)
            }
            positions[drawRange * 3] = leftLowerCoordinate.x
            positions[drawRange * 3 + 1] = leftLowerCoordinate.y
            positions[drawRange * 3 + 2] = leftLowerCoordinate.z
            positions[drawRange * 3 + 3] = x
            positions[drawRange * 3 + 4] = y
            positions[drawRange * 3 + 5] = z
            positions[drawRange * 3 + 6] = newRightUpperCoordinate.x
            positions[drawRange * 3 + 7] = newRightUpperCoordinate.y
            positions[drawRange * 3 + 8] = newRightUpperCoordinate.z
            positions[drawRange * 3 + 9] = newLeftUpperCoordinate.x
            positions[drawRange * 3 + 10] = newLeftUpperCoordinate.y
            positions[drawRange * 3 + 11] = newLeftUpperCoordinate.z
            geometry.setDrawRange(0, drawRange + 4);
        }
    }
    geometry.attributes.position.needsUpdate = true;
}

function getLeftLowerCoordinate(previuosPoint, x,y,z, grassHeight) {
    let leftLowerCoordinate = previuosPoint
    if (previuosPoint.y != y) {
        const adjastedCoordinate = getCorrectLeftLowerCoordinateOfSquareGivenRightLowerCoordinate(previuosPoint, {x, y, z}, grassHeight)
        leftLowerCoordinate.x = adjastedCoordinate.x
        leftLowerCoordinate.y = adjastedCoordinate.y
    }
    console.log("previos vs new left lower")
    console.log(previuosPoint)
    console.log(leftLowerCoordinate)
    return leftLowerCoordinate
}

function getNewRightUpperCoordinate(x, y, z, previuosPoint, grassHeight) {
    let newRightUpperCoordinate = {x: x, y: y + grassHeight, z: z}
    if (previuosPoint.y != y) { // if not a horizontal line, adjast coordinates to get a square shape
        let diffX = x - previuosPoint.x
        let diffY = y - previuosPoint.y
        // z is assumed to be the same
        newRightUpperCoordinate.x = x - diffY
        newRightUpperCoordinate.y = y + diffX
    }
    return newRightUpperCoordinate
}

// to from a square given two coordinates we have to move same distanse but in opposite direction (ex ratio 4/2 => -2/-4)
function getNewLeftUpperCoordinate(x, y, z, previuosPoint, grassHeight) {
    let newLeftUpperCoordinate = {x: previuosPoint.x, y: previuosPoint.y + grassHeight, z: previuosPoint.z}
    if (previuosPoint.y != y) { // if not a horizontal line, adjast coordinates to get a square shape
        let diffX = x - previuosPoint.x
        let diffY = y - previuosPoint.y
        // z is assumed to be the same
        newLeftUpperCoordinate.x = previuosPoint.x - diffY
        newLeftUpperCoordinate.y = previuosPoint.y + diffX
    }
    return newLeftUpperCoordinate
}


//uvs are the same for all faces (  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0)
function addUVsToGrassMesh(geometry) {
    if (geometry.attributes.position.length >= 12) {
        let uvs = geometry.attributes.uv.array;
        let drawRange = geometry.drawRange.count
        uvs[(drawRange - 4) * 2] = 0
        uvs[(drawRange - 4) * 2 + 1] = 0
        uvs[(drawRange - 4) * 2 + 2] = 1
        uvs[(drawRange - 4) * 2 + 3] = 0
        uvs[(drawRange - 4) * 2 + 4] = 1
        uvs[(drawRange - 4) * 2 + 5] = 1
        uvs[(drawRange - 4) * 2 + 6] = 0
        uvs[(drawRange - 4) * 2 + 7] = 1
        geometry.attributes.uv.needsUpdate = true;
    }
}

// pattern is [0, 1, 2, 0, 2, 3]
function addIndexesToGrassMesh(geometry) {
    if (geometry.attributes.position.length > 0) {
        let positions = geometry.attributes.position;
        if (geometry.drawRange.count == 4) { // first triangle needs three vertices or 9 positions
            geometry.setIndex([0, 1, 2, 0, 2, 3]) // first index
            return
        }
        if (geometry.getIndex() && geometry.getIndex().count >= 6) { // if first triangle was already formed
            let drawRange = geometry.drawRange.count
            let newIndexes = Array.from(geometry.getIndex().array);
            newIndexes.push(drawRange - 4)
            newIndexes.push(drawRange - 3)
            newIndexes.push(drawRange - 2)
            newIndexes.push(drawRange - 4)
            newIndexes.push(drawRange - 2)
            newIndexes.push(drawRange - 1)
            geometry.setIndex(newIndexes)
        }
    }
}


function getSlopeFromTwoCoordinates(point1, point2) {
    return (point2.y - point1.y) / (point2.x - point1.x)
}

function getAngleFromSlope(slope) {
    return Math.atan(slope) * 180 / Math.PI;
}

function getOppositeGivenHypotenuseAndAngle(hypotenuse, angle) {
    return hypotenuse * Math.sin(angle / (180 / Math.PI))
}

function getHypotenuseFromSideCoordinates(point1, point2) {
    return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2))
}

function getHypotenuseFromSideSizes(size1, size2) {
    return Math.sqrt(Math.pow(size1, 2) + Math.pow(size2, 2))
}

function getLowerCoordinatesOfSquareInBetween(point1, point2, squareSide) {
    let leftCoordinate = point1;
    let rightCoordinate = point2;
    const slope = getSlopeFromTwoCoordinates(point1, point2)
    const angle = getAngleFromSlope(slope)
    const distanseBetweenTwoPoints = getHypotenuseFromSideCoordinates(point1, point2)
    const outerDistanceFromPoints = (squareSide - distanseBetweenTwoPoints) / 2
    const yShift = getOppositeGivenHypotenuseAndAngle(outerDistanceFromPoints, angle)
    const xShift = getOppositeGivenHypotenuseAndAngle(outerDistanceFromPoints, 90 - angle)
    if (slope <= 0) {
        leftCoordinate.y = point1.y + yShift
        rightCoordinate.y = point2.y - yShift
    } else {
        leftCoordinate.y = point1.y - yShift
        rightCoordinate.y = point2.y + yShift
    }
    leftCoordinate.x = point1.x - xShift
    rightCoordinate.x = point2.x + xShift
    return {leftCoordinate, rightCoordinate}
}

function getCorrectLeftLowerCoordinateOfSquareGivenRightLowerCoordinate(point1, point2, squareSide) {
    let coordinate = point1;
    const sideOfBiggerSquare = getHypotenuseFromSideSizes(squareSide, squareSide)
    const extraSize = sideOfBiggerSquare - squareSide
    const slope = getSlopeFromTwoCoordinates(point1, point2)
    const angle = getAngleFromSlope(slope)
    const yShift = getOppositeGivenHypotenuseAndAngle(extraSize, angle)
    const xShift = getOppositeGivenHypotenuseAndAngle(extraSize, 90 - angle)
    if (slope <= 0) {
        coordinate.y = point1.y - yShift
    } else {
        coordinate.y = point1.y + yShift
    }
    coordinate.x = point1.x + xShift
    return coordinate
}