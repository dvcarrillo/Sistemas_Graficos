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

// Converts angles in degrees to angles in radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**********************************************************************************/

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

        // Robot life properties
        this.MAX_ROBOT_ENERGY = 100;

        this.currentEnergy = this.MAX_ROBOT_ENERGY;
        this.currentPoints = 0;
        this.isDead = this.currentEnergy < 0 ? true : false;

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
        this.rightFoot = this.createFoot(-1);
        this.leftFoot = this.createFoot(1);
        this.rightFemur;
        this.leftFemur;
        this.rightShoulder;
        this.leftShoulder;
        this.body;
        this.head;
        
        // this.add(this.body);
        this.add(this.rightFoot);
        this.add(this.leftFoot);
    }

    /******************************************************************************/
    // PRIVATE METHODS
    /******************************************************************************/

    // Creates the body of the robot
    createBody() {
        var precision = 30;                              // Number of radial segments
        var bodyRadius = this.bodyWidth * 0.5;

        // Creates the base cylinder
        var bodyGeometry = new THREE.CylinderGeometry(bodyRadius, bodyRadius, this.bodyHeight, precision)
        var body = new THREE.Mesh(bodyGeometry, this.material);

        // Positions the body over the axis
        body.translateX((-(bodyRadius)) - (this.legHeight * 0.125 / 2));
        body.translateY(-(this.bodyHeight / 2) + (this.headRadius / 2) + (0.25 * this.legHeight));
        
        body.castShadow = true;
        this.body = body;
        body.add(this.createHead());

        return body;
    }

    // Creates the head of the robot
    createHead() {
        var precision = 30;                              // Number of radial segments

        // Creates the base sphere
        var headGeometry = new THREE.SphereGeometry(this.headRadius, precision, precision);
        var head = new THREE.Mesh(headGeometry, this.material);

        // Positions the head over the body
        head.castShadow = true;
        head.position.y = this.bodyHeight / 2;
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
        eye.position.y = this.headRadius / 2;
        eye.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 3));
        eye.position.z = this.headRadius * 0.85;
        
        return eye;
    }

    // Creates a foot of the robot
    // Side: positive number or zero for creating the left foot
    //       negative number for creating the right foot
    createFoot(side) {
        // Adjusts the side value
        side = (side >= 0) ? 1 : -1;

        let precision = 30;
        let footHeight = this.legHeight * 0.125;
        let radiusTop = footHeight / 2;
        let radiusBottom = this.legHeight * 0.1875 / 2;
        let footGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, footHeight, precision);
        let foot = new THREE.Mesh(footGeometry, this.material);

        foot.position.y = this.legHeight * 0.125 / 2;
        foot.position.x = side * ((this.bodyWidth / 2) + (this.legHeight * 0.125 / 2));

        foot.castShadow = true;

        foot.add(this.createFemur(side));
        foot.add(this.createShoulder(side));
        return foot;
    }

    // Creates a leg of the robot
    // Side: positive number or zero for creating the left foot
    //       negative number for creating the right foot
    createFemur(side) {
        let precision = 30;
        let femurLength = this.legHeight * 0.75;
        let femurRadius = this.legHeight * 0.09375 * 0.5;
        let legGeometry = new THREE.CylinderGeometry(femurRadius, femurRadius, femurLength, precision);
        let femur = new THREE.Mesh(legGeometry, this.material);
        
        femur.castShadow = true;
        
        if (side >= 0)
            this.leftFemur = femur;
        else
            this.rightFemur = femur;

        return femur;
    }

    // Creates a shoulder of the robot
    // Side: positive number or zero for creating the left shoulder
    //       negative number for creating the right shoulder
    createShoulder(side) {
        let shoulderDimensions = this.legHeight * 0.125;
        let shoulderGeometry = new THREE.BoxGeometry(shoulderDimensions, shoulderDimensions, shoulderDimensions);
        let shoulder = new THREE.Mesh(shoulderGeometry, this.material);

        shoulder.castShadow = true;
        shoulder.position.y = (this.legHeight * 0.75 / 2) + (shoulderDimensions / 2);

        if (side >= 0) {
            this.leftShoulder = shoulder;
            shoulder.add(this.createBody());
        }
        else
            this.rightShoulder = shoulder;
        
        return shoulder;
    }

    /******************************************************************************/
    // SET METHODS
    /******************************************************************************/

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
    setBodyRotation(bodyRotation) {
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
    setLegsScale(extraLength) {
        let stretch = extraLength;        
        if (stretch > this.MAX_LEG_STRETCH) {
            stretch = this.MAX_LEG_STRETCH;
        } else if (stretch < this.MIN_LEG_STRETCH) {
            stretch = this.MIN_LEG_STRETCH;
        }

        this.rightFemur.scale.set(1, stretch, 1);
        this.rightFemur.position.y = this.legHeight * 0.75 / 2;
        this.leftFemur.scale.set(1, stretch, 1);
        this.leftFemur.position.y = this.legHeight * 0.75 / 2;
        
        this.rightShoulder.position.y = (this.legHeight * 0.75) * stretch;
        this.leftShoulder.position.y = (this.legHeight * 0.75) * stretch;
    }

    // Substacts from currentEnergy the indicated amount
    substractEnergy(damage) {
        this.currentEnergy -= damage;
        
        console.log("Arrrrr!!!!! Nuestro intrepido grumete ha sido herido! (" + this.currentEnergy + " pts. de energia restante)");

        if (this.currentEnergy <= 0) {
            this.isDead = true;
            console.log("AL ENCHUFE!");
        }
        /* Check then death from TheScene.js */
    }

    // Adds energy to the robot
    addEnergy() {
        if (this.currentPoints < 5) {
            this.currentEnergy += 5 - this.currentPoints;

            if (this.currentEnergy > this.MAX_ROBOT_ENERGY)
                this.currentEnergy = this.MAX_ROBOT_ENERGY;
        }
        console.log("SE HA RECUPERADO ENERGIA!!!! ( " + this.currentEnergy + " pts. de energia)");
    }

    // Adds the indicated amount of points
    addPoints(points) {
        this.currentPoints += points;
        console.log("Toma toma pepinaso (esferico)!! Y me lo como yo yo yo!! (" + this.currentPoints + " puntos acumulados)");
    }
    
}
