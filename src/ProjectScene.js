import * as THREE from '../node_modules/three/build/three.module.js';

class ProjectScene{
    constructor() {
        this.selectedPointInfoDiv = document.getElementById("selected-point-info")

        this.renderer = new THREE.WebGLRenderer();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

        this.SELECTION_TEXT = "Selected point: ";
    }

    initScene() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.camera.position.z = 250;
        window.addEventListener('resize', this.onWindowResize);
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getMousePosition(event) {
        const vec = new THREE.Vector3();
        const pos = new THREE.Vector3();
        vec.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5);
        vec.unproject(this.camera);
        vec.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / vec.z;
        pos.copy(this.camera.position).add(vec.multiplyScalar(distance));
        return pos
    }

    getIntersections(event, object) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        return this.raycaster.intersectObject(object, true);
    }

    addObjectToScene(object) {
        object.elementsToAddToScene.forEach(o => this.scene.add(o))
    }

    removeObjectFromScene(object) {
        object.geometry.dispose()
        object.elementsToAddToScene.forEach(o => {
            o.matreial.dispose()
            o.dispose()
        })
    }

}

export const projectScene = new ProjectScene()





