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

        this.direction = degToRad(Math.round((Math.random() * 75) + 240));

        this.platformPosition = (parameters.platformPosition === undefined ? 0 : parameters.platformPosition)

        this.ball = this.createBall(this.platformPosition);
        this.collider = null;

        this.add(this.ball);
    }

    // Creates the ball sphere
    createBall(position_x) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 32, 32), this.background);

        sphere.applyMatrix(new THREE.Matrix4().makeTranslation(position_x, this.radius + 10, (this.fieldWidth / 2) - 25));

        sphere.castShadow = true;
        sphere.autoUpdateMatrix = false;

        return sphere;
    }

    getCollider() {
        this.collider = new THREE.Box3().setFromObject(this);
        return this.collider;
    }

    moveWithPlatform(position_x) {
        const displacement = position_x - this.position.x;
        this.applyMatrix(new THREE.Matrix4().makeTranslation(displacement, 0, 0));
    }

    moveBall(ballSpeed) {
        const position_x = ballSpeed * Math.cos(this.direction);
        const position_z = ballSpeed * Math.sin(this.direction);

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