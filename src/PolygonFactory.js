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

        const DEFAULT_COLOR = "rgb(255, 255, 255)"
        const SELECTION_COLOR = "rgb(255, 255, 0)"

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

        return new OneGeometryPolygon(geometry, area, particles, DEFAULT_COLOR, SELECTION_COLOR)
    }


    createPolygonWithMultiGeometry() {

        const DEFAULT_COLOR = "0xffffff"
        const SELECTION_COLOR = "0x12a120"

        const geometry = new THREE.BufferGeometry();
        const MAX_POINTS = 50;
        const positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({color: "grey"});
        const line = new THREE.Line(geometry, material);

        const areaMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            color: "green",
            alphaTest: 0.2,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const areaGeometry = geometry.clone()
        const area = new THREE.Mesh(areaGeometry, areaMaterial);

        return new MultiGeometryPolygon(area, line, DEFAULT_COLOR, SELECTION_COLOR)
    }
}