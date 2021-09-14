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

    addCoordinatesInBetween(coordinates, coordsMultiplyBy) {
        console.log(coordinates)
        let extendedCoordinates = []
        for (let i = 0; i < coordinates.length; i ++) {
            extendedCoordinates.push(coordinates[i])
            if (i + 1 < coordinates.length) {
                let xStep = (coordinates[i + 1].x - coordinates[i].x) / coordsMultiplyBy;
                let yStep = (coordinates[i + 1].y - coordinates[i].y) / coordsMultiplyBy;
                for (let j = 1; j < coordsMultiplyBy; j++) {
                    extendedCoordinates.push({
                        x: coordinates[i].x + xStep * j,
                        y: coordinates[i].y + yStep * j,
                        z: coordinates[i].z
                    })
                }
            }
        }
        console.log(extendedCoordinates)
        return extendedCoordinates
    }
}