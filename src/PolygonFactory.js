import * as THREE from '../node_modules/three/build/three.module.js';
import {OneGeometryPolygon} from "./OneGeometryPolygon"
import {MultiGeometryPolygon} from "./MultiGeometryPolygon"

export class PolygonFactory {
    create(polygonType) {
        if (polygonType === "singleGeometry") {
            console.log("creating singleGeometry polygon")
            return this.createPolygonWithSingleGeometry()
        } else if (polygonType === "multiGeometry") {
            return this.createPolygonWithMultiGeometry()
        }
    }

    createPolygonWithSingleGeometry() {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(), 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(), 3));

        // area
        const areaMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            color: "green",
            alphaTest: 0.2,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const area = new THREE.Mesh(geometry, areaMaterial);

        // points
        const sprite = new THREE.TextureLoader().load('/circle.png');
        const markerMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 14,
            map: sprite,
            //blending: THREE.AdditiveBlending,
            transparent: true, depthTest: false
        })
        const particles = new THREE.Points(geometry, markerMaterial);
        geometry.attributes.position.needsUpdate = true;

        return new OneGeometryPolygon(geometry, area, particles)
    }


    createPolygonWithMultiGeometry() {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(), 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(), 3));

        // area
        const areaMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            color: "red",
            alphaTest: 0.2,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const area = new THREE.Mesh(geometry, areaMaterial);

        // points
        const sprite = new THREE.TextureLoader().load('/disc.png');
        const markerMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 12,
            map: sprite,
            //blending: THREE.AdditiveBlending,
            transparent: true, depthTest: false
        })
        const particles = new THREE.Points(geometry, markerMaterial);
        geometry.attributes.position.needsUpdate = true;

        return new MultiGeometryPolygon(geometry, area, particles)
    }
}