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

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

class Robot extends THREE.Object3D {

    constructor(parameters) {
        super();

        // If no parameters are specified, use default values
        this.robotHeight = (parameters.robotHeight === undefined ? 21 : parameters.robotHeight);
        this.robotWidth = (parameters.robotWidth === undefined ? 12.5 : parameters.robotWidth);
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
        this.bodyWidth = this.bodyHeight * 0.5;
        this.headRadius = this.robotHeight * 0.1428;

        // Robot movement properties
        this.MAX_HEAD_ANGLE = 80;
        this.MIN_HEAD_ANGLE = -80;
        this.MAX_BODY_ANGLE = 30;
        this.MIN_BODY_ANGLE = -45;
        this.MAX_LEG_STRETCH = 1.2;        // 20% of their normal length 
        this.MIN_LEG_STRETCH = 1;
        
        // Robot movement in the world (needed for later)
        // this.posX = 0;
        // this.posZ = 0;
        // this.movSpeed = 1;

        // Objects that compose the robot
        this.body = this.createBody();
        this.rightLeg = this.createLeg(-1, this.MIN_LEG_STRETCH);
        this.leftLeg = this.createLeg(1, this.MIN_LEG_STRETCH);
        this.head;

        this.add(this.body);
        this.add(this.rightLeg);
        this.add(this.leftLeg);
    }

    /*** PRIVATE METHODS ***/
    // Creates the body of the robot
    createBody() {
        var precision = 30;                              // Number of radial segments
        var bodyRadius = this.bodyWidth * 0.5;
        // Creates the base cylinder
        var bodyGeometry = new THREE.CylinderGeometry(bodyRadius, bodyRadius, this.bodyHeight, precision)
        var body = new THREE.Mesh(bodyGeometry, this.material);
        // Positions the body over the axis
        body.castShadow = true;
        let translationY = (this.bodyHeight / 2) + ((this.legHeight * 0.125) * 2);
        body.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, translationY, 0));

        body.add(this.createHead(translationY));
        return body;
    }
    
    // Creates the head of the robot
    createHead(translation) {
        var precision = 30;                         // Number of radial segments
        // Creates the base sphere
        var headGeometry = new THREE.SphereGeometry(this.headRadius, precision, precision);
        var head = new THREE.Mesh(headGeometry, this.material);
        // Positions the head over the body
        head.castShadow = true;
        head.position.y = translation + this.bodyHeight / 2;
        head.add(this.createEye());
        this.head = head;
        return head;
    }

    // Creates the eye of the robot
    createEye() {
        var precision = 30;                         // Number of radial segments
        var eyeRadius = this.headRadius * 0.25;     // Eye is the 25% of the head
        var eyeHeight = eyeRadius / 2;
        // Creates the base sphere
        var eyeGeometry = new THREE.CylinderGeometry(eyeRadius, eyeRadius, eyeHeight, precision, precision);
        var eye = new THREE.Mesh(eyeGeometry, this.material);
        // Positions the eye in the head
        eye.castShadow = true;
        eye.position.y = this.headRadius/2;
        eye.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 3));
        eye.position.z = this.headRadius * 0.85;
        return eye;
    }

    // Creates a leg of the robot
    // The sign will determine which leg is going to be created
    createLeg(sign, stretch) {
        let precision = 30;
        let legLength = this.legHeight * 0.75 * stretch;
        let legRadius = this.legHeight * 0.09375 * 0.5;
        let legGeometry = new THREE.CylinderGeometry(legRadius, legRadius, legLength, precision);
        let leg = new THREE.Mesh(legGeometry, this.material);

        leg.castShadow = true;
        leg.position.y = (legLength / 2) + (this.legHeight * 0.125);
        leg.position.x = sign * ((this.bodyWidth / 2) + (this.legHeight * 0.125 / 2));

        leg.add(this.createFeet());
        leg.add(this.createShoulder());

        return leg;
    }

    // Creates the feet of the robot
    createFeet() {
        let precision = 30;
        let feetHeight = this.legHeight * 0.125;
        let radiusTop = feetHeight / 2;
        let radiusBottom = this.legHeight * 0.1875 / 2;
        let feetGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, feetHeight, precision);
        let feet = new THREE.Mesh(feetGeometry, this.material);

        feet.castShadow = true;
        feet.position.y = - ((this.legHeight * 0.75 / 2) + (feetHeight / 2));

        return feet;
    }

    // Creates the shoulder of the robot
    createShoulder() {
        let shoulderDimensions = this.legHeight * 0.125;
        let shoulderGeometry = new THREE.BoxGeometry(shoulderDimensions, shoulderDimensions, shoulderDimensions);
        let shoulder = new THREE.Mesh(shoulderGeometry, this.material);

        shoulder.castShadow = true;
        shoulder.position.y = (this.legHeight * 0.75 / 2) + (shoulderDimensions / 2);

        return shoulder;
    }

    /****************************************/
    // SET METHODS
    /****************************************/

    // Sets the head angle
    setHeadRotation(headRotation) {
        let rotation = headRotation;
        if (rotation > this.MAX_HEAD_ANGLE) {
            rotation = this.MAX_HEAD_ANGLE;
        } else if (rotation < this.MIN_HEAD_ANGLE) {
            rotation = this.MIN_HEAD_ANGLE;
        }
        rotation = degToRad(rotation);
        
        this.head.rotation.y = rotation;
    }

    // Sets the body angle
    setBodyRotation(bodyRotation){
        let rotation = bodyRotation;
        if (rotation > this.MAX_BODY_ANGLE) {
            rotation = this.MAX_BODY_ANGLE;
        } else if (rotation < this.MIN_BODY_ANGLE) {
            rotation = this.MIN_BODY_ANGLE;
        }
        rotation = degToRad(rotation);

        this.body.rotation.x = rotation;
    }

    // Sets the leg length
    setLegsScale(extraLength){
        let stretch = extraLength;
        
        if (stretch > this.MAX_LEG_STRETCH) {
            stretch = this.MAX_LEG_STRETCH;
        } else if (stretch < this.MIN_LEG_STRETCH) {
            stretch = this.MIN_LEG_STRETCH;
        }

        this.remove(this.rightLeg);
        this.remove(this.leftLeg);
        this.rightLeg = this.createLeg(-1, stretch);;
        this.leftLeg = this.createLeg(1, stretch);;
        this.add(this.rightLeg);
        this.add(this.leftLeg);
    }
}
