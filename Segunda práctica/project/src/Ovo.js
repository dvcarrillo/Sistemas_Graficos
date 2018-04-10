/**
 * Ovo class
 * Represents a moving object in the scene that could be good or bad
 * 
 * @author David Vargas, Andres Molina
 * 
 */


/**********************************************************************************/

class Ovo extends THREE.Object3D {

    constructor(parameters) {
        super();

        this.ovoRadius = (parameters.ovoRadius === undefined ? 2 : parameters.ovoRadius);
        this.ovoType = parameters.type;
        this.material = (parameters.type === 0 ?
            new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xfbf804, shininess: 0 })
            : new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0xfbf804, shininess: 0 }));

        this.object = this.createObject();
        this.add(this.object);

        // this.updatePosition = this.updatePosition.bind(this);
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
            .onUpdate(function () { 
                object.position.x = position.x;
                object.position.z = position.z;
            })
            .repeat(Infinity)
            .start();

        return object;
    }

}