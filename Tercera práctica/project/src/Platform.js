/**
 * The platform that the player can move in order to catch the ball
 * 
 * @author David Vargas, Andrés Molina
 * 
 * @param width - The width of the platform
 * @param height - The height of the platform
 * @param depth - The depth of the platform
 * @param material - The material of the platform
 * 
 * @param fieldWidth - The width of the Game Field
 */

class Platform extends THREE.Object3D {

    constructor(parameters) {
        super();

        this.width = (parameters.width === undefined ? 70 : parameters.width);
        this.height = (parameters.height === undefined ? 20 : parameters.height);
        this.depth = (parameters.depth === undefined ? 20 : parameters.depth);
        this.material = (parameters.material === undefined ? new THREE.MeshBasicMaterial({ color: 0xf2f2f2 }) : parameters.material);
        
        this.fieldWidth = (parameters.fieldWidth === undefined ? 400 : parameters.fieldWidth);

        this.add(this.createPlatform());
    }

    // Creates the platform
    createPlatform() {
        var geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        var material = new THREE.MeshBasicMaterial(this.material);
        var cube = new THREE.Mesh(geometry, material);
        
        cube.applyMatrix(new THREE.Matrix4().makeTranslation(0, (this.height * 1.5) / 2, (this.fieldWidth / 2) + (this.height * 1.5 / 2)));

        cube.receiveShadow = true;
        cube.autoUpdateMatrix = false;

        return cube;
    }
}
