import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"
import {PolygonFactory} from "./PolygonFactory"
import {createDifferentLineTypes} from "./Lines"


let selectedShapeTab, selectedShape;
let shapes = []
let shapeTabs

const DEFAULT_CAMERA_Z = 1
// test shape
let points = [
    {x: -100,y: 81,z:0},
    {x: -80,y: 71,z:0},
    {x: -60,y: 61,z:0},
    {x: -20,y: 41,z:0},
    {x: 0,y: 0,z:0},
    {x: -10,y: -10,z:0},
    {x: -60,y: -50,z:0},
    {x: -120,y: -10,z:0},
    {x: -150,y: 30,z:0},
    {x: -120,y: 70,z:0},
]


projectScene.initScene()
initMenu()
const polygonFactory = new PolygonFactory()

initEventListeners() //onclick add polygon vertices

changeScaleOfTestShapes(500)

function changeScaleOfTestShapes(scale=2){
    projectScene.camera.position.z = DEFAULT_CAMERA_Z*scale; // max value set in projectscene
    points = points.map(coords=>{
        return {x:coords.x*scale, y:coords.y*scale, z:coords.z}
    })
    points = addCoordinatesInBetween(points, scale)
}

function initMenu() {
    shapeTabs = document.querySelectorAll(".shape")
    shapeTabs.forEach(e => {
        e.addEventListener("click", selectTab)
    })
}

function selectTab(event) {
    changeTabColor(event)
    selectShape(event)
}

function changeTabColor() {
    if (selectedShapeTab != undefined) selectedShapeTab.style.backgroundColor = "lightgray"
    selectedShapeTab = event.target
    event.target.style.backgroundColor = "darkolivegreen"
}

function selectShape(event) {
    shapes.forEach(o=> projectScene.removeObjectFromScene(o))
    shapes = []
    switch (selectedShapeTab.id) {
        case "singleGeometryPolygon":
            selectedShape = polygonFactory.create("singleGeometry")
            projectScene.addObjectToScene(selectedShape)
            shapes.push(selectedShape)
            selectedShape.createTestShape(points)
            break
        case "multiGeometryPolygon":
            selectedShape = polygonFactory.create("multiGeometry")
            projectScene.addObjectToScene(selectedShape)
            shapes.push(selectedShape)
            selectedShape.createTestShape(points)
            break
        case "lines":
            selectedShape = createDifferentLineTypes()
            projectScene.addObjectToScene(selectedShape)
            shapes.push(selectedShape)
            selectedShape.createTestShape(points)
    }
}


function initEventListeners() {
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mouseup", mouseUp, false);
    document.querySelector("canvas").addEventListener('click', canvasClickClickHandler, false);
}


function canvasClickClickHandler(event){
    if(selectedShape==undefined) {
        alert("Please select a shape")
        return
    }
    selectedShape.onClickHandler(event)
}

function mouseDown(event){
    if(selectedShape==undefined) return
    selectedShape.mouseDown(event)
}

function mouseMove(event){
    if(selectedShape==undefined) return
    selectedShape.mouseMove(event)
}

function mouseUp(event){
    if(selectedShape==undefined) return
    selectedShape.mouseUp(event)
}


function addCoordinatesInBetween(coordinates, coordsMultiplyBy) {
    let extendedCoordinates = []
    for (let i = 0; i < coordinates.length; i++) {
        extendedCoordinates.push(coordinates[i])
        if (i + 1 < coordinates.length) {
            let xStep = (coordinates[i + 1].x - coordinates[i].x) / coordsMultiplyBy;
            let yStep = (coordinates[i + 1].y - coordinates[i].y) / coordsMultiplyBy;
            addCoordinates(coordinates, coordsMultiplyBy, xStep, yStep, extendedCoordinates, i)
        } else if (i + 1 === coordinates.length) {
            let xStep = (coordinates[0].x - coordinates[i].x) / coordsMultiplyBy;
            let yStep = (coordinates[0].y - coordinates[i].y) / coordsMultiplyBy;
            addCoordinates(coordinates, coordsMultiplyBy, xStep, yStep, extendedCoordinates, i)
        }
    }
    console.log(extendedCoordinates.length)
    return extendedCoordinates
}


function addCoordinates(coordinates, coordsMultiplyBy, xStep, yStep, extendedCoordinates, i) {
    for (let j = 1; j < coordsMultiplyBy; j++) {
        extendedCoordinates.push({
            x: coordinates[i].x + xStep * j,
            y: coordinates[i].y + yStep * j,
            z: coordinates[i].z
        })
    }
}



