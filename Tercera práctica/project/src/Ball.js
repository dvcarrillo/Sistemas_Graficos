/**
 * Ball
 * Represents the ball, which is a sphere with a texture assigned
 * 
 * @author David Vargas, Andres Molina
 */

// Converts angles in degrees to angles in radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

class Ball extends THREE.Object3D {

    constructor(parameters) {
        super();

        // Parameters
        this.radius = (parameters.radius === undefined ? 5 : parameters.background);
        this.background = (parameters.background === undefined ? new THREE.MeshBasicMaterial({ color: 0xff3333 }) : parameters.background);

        this.fieldWidth = (parameters.fieldWidth === undefined ? 400 : parameters.fieldWidth);

        this.direction = degToRad((Math.random() * 75) + 240);

        this.ball = this.createBall();
        this.collider = null;
        // this.colliderView = null;

        this.add(this.ball);
    }

    // Creates the ball sphere
    createBall() {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 32, 32), this.background);

        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.radius + 10, (this.fieldWidth / 2) - 30));
        //10 = platform.height * 1.5 - platform.height
        //30 = platform.depth * 1.5

        sphere.castShadow = true;
        // sphere.receiveShadow = true;
        sphere.autoUpdateMatrix = false;

        // console.log(`BALL x: ${sphere.position.x} y: ${sphere.position.y} z: ${sphere.position.z} radius: ${this.radius}`)

        return sphere;
    }

    getCollider() {
        // this.remove(this.colliderView);
        this.collider = new THREE.Box3().setFromObject(this);
        // this.colliderView = new THREE.Box3Helper(this.collider, 0x00ff00);
        // this.add(this.colliderView);
        return this.collider;
    }

    moveWithPlatform(position_x) {
        const displacement = position_x - this.position.x;
        this.applyMatrix(new THREE.Matrix4().makeTranslation(displacement, 0, 0));
        console.log(`BALL x: ${this.position.x} y: ${this.position.y} z: ${this.position.z} radius: ${this.radius}`);
    }

    moveBall(ballSpeed) {
        const position_x = ballSpeed * Math.cos(this.direction);
        const position_z = ballSpeed * Math.sin(this.direction);

        // console.log(`X: ${position_x} Z: ${position_z}`);

        this.applyMatrix(new THREE.Matrix4().makeTranslation(position_x, 0, position_z));

    }

    calculateDirection(sideWall) {
        this.direction = degToRad(360) - this.direction
        if (sideWall) {
            this.direction += degToRad(180);
        }
    }

    setDirection(value) {
        this.direction = degToRad(value);
    }
}