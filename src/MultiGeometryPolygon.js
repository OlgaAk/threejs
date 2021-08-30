import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"


export class MultiGeometryPolygon {
    constructor(geometry, area, line) {
        this.geometry = geometry;
        this.area = area;
        this.line = line;
       // this.points = []
        this.objects = [] // objects or points?
        this.pointCount = 0;
        this.POINT_SIZE = 4;
        // this.selectedPointIndex = null;
        this.dragging = false
        this.elementsToAddToScene = [area, line]
        // this.DEFAULT_COLOR = "rgb(255, 255, 255)"
        // this.SELECTION_COLOR = "rgb(18,161,32)"
    }

// Updates coordinates of a point in the Line Object
    modifyVectorCoordinates(line, object) {
        const index = this.objects.indexOf(object)
        if (index != -1) {
            const positions = this.geometry.attributes.position.array;
            positions[index * 3] = object.position.x;
            positions[index * 3 + 1] = object.position.y;
            positions[index * 3 + 2] = object.position.z;
            this.geometry.setDrawRange(0, pointCount / 3);
            this.geometry.attributes.position.needsUpdate = true;
        }
    }

    addDot(x, y, z, index) {
        const markerGeometry = new THREE.CircleGeometry(this.POINT_SIZE, 32);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: "white",
            transparent: false,
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
        projectScene.scene.add(marker);
        this.objects.push(marker)
        marker.userData.indexInLine = index;
    }


    onClickHandler(event) {
        if (!this.dragging) { // prevent from creating new points if drag event started
            event.preventDefault();
            let pos = projectScene.getMousePosition(event)
            const positions = this.geometry.attributes.position.array;
            positions[this.pointCount++] = pos.x;
            positions[this.pointCount++] = pos.y;
            positions[this.pointCount++] = pos.z;
            this.addDot(pos.x, pos.y, pos.z, this.pointCount)
            this.geometry.setDrawRange(0, this.pointCount / 3)
            this.geometry.attributes.position.needsUpdate = true;
            projectScene.animate()
        } else {
            this.dragging = false
            projectScene.animate()
        }
    }

    mouseMove(event) {
        this.modifyVectorCoordinates(this.line, event.object);
    }

    mouseDown(event) {
        this.dragging = true
    }

    mouseUp() {
        this.dragging = false
    }


}