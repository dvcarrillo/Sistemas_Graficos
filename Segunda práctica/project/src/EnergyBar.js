/**
 * Energy bar
 * The energy display is represented with a cube, whose width and color
 * determine the amount of energy left
 * 
 * @author David Vargas, Andres Molina
 */

class EnergyBar extends THREE.Object3D {

    constructor(parameters) {
        super();

        // Colors for its different states
        this.highColor = (parameters.highColor === undefined ? new THREE.MeshBasicMaterial({ color: 0x66ff66 }) : parameters.highColor); 
        this.mediumColor = (parameters.mediumColor === undefined ? new THREE.MeshBasicMaterial({ color: 0xff9900 }) : parameters.mediumColor);
        this.lowColor = (parameters.lowColor === undefined ? new THREE.MeshBasicMaterial({ color: 0xcc3300 }) : parameters.lowColor);
    
        // Bar width
        this.defaultWidth = (parameters.defaultWidth === undefined ? 200 : parameters.defaultWidth);

        // Object that compose the energy bar
        this.barObject = this.createEnergyBar();

        this.add(this.barObject);
    }

    // Creates the bar object
    // Assumes that this is created when robot is at maximum life
    createEnergyBar() {
        var barGeometry = new THREE.BoxGeometry(10, 10, this.defaultWidth);
        var barObject = new THREE.Mesh(barGeometry, this.highColor);

        barObject.translateX(150);
        barObject.translateY(50);

        return barObject;
    }

    // Updates the bar width and color
    setToEnergy(currentEnergy) {
        this.remove(this.barObject);
        
        if (currentEnergy > 0) {
            if (currentEnergy > 100)
                currentEnergy = 100;

            var newColor;
            if (currentEnergy > 50) 
                newColor = this.highColor;
            else if (currentEnergy > 20) 
                newColor = this.mediumColor;
            else
                newColor = this.lowColor;
            
            var barGeometry = new THREE.BoxGeometry(10, 10, currentEnergy * 2);
            var barObject = new THREE.Mesh(barGeometry, newColor);

            barObject.translateX(150);
            barObject.translateY(50);

            this.barObject = barObject;
            this.add(this.barObject);
        }
    }
}
