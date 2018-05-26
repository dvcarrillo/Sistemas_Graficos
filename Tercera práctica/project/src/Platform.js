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

        this.platform = this.createPlatform();
        this.collider = null;
        // this.colliderView = null;

        this.add(this.platform);
    }

    // Creates the platform
    createPlatform() {
        var geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        var material = new THREE.MeshBasicMaterial(this.material);
        var cube = new THREE.Mesh(geometry, material);
        
        cube.applyMatrix(new THREE.Matrix4().makeTranslation(0, (this.height * 1.5) / 2, (this.fieldWidth / 2) - (this.depth * 1.5 / 2)));
        
        cube.receiveShadow = true;
        cube.autoUpdateMatrix = false;

        return cube;
    }
    
    getCollider() {
        // this.remove(this.colliderView);
        this.collider = new THREE.Box3().setFromObject(this.platform);
        // this.colliderView = new THREE.Box3Helper(this.collider, 0xff0000);
        // this.add(this.colliderView);
        return this.collider;
    }

    moveRight(fieldWidth, displacement) {
        if(this.position.x + displacement <= fieldWidth/2 - this.width/2) {
            this.applyMatrix(new THREE.Matrix4().makeTranslation(displacement, 0, 0));
        } else {
            const extra = (this.position.x + displacement) - (fieldWidth/2 - this.width/2)
            this.applyMatrix(new THREE.Matrix4().makeTranslation(displacement - extra, 0, 0));
        }
        // console.log(`PLATFORM POSITION X (RIGHT): ${this.position.x}`);
    }

    moveLeft(fieldWidth, displacement) {
        if(this.position.x - displacement >= - fieldWidth/2 + this.width/2) {
            this.applyMatrix(new THREE.Matrix4().makeTranslation(-displacement, 0, 0));
        } else {
            const extra = (this.position.x - displacement) - (- fieldWidth/2 + this.width/2)
            this.applyMatrix(new THREE.Matrix4().makeTranslation(- displacement - extra, 0, 0));
        }
        // console.log(`PLATFORM POSITION X (LEFT): ${this.position.x}`);
    }
}
