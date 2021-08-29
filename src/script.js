import * as THREE from '../node_modules/three/build/three.module.js';
import {initScene, scene, mouse, raycaster, camera, renderer} from "./ProjectScene"
import {PolygonFactory} from "./PolygonFactory"


let selectedPointInfoDiv, selectedShapeTab, selectedShape;
let shapeTabs

init()
initMenu()

const polygonFactory = new PolygonFactory()
const polygon = polygonFactory.create("singleGeometry")
polygon.addToScene()
polygon.init()


function initMenu() {
    shapeTabs = document.querySelectorAll(".shape")
    shapeTabs.forEach(e => {
        e.addEventListener("click", selectTab)
    })
}

function selectTab(event) {
    changeTabColor(event)
    selectedShape = getSelectedShape(event)
}

function changeTabColor() {
    if (selectedShapeTab != undefined) selectedShapeTab.style.backgroundColor = "lightgray"
    selectedShapeTab = event.target
    event.target.style.backgroundColor = "darkolivegreen"
}

function getSelectedShape(event){

}

