/**
 * Robot class
 * Represents a R2D2-like figure in the scene
 * 
 * @author David Vargas, Andres Molina
 * 
 * @param parameters = {
 *      robotHeight: <float>
 *      robotWidth: <float>
 *      material: <Material>
 * }
 */

class Robot extends THREE.Object3D {

    constructor(parameters) {
        super();

        // If no parameters are specified, use default values
        this.robotHeight = (parameters.robotHeight === undefined ? 30 : parameters.robotHeight);
        this.robotWidth = (parameters.robotWidth === undefined ? 45 : parameters.robotWidth);
        this.material = (parameters.material === undefined ? new THREE.MeshPhongMaterial({ color: 0xcaccce, specular: 0xbac3d6, shininess: 70 }) : parameters.material);

        // Calculates the height of different parts
        /**
         * CRITERIA:
         * Legs = 76.19% of total height
         * Body = 66.67% of total height
         * Head = 14.28% of total height
         * --- Widths can be calculated relatively to the specified height
         */
        this.legHeight = this.robotHeight * 0.7619;
        this.bodyHeight = this.robotHeight * 0.6667;
        this.headDiameter = this.robotHeight * 0.1428;

        // Robot movement properties
        this.MAX_HEAD_ANGLE = 80;
        this.MIN_HEAD_ANGLE = -80;
        this.MAX_BODY_ANGLE = 30;
        this.MIN_BODY_ANGLE = -45;
        this.MAX_LEG_LENGTH = this.legHeight * 1.2;  // 20% of their normal length 
        // this.MIN_LEG_LENGTH = this.legHeight;
        this.headAngle = 1;
        this.bodyAngle = 1;
        this.legLength = this.legHeight;

        // Robot movement in the world (needed for later)
        // this.posX = 0;
        // this.posZ = 0;
        // this.movSpeed = 1;

        // Objects that compose the robot
        /**
         * Nota: se podrian usar solo tres clases, y que por ejemplo en la de head
         * se generen todos los objetos que componen la cabeza porque todos se van
         * a generar siguiendo el mismo tamaño. Lo mismo con las otras dos
         */
        this.head = null;
        this.legs = null;
        this.body = null;

        this.body = this.createBody();
        /* this.legs = null; */

        this.add(this.body);
    }

    /*** PRIVATE METHODS ***/
    /** Creates the body of the robot
     * 
     * @author David Vargas Carrillo
     */
    createBody () {
        var precision = 30;                         // Number of radial segments
        var bodyWidth = this.bodyHeight * 0.5;      // Width set to be 50% of the height
        // Creates the base cylinder
        var bodyGeometry = new THREE.CylinderGeometry(bodyWidth / 2, bodyWidth / 2, this.bodyHeight, precision, 1, false)
        var body = new THREE.Mesh(bodyGeometry, this.material);
        // Positions the body over the axis
        body.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.bodyHeight/2, 0));
        body.castShadow = true;
        body.add(this.createHead());
        return body;
    }

    /**
     * Creates the head of the robot
     * 
     * @author David Vargas Carrillo
     */
    createHead() {
        var precision = 30;                         // Number of radial segments
        // Creates the base sphere
        var headGeometry = new THREE.SphereGeometry(this.headDiameter, precision, precision, 0, 6.3, 0, 2);
        var head = new THREE.Mesh(headGeometry, this.material);
        // Positions the head over the body
        head.castShadow = true;
        head.position.y = this.bodyHeight;
        // head.add(this.createEye());
        return head;
    }
}
