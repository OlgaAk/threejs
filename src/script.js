import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"
import {PolygonFactory} from "./PolygonFactory"


let selectedShapeTab, selectedShape;
let shapes = []
let shapeTabs

projectScene.initScene()

initMenu()

const polygonFactory = new PolygonFactory()

initEventListeners()

// polygon.init()


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
    switch (selectedShapeTab.id) {
        case "singleGeometryPolygon":
            selectedShape = polygonFactory.create("singleGeometry")
            projectScene.addObjectToScene(selectedShape)
            break
        case "multiGeometryPolygon":
            selectedShape = polygonFactory.create("multiGeometry")
            projectScene.addObjectToScene(selectedShape)
            break
    }
}


function initEventListeners() {
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mouseup", mouseUp, false);
    document.querySelector("canvas").addEventListener('click', canvasClickClickHandler, false);
}


function canvasClickClickHandler(event){
    if(selectedShape==undefined) return
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