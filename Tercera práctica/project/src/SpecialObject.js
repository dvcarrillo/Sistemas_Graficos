/**
 * This class represents a special object dropped by a special brick
 * 
 * @author David Vargas, Andrés Molina
 * 
 * @param width - The width of the object
 * @param height - The height of the object
 * @param depth - The depth of the object
 * @param material - The material of the object
 * @param speed - Falling speed of the object
 * 
 * @param fieldHeight - Width of the game field
 */

class SpecialObject extends THREE.Object3D {

    constructor(parameters) {
        super();

        this.fieldHeight = (parameters.fieldHeight === undefined ? 400 : parameters.fieldHeight);

        this.width = (parameters.width === undefined ? this.fieldWidth / 10 : parameters.width);
        this.height = (parameters.height === undefined ? 10 : parameters.height);
        this.depth = (parameters.depth === undefined ? 10 : parameters.depth);
        this.material = (parameters.material === undefined ? new THREE.MeshPhongMaterial({ color: 0xffd700 }) : parameters.material);
        this.speed = (parameters.speed === undefined ? 5 : parameters.speed);

        this.collider = null;
        this.colliderView = null;
    }

    createObject() {
        var geometry = new THREE.TorusGeometry(10, 3, 16, 100);
        var torus = new THREE.Mesh(geometry, this.material);

        torus.castShadow = true;
        torus.autoUpdateMatrix = false;

        this.collider = new THREE.Box3().setFromObject(torus);
        this.colliderView = new THREE.Box3Helper(this.collider, 0xffff00);
       
        torus.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -(this.height / 2) - 10));
        torus.applyMatrix(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2));
        
        this.add(this.colliderView);
        this.add(torus);
        return torus;
    }

    moveObject() {
        this.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, speed));
    }
}
