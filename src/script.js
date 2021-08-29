import * as THREE from '../node_modules/three/build/three.module.js';
import {init, scene, mouse, raycaster, camera, renderer} from "./main"
import {PolygonFactory} from "./polygon"

init()
const polygonFactory = new PolygonFactory()
const polygon  = polygonFactory.create("singleGeometry")
polygon.addToScene()
polygon.init()






