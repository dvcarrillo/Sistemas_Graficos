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
    }

    createObject() {
        const precision = 30;   // Number of radial segments

        // Creates the sphere
        var objectGeometry = new THREE.SphereGeometry(this.headRadius, precision, precision);
        var object = new THREE.Mesh(headGeometry, 0xFF0000);

        // Positions the head over the body
        object.castShadow = true;

        return object;
    }
}