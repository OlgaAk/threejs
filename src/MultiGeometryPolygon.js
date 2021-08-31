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
        this.selectedPoint = null;
        this.dragEvent = false
        // this.selectedPointIndex = null;
        this.dragging = false
        this.elementsToAddToScene = [area, line]
        // this.DEFAULT_COLOR = "rgb(255, 255, 255)"
        // this.SELECTION_COLOR = "rgb(18,161,32)"
    }

    modifyVectorCoordinates(geometry, object) {
        const index = this.objects.indexOf(object)
        if (index != -1) {
            const positions = geometry.attributes.position.array;
            positions[index * 3] = object.position.x;
            positions[index * 3 + 1] = object.position.y;
            positions[index * 3 + 2] = object.position.z;
            geometry.setDrawRange(0, this.pointCount / 3);
            geometry.attributes.position.needsUpdate = true;
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
        this.elementsToAddToScene.push(marker)
        marker.userData.indexInLine = index;
    }

    onClickHandler(event) {
        event.preventDefault();

        if (!this.dragging) {
            let intersections = projectScene.getIntersections(event, this.objects)
            if (intersections.length > 0) {
                this.selectPoint(intersections[0])
                return
            } else {

                if (this.dragEvent == true) {
                    this.dragEvent = false
                    return
                }
                console.log(intersections)
                console.log(this.selectedPoint)
                let pos = projectScene.getMousePosition(event)
                this.addVerticeToGeometry(this.geometry, this.pointCount, pos)
                // this.updateGeometryIndexes(this.geometry)
                projectScene.animate()
            }
        }
    }

    addVerticeToGeometry(geometry, index, newCoordinates) {
        const positions = geometry.attributes.position.array;
        positions[this.pointCount++] = newCoordinates.x;
        positions[this.pointCount++] = newCoordinates.y;
        positions[this.pointCount++] = newCoordinates.z;
        this.addDot(newCoordinates.x, newCoordinates.y, newCoordinates.z, this.pointCount)
        geometry.setDrawRange(0, this.pointCount / 3)
        geometry.attributes.position.needsUpdate = true;
    }

    updateGeometryIndexes(geometry) {
        let positions = geometry.attributes.position.array;
        if (positions.length == 9) {
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
            console.log(geometry.getIndex())
        }
    }

    selectPoint(intersection) {
        this.unselectAllPoints()
        this.selectedPoint = intersection.object
        this.selectedPoint.material.color.setHex(0xffff00)
        const index = this.objects.indexOf(this.selectedPoint)
        projectScene.selectedPointInfoDiv.innerHTML = "Selected point: " + (index + 1)
        const btn = document.createElement("button")
        btn.textContent = "Delete"
        btn.addEventListener("click", (event) => this.deletePoint(this.selectedPoint))
        projectScene.selectedPointInfoDiv.appendChild(btn)
        projectScene.animate()
    }


    removeIndexFromGeometry(geometry) {
        if (geometry.getIndex().count >= 3) {
            let newIndexes = Array.from(geometry.getIndex().array);
            newIndexes.splice(newIndexes.length - 4, 3)
            geometry.setIndex(newIndexes)
        }
    }

    deletePoint(pointObject) {
        const index = this.objects.indexOf(pointObject)
        const positions = this.geometry.attributes.position.array;
        this.removeVectorFromGeometry(positions, index)
        this.pointCount -= 3
        this.removeObjectFromObjectsArray(pointObject, index)
        this.geometry.setDrawRange(0, this.pointCount / 3)
        this.geometry.attributes.position.needsUpdate = true
        projectScene.animate()
    }

    removeObjectFromObjectsArray(pointObject, index) {
        this.objects.splice(index, 1)
        pointObject.geometry.dispose();
        pointObject.material.dispose();
        projectScene.scene.remove(pointObject);
        this.elementsToAddToScene.splice(this.elementsToAddToScene.indexOf(pointObject), 1)
    }

    removeVectorFromGeometry(positions, index) {
        for (let i = index * 3; i < (this.objects.length - 1) * 3; i++) {
            positions[i] = positions[i + 3]
        }
        positions[this.objects.length * 3 - 1] = 0
        positions[this.objects.length * 3 - 2] = 0
        positions[this.objects.length * 3 - 3] = 0
    }


    unselectAllPoints() {
        this.selectedPoint = null;
        this.objects.forEach(o => {
            o.material.color.setHex(0xffffff)
        })
    }

    mouseDown(event) {
        let intersections = projectScene.getIntersections(event, this.objects)
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
            console.log("dragging")
            let pos = projectScene.getMousePosition(event)
            this.selectedPoint.position.x = pos.x
            this.selectedPoint.position.y = pos.y
            this.selectedPoint.position.z = pos.z
            this.modifyVectorCoordinates(this.geometry, this.selectedPoint)
            this.geometry.attributes.position.needsUpdate = true;
            projectScene.animate()
        }
    }

    mouseUp(event) {
        this.dragging = false;
    }
}