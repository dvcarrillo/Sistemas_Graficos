/**
 * Ball
 * Represents the ball, which is a sphere with a texture assigned
 * 
 * @author David Vargas, Andres Molina
 */

class Ball extends THREE.Object3D {

    constructor(parameters) {
        super();

        // Parameters
        this.radius = (parameters.radius === undefined ? 5 : parameters.background);
        this.background = (parameters.background === undefined ? new THREE.MeshBasicMaterial({ color: 0xff0000 }) : parameters.background);

        this.fieldWidth = (parameters.fieldWidth === undefined ? 400 : parameters.fieldWidth);
        
        this.add(this.createBall());
    }

    // Creates the ball sphere
    createBall() {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 32, 32), this.background);

        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.radius + 10, (this.fieldWidth / 2) - 30)); 
        //10 = platform.height * 1.5 - platform.height
        //30 = platform.depth * 1.5

        sphere.receiveShadow = true;
        sphere.autoUpdateMatrix = false;

        // console.log(`BALL x: ${sphere.position.x} y: ${sphere.position.y} z: ${sphere.position.z} radius: ${this.radius}`)

        return sphere;
    }

    moveWithPlatform(position_x) {
        const displacement = position_x - this.position.x;
        this.applyMatrix(new THREE.Matrix4().makeTranslation(displacement, 0, 0));
        console.log(`BALL x: ${this.position.x} y: ${this.position.y} z: ${this.position.z} radius: ${this.radius}`);
    }
}