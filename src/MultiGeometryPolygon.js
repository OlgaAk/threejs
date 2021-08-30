import * as THREE from '../node_modules/three/build/three.module.js';
import {ProjectScene} from "./ProjectScene"


export class MultiGeometryPolygon {
    constructor(geometry, area, line) {
        this.geometry = geometry;
        this.area = area;
        this.line = line;
        this.points = []
        this.pointCount = 0;
        this.selectedPointIndex = null;
        this.dragging = false
        this.elementsToAddToScene = [area, particles]
        this.DEFAULT_COLOR = "rgb(255, 255, 255)"
        this.SELECTION_COLOR = "rgb(18,161,32)"
    }
    //
    // onClickHandler(event) {
    //     event.preventDefault();
    //     let intersections = projectScene.getIntersections(event, this.particles)
    //     if (!this.dragging) {
    //         if (intersections.length > 0) {
    //             if (this.selectedPointIndex != null) {
    //                 this.unselectPoint(this.selectedPointIndex, this.geometry)
    //             }
    //             if (this.selectedPointIndex != intersections[0].index) {
    //                 this.selectedPointIndex = intersections[0].index
    //                 this.selectPoint()
    //             }
    //         } else {
    //             let pos = projectScene.getMousePosition(event)
    //             this.addVerticeToGeometry(this.pointCount, pos)
    //             this.updateGeometryIndexes()
    //             this.pointCount += 3
    //             projectScene.animate()
    //         }
    //     }
    // }
    //
    // addVerticeToGeometry(index, newCoordinates) {
    //     this.addNewPositionsToGeometry(index, newCoordinates)
    //     this.addNewColorsToGeometry(index, newCoordinates)
    // }
    //
    // addNewPositionsToGeometry(index, newCoordinates) {
    //     const positions = this.geometry.attributes.position.array;
    //     if (positions.length > 0) {
    //         // creates a new array from existing, because arrray size can`t be changed
    //         let newpositions = Array.from(positions);
    //         newpositions[index] = newCoordinates.x;
    //         newpositions[index + 1] = newCoordinates.y;
    //         newpositions[index + 2] = newCoordinates.z;
    //         this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
    //     } else {
    //         this.geometry.setAttribute("position", new THREE.Float32BufferAttribute([newCoordinates.x, newCoordinates.y, newCoordinates.z], 3))
    //     }
    //     this.geometry.computeBoundingSphere() // needed for intersection detection
    // }
    //
    // addNewColorsToGeometry(index, newCoordinates) {
    //     const colors = this.geometry.attributes.color.array;
    //     const color = new THREE.Color(this.DEFAULT_COLOR)
    //     if (colors.length > 0) {
    //         // creates a new array from existing, because arrray size can`t be changed
    //         let newColors = Array.from(colors);
    //         newColors[index] = color.r
    //         newColors[index + 1] = color.g
    //         newColors[index + 2] = color.b
    //         this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(newColors, 3))
    //     } else {
//             this.geometry.setAttribute("color", new THREE.Float32BufferAttribute([color.r, color.g, color.b], 3))
//         }
//     }
//
// // updates positions without creating a new copy of array, bacause array size stays the same
//     updateVerticePositions(geometry, index, newCoordinates) {
//         const positions = geometry.attributes.position.array;
//         positions[index++] = newCoordinates.x;
//         positions[index++] = newCoordinates.y;
//         positions[index] = newCoordinates.z;
//     }
//
// // indexes are used to form faces (triangles), example [1,2,0] -> [1,2,0,2,3,0] -> [1,2,0,2,3,0,3,4,0]
//     updateGeometryIndexes() {
//         let positions = this.geometry.attributes.position.array;
//         if (positions.length == 9) { // first triangle needs three vertices or 9 positions
//             this.geometry.setIndex([1, 2, 0]) // first index
//             return
//         }
//         if (this.geometry.getIndex() && this.geometry.getIndex().count >= 3) { // if first triangle was already formed
//             let newIndexes = Array.from(this.geometry.getIndex().array);
//             let lastElement = newIndexes[newIndexes.length - 2]
//             newIndexes.push(lastElement)
//             newIndexes.push(lastElement + 1)
//             newIndexes.push(0)
//             this.geometry.setIndex(newIndexes)
//         }
//     }
//
//     changePointColor(index, color, colorsArray) {
//         colorsArray[index] = color.r
//         colorsArray[index + 1] = color.g
//         colorsArray[index + 2] = color.b
//         this.geometry.attributes.color.needsUpdate = true;
//         projectScene.animate()
//     }
//
//     unselectPoint() {
//         if (this.selectedPointIndex == null) return
//         const colors = this.geometry.attributes.color.array;
//         const defaultColor = new THREE.Color(this.DEFAULT_COLOR);
//         this.changePointColor(this.selectedPointIndex * 3, defaultColor, colors)
//         this.selectedPointIndex = null
//         projectScene.selectedPointInfoDiv.innerHTML = projectScene.SELECTION_TEXT
//     }
//
//     selectPoint() {
//         const colors = this.geometry.attributes.color.array;
//         const colorOfSelection = new THREE.Color(this.SELECTION_COLOR);
//         this.changePointColor(this.selectedPointIndex * 3, colorOfSelection, colors)
//         this.addSelectedPointInfoText(this.selectedPointIndex)
//     }
//
//     addSelectedPointInfoText(index) {
//         projectScene.selectedPointInfoDiv.innerHTML = projectScene.SELECTION_TEXT + index
//         const btn = document.createElement("button")
//         btn.textContent = "Delete"
//         btn.addEventListener("click", (event) => this.deletePoint(this.selectedPointIndex))
//         projectScene.selectedPointInfoDiv.appendChild(btn)
//     }
//
//     deletePoint(index) {
//         const positions = this.geometry.attributes.position.array;
//         this.removeVectorFromGeometry(index)
//         this.pointCount -= 3
//         this.removeIndexFromGeometry()
//         projectScene.animate()
//         projectScene.selectedPointInfoDiv.innerHTML = projectScene.SELECTION_TEXT
//     }
//
//     removeIndexFromGeometry() {
//         if (this.geometry.getIndex().count >= 3) {
//             let newIndexes = Array.from(this.geometry.getIndex().array);
//             newIndexes.splice(newIndexes.length - 3, 3)
//             this.geometry.setIndex(newIndexes)
//         }
//     }
//
//     removeVectorFromGeometry(index) {
//         let newpositions = Array.from(this.geometry.attributes.position.array);
//         let newcolors = Array.from(this.geometry.attributes.color.array);
//         // shift elements after the one to be removed left
//         newpositions = this.shiftElementsInAttributeArrayLeft(index, newpositions)
//         newcolors = this.shiftElementsInAttributeArrayLeft(index, newcolors)
//         this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(newpositions, 3))
//         this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(newcolors, 3))
//     }
//
//     shiftElementsInAttributeArrayLeft(index, elements) {
//         for (let i = index * 3; i < (elements.length / 3 - 1) * 3; i++) {
//             elements[i] = elements[i + 3]
//         }
//         // delete the tail of the array with 3 elements
//         elements.splice(elements.length - 3, 3)
//         return elements
//     }
//
//     mouseDown(event) {
//         let intersections = projectScene.getIntersections(event, this.particles)
//         if (intersections.length > 0) {
//             if (intersections[0].index != this.selectedPointIndex) {
//                 this.unselectPoint()
//                 this.selectedPointIndex = intersections[0].index
//                 this.selectPoint()
//             }
//             this.dragging = true;
//         }
//     }
//
//     mouseMove(event) {
//         if (this.dragging && this.selectedPointIndex !== null) {
//             let pos = projectScene.getMousePosition(event)
//             this.updateVerticePositions(this.geometry, this.selectedPointIndex * 3, pos)
//             this.geometry.attributes.position.needsUpdate = true;
//         }
//     }
//
//     mouseUp(event) {
//         this.dragging = false;
//     }

        }