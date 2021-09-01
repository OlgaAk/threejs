export class BasePolygon {
    constructor() {
        this.dragging = false;
    }

    addVerticeToGeometry(geometry, pointCount, newCoordinates) {
        const positions = geometry.attributes.position.array;
        positions[pointCount] = newCoordinates.x;
        positions[pointCount + 1] = newCoordinates.y;
        positions[pointCount + 2] = newCoordinates.z;
        geometry.setDrawRange(0, (pointCount + 3) / 3)
        geometry.attributes.position.needsUpdate = true;
    }

    mouseUp(event) {
        this.dragging = false;
    }
}