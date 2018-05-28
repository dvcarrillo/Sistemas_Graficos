/**
 * This class represents a brick that the player can break with the ball
 * 
 * @author David Vargas, Andrés Molina
 * 
 * @param width - The width of the brick
 * @param height - The height of the brick
 * @param depth - The depth of the brick
 * @param material - The material of the brick
 * @param type - The type of the brick (game improvement)
 * 
 * @param fieldWidth - Width of the game field
 */

/**
 * -- CURRENT TYPES OF BRICK --
 * 0: normal brick. It breaks when the ball touches it and gives points to the player - 10 points
 * 1: special brick. When breaking, it drops a special object that needs to be caught by the player - 30 points
 */

// Green, blue, fuchsia, red, yellow, gray
const brickColors = [0x00cc00, 0x0066ff, 0xff00ff, 0xff0000, 0xffff00, 0x808080, 0xff6600, 0x99ff33, 0x33cccc, 0x660066, 0xffffff];

class Brick extends THREE.Object3D {

    constructor(parameters) {
        super();

        // Color selection
        let randomNum = Math.floor(Math.random() * brickColors.length); 
        let brickColor = brickColors[randomNum];

        this.fieldWidth = (parameters.fieldWidth === undefined ? 400 : parameters.fieldWidth);

        this.width = (parameters.width === undefined ? this.fieldWidth / 10 : parameters.width);
        this.height = (parameters.height === undefined ? 35 : parameters.height);
        this.depth = (parameters.depth === undefined ? 20 : parameters.depth);
        this.material = (parameters.material === undefined ? new THREE.MeshPhongMaterial({color: brickColor}) : parameters.material);
        
        // Type calculation
        let randNum = Math.round(Math.random() * 100);
        this.type = (randNum < 90 - (parameters.difficulty === undefined ? 0 : parameters.difficulty / 2)) ? 0 : 1;

        this.collider = null;
        // Points determination according to brick type
        // More types to be added
        switch (this.type) {
            case 0:
                this.points = 10;
                break;

            case 1:
                this.points = 30;
                break;
        
            default:
                this.points = 10;
                break;
        }
    }

    /**
     * Create the brick on the desired position
     */
    createBrickOn(position_x, position_z) {
        var geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        var cube = new THREE.Mesh(geometry, this.material);
        cube.applyMatrix(new THREE.Matrix4().makeTranslation(position_x, this.height/2 + 1, position_z));

        cube.castShadow = true;
        cube.autoUpdateMatrix = false;

        this.collider = new THREE.Box3().setFromObject(cube);
        this.collider.expandByScalar(2);

        this.add(cube);
        return cube;
    }

    getCollider() {
        return this.collider;
    }

}

