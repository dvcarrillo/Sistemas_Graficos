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
        this.material = (parameters.texture === undefined ? new THREE.MeshBasicMaterial({ color: 0xff3333 }) : parameters.texture);
        this.speed = (parameters.speed === undefined ? 3 : parameters.speed);

        this.collider = null;
    }

    createObjectOn(position_x, position_z) {
        var geometry = new THREE.BoxGeometry(15, 15, 15);
        var torus = new THREE.Mesh(geometry, this.material);

        torus.castShadow = true;
        torus.autoUpdateMatrix = false;
        
        torus.applyMatrix(new THREE.Matrix4().makeTranslation(position_x, this.height / 2 + 1, position_z));
        //torus.rotation.x = Math.PI / 2;
        
        this.collider = new THREE.Box3().setFromObject(torus);

        this.add(torus);
        return torus;
    }

    moveObject() {
        this.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, this.speed));
    }

    getCollider() {
        this.collider = new THREE.Box3().setFromObject(this);
        return this.collider;
    }
}
