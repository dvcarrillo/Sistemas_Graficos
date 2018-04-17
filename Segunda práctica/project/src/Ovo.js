/**
 * Ovo class
 * Represents a moving object in the scene that is either good or bad
 * 
 * @author David Vargas, Andres Molina
 * 
 * @param parameters = {
 *      ovoRadius: <float>
 *      ovoType: <int>
 *      material: <Material>
 * }
 */

function intRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) +  min;
}

/**********************************************************************************/

class Ovo extends THREE.Object3D {

    constructor(parameters) {
        super();

        var loader = new THREE.TextureLoader();
        var energyTexture = loader.load('../img/energy.jpg');
        var damageTexture = loader.load('../img/damage.jpg');

        this.ovoRadius = (parameters.ovoRadius === undefined ? 2 : parameters.ovoRadius);
        this.ovoType = parameters.type;     // 0:bad, 1: good
        this.material = (parameters.type === 0 ?
            new THREE.MeshPhongMaterial({ map: damageTexture })
            : new THREE.MeshPhongMaterial({ map: energyTexture }));

        // Object properties
        this.ovoObject = this.createObject();
        this.ovoState = 0;                              // 0: inactive, 1: active
        
        // Effects over the Robot
        this.damage = 10;                               // Amount of life points to substract to Robot's currentLife
        this.addPoints = null;                          // Amount of life points to add to Robot's currentLife
        this.addEnergy = null;
        
        this.ovoObject.rotation.y = Math.PI;
        this.add(this.ovoObject);
    }

    // Builds the object, determining its geometry, position and movement
    createObject() {
        const precision = 30;   // Number of radial segments

        // Creates the sphere
        var objectGeometry = new THREE.SphereGeometry(this.ovoRadius, precision, precision);
        var object = new THREE.Mesh(objectGeometry, this.material);

        // Start position of the object
        this.start = { x: 150, y: Math.floor((Math.random() * 10) + this.ovoRadius), z: Math.floor((Math.random() * 298) - 148) };
        this.end = { x: -150 };
        let position = { x: 150, y: Math.floor((Math.random() * 10) + this.ovoRadius), z: Math.floor((Math.random() * 298) - 148) };

        // Positions the head over the body
        object.castShadow = true;
        object.position.x = this.start.x;
        object.position.y = this.start.y;
        object.position.z = this.start.z;

        // Movement definition
        this.speed = Math.floor((Math.random() * 8000) + 3000);      // Seconds to go from start to end

        this.movement = new TWEEN.Tween(position)
            .to(this.end, this.speed)
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(() => {
                this.recover();
                this.addPoints = intRandomNumber(0, 5);
                this.addEnergy = 5 - this.addPoints;
                object.position.y = position.y;
                object.position.z = position.z;
            })
            .onUpdate(() => {
                object.position.x = position.x;
            })
            .onComplete(() => {
                position.x = this.start.x;
                position.y = Math.floor((Math.random() * 10) + this.ovoRadius);
                position.z = Math.floor((Math.random() * 298) - 148);
                
            });

        this.movement2 = new TWEEN.Tween(position)
            .to(this.end, this.speed)
            .easing(TWEEN.Easing.Quadratic.In)
            .onStart(() => {
                this.recover();
                this.addPoints = intRandomNumber(0, 5);
                this.addEnergy = 5 - this.addPoints;
                object.position.y = position.y;
                object.position.z = position.z;
            })
            .onUpdate(() => {
                object.position.x = position.x;
            })
            .onComplete(() => {
                position.x = this.start.x;
                position.y = Math.floor((Math.random() * 10) + this.ovoRadius);
                position.z = Math.floor((Math.random() * 298) - 148);
            });
        
        this.movement.chain(this.movement2);
        this.movement2.chain(this.movement);

        this.movement.start();

        return object;
    }
    
    // Adds the object to the scene
    recover() {
        if(this.ovoState === 0) {
            this.ovoState = 1;
        }
    }

    // Deletes the object from the scene
    hitRobot() {
        if(this.ovoState === 1) {
            this.ovoState = 0;
        }
    }
}