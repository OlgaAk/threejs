import * as THREE from '../node_modules/three/build/three.module.js';
import {init, scene, mouse, raycaster, camera, renderer, animate, selectedPointInfoDiv} from "./ProjectScene"


export class OneGeometryPolygon {
    constructor(geometry, area, particles) {
        this.geometry = geometry;
        this.area = area;
        this.particles = particles;
        this.pointCount = 0;
        this.selectedPointIndex = null;
        this.dragging = false
        this.objectsToAddToScene = [area, particles]
        this.DEFAULT_COLOR = "rgb(255, 255, 255)"
        this.SELECTION_COLOR = "rgb(255, 255, 0)"
        this.SELECTION_TEXT = "Selected point: ";
    }


    addToScene() {
        this.objectsToAddToScene.forEach(o => scene.add(o))
    }

    removeFromScene() {
        this.geometry.dispose()
        this.objectsToAddToScene.forEach(o => {
            o.matreial.dispose()
            o.dispose()
        })
    }

    init() {
        this.initEventListeners()
    }

    initEventListeners() {
        window.addEventListener("mousedown", this.mouseDown.bind(this), false);
        window.addEventListener("mousemove", this.mouseMove.bind(this), false);
        window.addEventListener("mouseup", this.mouseUp.bind(this), false);
        document.querySelector("canvas").addEventListener('click', this.onClickHandler.bind(this), false);
    }

    onClickHandler(event) {
        event.preventDefault();
        let intersections = this.getIntersections(event)
        if (intersections.length > 0) {
            // this code already called by mouseDown
            //     if (intersections[0].index == this.selectedPointIndex) return
            //     this.unselectPoint(this.selectedPointIndex, this.geometry)
            //     this.selectedPointIndex =intersections[0].index
            //     this.selectPoint()
            return
        }
        if (!this.dragging) { // prevent from creating new points if drag event started
            let pos = this.getMousePosition(event)
            this.addVerticeToGeometry(this.pointCount, pos)
            this.updateGeometryIndexes()
            this.pointCount += 3
            animate()
        }
    }

    addVerticeToGeometry(index, newCoordinates) {
        this.addNewPositionsToGeometry(index, newCoordinates)
        this.addNewColorsToGeometry(index, newCoordinates)
    }

    addNewPositionsToGeometry(index, newCoordinates) {
        const positions = this.geometry.attributes.position.array;
        if (positions.length > 0) {
            // creates a new array from existing, because arrray size can`t be changed
            let newpositions = Array.from(positions);
            newpositions[index] = newCoordinates.x;
            newpositions[index + 1] = newCoordinates.y;
            newpositions[index + 2] = newCoordinates.z;
            this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
        } else {
            this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([newCoordinates.x, newCoordinates.y, newCoordinates.z], 3))
        }
        this.geometry.computeBoundingSphere() // needed for intersection detection
    }

    addNewColorsToGeometry(index, newCoordinates) {
        const colors = this.geometry.attributes.color.array;
        const color = new THREE.Color(this.DEFAULT_COLOR)
        if (colors.length > 0) {
            // creates a new array from existing, because arrray size can`t be changed
            let newColors = Array.from(colors);
            newColors[index] = color.r
            newColors[index + 1] = color.g
            newColors[index + 2] = color.b
            this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(newColors, 3))
        } else {
            this.geometry.setAttribute("color", new THREE.Float32BufferAttribute([color.r, color.g, color.b], 3))
        }
    }

// updates positions without creating a new copy of array, bacause array size stays the same
    updateVerticePositions(geometry, index, newCoordinates) {
        const positions = geometry.attributes.position.array;
        positions[index++] = newCoordinates.x;
        positions[index++] = newCoordinates.y;
        positions[index] = newCoordinates.z;
    }

