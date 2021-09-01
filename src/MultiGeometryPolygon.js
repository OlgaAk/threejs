import * as THREE from '../node_modules/three/build/three.module.js';
import {projectScene} from "./ProjectScene"
import {BasePolygon} from "./BasePolygon"

export class MultiGeometryPolygon  extends BasePolygon {
    constructor(area, line, DEFAULT_COLOR, SELECTION_COLOR) {
        super()
        this.area = area;
        this.line = line;
        this.points = []
        this.pointCount = 0;
        this.POINT_SIZE = 2;
        this.selectedPoint = null;
        this.dragEvent = false // added to check if dragging has just happend
        this.elementsToAddToScene = [area, line]
        this.DEFAULT_COLOR = DEFAULT_COLOR
        this.SELECTION_COLOR = SELECTION_COLOR
    }

    onClickHandler(event) {
        event.preventDefault();
        if (!this.dragging) {
            let intersections = projectScene.getIntersections(event, this.points)
            if (intersections.length > 0) {
                this.selectPoint(intersections[0])
                return
            } else {
                if (this.dragEvent == true) this.dragEvent = false
                else this.addNewVertice()
            }
        }
    }

    addNewVertice() {
        let pos = projectScene.getMousePosition(event)
        this.addDot(pos.x, pos.y, pos.z)
        this.addVerticeToGeometries([this.line, this.area], this.pointCount, pos)
        projectScene.animate()
    }


    addDot(x, y, z) {
        const markerGeometry = new THREE.CircleGeometry(this.POINT_SIZE);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: "white",
            transparent: false,
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
        projectScene.scene.add(marker);
        this.points.push(marker)
        this.elementsToAddToScene.push(marker)
    }

    addVerticeToGeometries(arrayOfObjects, pointCount, pos) {
        arrayOfObjects.forEach(o => {
            super.addVerticeToGeometry(o.geometry, pointCount, pos)
            if (o.type === "Mesh") this.updateGeometryIndexes(o.geometry) // for area to update faces
        })
        this.pointCount += 3
    }


    updateGeometryIndexes(geometry) {
        if (this.pointCount == 6) { // on the third dot add first face
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
            geometry.setDrawRange(0, newIndexes.length)
        }
    }

    selectPoint(intersection) {
        this.unselectAllPoints()
        this.selectedPoint = intersection.object
        this.selectedPoint.material.color.setHex(this.SELECTION_COLOR)
        const index = this.points.indexOf(this.selectedPoint)
        projectScene.selectedPointInfoDiv.innerHTML = "Selected point: " + (index + 1)
        const btn = document.createElement("button")
        btn.textContent = "Delete"
        btn.addEventListener("click", (event) => this.deletePoint(this.selectedPoint))
        projectScene.selectedPointInfoDiv.appendChild(btn)
        projectScene.animate()
    }


    removeIndexFromGeometry(geometry) {
        if (geometry.getIndex() && geometry.getIndex().count >= 3) {
            let newIndexes = Array.from(geometry.getIndex().array);
            newIndexes.splice(newIndexes.length - 4, 3)
            geometry.setIndex(newIndexes)
        }
    }

    deletePoint(pointObject) {
        const index = this.points.indexOf(pointObject)
        this.pointCount -= 3
        this.removeVectorFromGeometries([this.line, this.area], index)
        this.removeObjectFromObjectsArray(pointObject, index)
        projectScene.animate()
    }

    removeVectorFromGeometries(arrayOfObjects, index){
        arrayOfObjects.forEach(o=>{
            this.removeVectorFromGeometry(o, index)
            if (o.type === "Mesh") this.removeIndexFromGeometry(o.geometry) // for area to update faces
        })
    }

    removeObjectFromObjectsArray(pointObject, index) {
        this.points.splice(index, 1)
        pointObject.geometry.dispose();
        pointObject.material.dispose();
        projectScene.scene.remove(pointObject);
        this.elementsToAddToScene.splice(this.elementsToAddToScene.indexOf(pointObject), 1)
    }

    removeVectorFromGeometry(object, index) {
        const positions = object.geometry.attributes.position.array;
        for (let i = index * 3; i < (this.points.length - 1) * 3; i++) {
            positions[i] = positions[i + 3]
        }
        positions[this.points.length * 3 - 1] = 0
        positions[this.points.length * 3 - 2] = 0
        positions[this.points.length * 3 - 3] = 0
        object.geometry.setDrawRange(0, this.getActualDrawRange(object))
        object.geometry.attributes.position.needsUpdate = true
    }

    getActualDrawRange(object){
       let drawRange = this.pointCount / 3
        // Mesh has faces of triangles defined by indexes, drawrange is bigger
        if (object.type === "Mesh" && object.geometry.getIndex().array.length > 0) {
            drawRange = object.geometry.getIndex().array.length
        }
        return drawRange
    }


    unselectAllPoints() {
        this.selectedPoint = null;
        this.points.forEach(o => {
            o.material.color.setHex((this.DEFAULT_COLOR))
        })
    }

    mouseDown(event) {
        let intersections = projectScene.getIntersections(event, this.points)
        if (intersections.length > 0) {
            //this.unselectAllPoints()
            this.selectedPoint = intersections[0]
            this.selectPoint(intersections[0])
            this.dragging = true;
            this.dragEvent = true
        }
    }

    mouseMove(event) {
        if (this.dragging && this.selectedPoint !== null) {
            let pos = projectScene.getMousePosition(event)
            this.selectedPoint.position.x = pos.x
            this.selectedPoint.position.y = pos.y
            this.selectedPoint.position.z = pos.z
            this.modifyGeometriesCoordinates([this.line, this.area], this.selectedPoint)
            projectScene.animate()
        }
    }

    modifyVectorCoordinates(geometry, object, drawRange) {
        const index = this.points.indexOf(object)
        if (index != -1) {
            const positions = geometry.attributes.position.array;
            positions[index * 3] = object.position.x;
            positions[index * 3 + 1] = object.position.y;
            positions[index * 3 + 2] = object.position.z;
            geometry.setDrawRange(0, drawRange);
            geometry.attributes.position.needsUpdate = true;
        }
    }

    modifyGeometriesCoordinates(arrayOfObjects, object) {
        arrayOfObjects.forEach(o => {
            this.modifyVectorCoordinates(o.geometry, object, this.getActualDrawRange(o))
        })
    }

}