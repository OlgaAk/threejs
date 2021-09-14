import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"
import {PolygonFactory} from "./PolygonFactory"
import {createDifferentLineTypes} from "./Lines"


let selectedShapeTab, selectedShape;
let shapes = []
let shapeTabs

const points = [
    {x: -100,y: 81,z:0},
    {x: -80,y: 61,z:0},
    {x: -70,y: 41,z:0},
    {x: -70,y: 0,z:0},
    {x: -120,y: -10,z:0},
    {x: -150,y: 30,z:0},
    {x: -120,y: 70,z:0},
]

projectScene.initScene()
initMenu()
const polygonFactory = new PolygonFactory()

initEventListeners() //onclick add polygon vertices


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