// indexes are used to form faces (triangles), example [1,2,0] -> [1,2,0,2,3,0] -> [1,2,0,2,3,0,3,4,0]
    updateGeometryIndexes() {
        let positions = this.geometry.attributes.position.array;
        if (positions.length == 9) { // first triangle needs three vertices or 9 positions
            this.geometry.setIndex([1, 2, 0]) // first index
            return
        }
        if (this.geometry.getIndex() && this.geometry.getIndex().count >= 3) { // if first triangle was already formed
            let newIndexes = Array.from(this.geometry.getIndex().array);
            let lastElement = newIndexes[newIndexes.length - 2]
            newIndexes.push(lastElement)
            newIndexes.push(lastElement + 1)
            newIndexes.push(0)
            this.geometry.setIndex(newIndexes)
        }
    }

    changePointColor(index, color, colorsArray) {
        colorsArray[index] = color.r
        colorsArray[index + 1] = color.g
        colorsArray[index + 2] = color.b
        this.geometry.attributes.color.needsUpdate = true;
    }

    unselectPoint() {
        const colors = this.geometry.attributes.color.array;
        const defaultColor = new THREE.Color(this.DEFAULT_COLOR);
        this.changePointColor(this.selectedPointIndex * 3, defaultColor, colors)
        this.selectedPointIndex = null
        selectedPointInfoDiv.innerHTML = this.SELECTION_TEXT
    }

    selectPoint() {
        const colors = this.geometry.attributes.color.array;
        const colorOfSelection = new THREE.Color(this.SELECTION_COLOR);
        this.changePointColor(this.selectedPointIndex * 3, colorOfSelection, colors)
        this.addSelectedPointInfoText(this.selectedPointIndex)
    }

    addSelectedPointInfoText(index) {
        selectedPointInfoDiv.innerHTML = this.SELECTION_TEXT + index
        const btn = document.createElement("button")
        btn.textContent = "Delete"
        btn.addEventListener("click", (event) => this.deletePoint(this.selectedPointIndex))
        selectedPointInfoDiv.appendChild(btn)
    }

    deletePoint(index) {
        const positions = this.geometry.attributes.position.array;
        this.removeVectorFromGeometry(index)
        this.pointCount -= 3
        this.removeIndexFromGeometry()
        animate()
        selectedPointInfoDiv.innerHTML = this.SELECTION_TEXT
    }

    removeIndexFromGeometry() {
        if (this.geometry.getIndex().count >= 3) {
            let newIndexes = Array.from(this.geometry.getIndex().array);
            newIndexes.splice(newIndexes.length - 3, 3)
            this.geometry.setIndex(newIndexes)
        }
    }

    removeVectorFromGeometry(index) {
        let newpositions = Array.from(this.geometry.attributes.position.array);
        let newcolors = Array.from(this.geometry.attributes.color.array);
        // shift elements after the one to be removed left
        newpositions = this.shiftElementsInAttributeArrayLeft(index, newpositions)
        newcolors = this.shiftElementsInAttributeArrayLeft(index, newcolors)
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
        this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(newcolors, 3))
    }

    shiftElementsInAttributeArrayLeft(index, elements) {
        for (let i = index * 3; i < (elements.length / 3 - 1) * 3; i++) {
            elements[i] = elements[i + 3]
        }
        // delete the tail of the array with 3 elements
        elements.splice(elements.length - 3, 3)
        return elements
    }

    mouseDown(event) {
        let intersections = this.getIntersections(event)
        if (intersections.length > 0) {
            if (intersections[0].index == this.selectedPointIndex) {
                this.unselectPoint()
            } else {
                this.unselectPoint()
                this.selectedPointIndex = intersections[0].index
                this.selectPoint()
            }
            this.dragging = true;
        }

    }

    mouseMove(event) {
        if (this.dragging && this.selectedPointIndex !== null) {
            let pos = this.getMousePosition(event)
            this.updateVerticePositions(this.geometry, this.selectedPointIndex * 3, pos)
            this.geometry.attributes.position.needsUpdate = true;
        }
    }

    mouseUp(event) {
        this.dragging = false;
    }

    getMousePosition(event) {
        const vec = new THREE.Vector3();
        const pos = new THREE.Vector3();
        vec.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5);
        vec.unproject(camera);
        vec.sub(camera.position).normalize();
        const distance = -camera.position.z / vec.z;
        pos.copy(camera.position).add(vec.multiplyScalar(distance));
        return pos
    }

    getIntersections(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        return raycaster.intersectObject(this.particles, true);
    }
}










