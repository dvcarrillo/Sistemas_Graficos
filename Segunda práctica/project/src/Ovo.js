/**
 * Ovo class
 * Represents an object in the scene that could be good or bad
 * 
 * @author David Vargas, Andres Molina
 * 
 */


/**********************************************************************************/

class Ovo extends THREE.Object3D {

    constructor(parameters) {
        super();

        this.ovoRadius = (parameters.ovoRadius === undefined ? 2 : parameters.ovoRadius);
        
        this.object = this.createObject();
        this.add(this.object);
        console.log(this.object.position.x);
    }

    createObject() {
        const precision = 30;   // Number of radial segments

        // Creates the sphere
        var objectGeometry = new THREE.SphereGeometry(this.ovoRadius, precision, precision);
        var object = new THREE.Mesh(objectGeometry, new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xfbf804, shininess: 0 }));

        // Positions the head over the body
        object.castShadow = true;
        object.position.x = 10;
        object.position.y = 5;

        return object;
    }
}