// EXAMEN

class ObjetoVolador extends THREE.Object3D {

    constructor(parameters) {
        super();

        // Object properties
        var geometry = new THREE.SphereGeometry(5, 32, 32);
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.objetoVolador = new THREE.Mesh(geometry, material);
        this.objetoVolador.position.y = 10;
    
        this.defineMovement(0);
        this.add(this.objetoVolador);
    }

    // Builds the object, determining its geometry, position and movement
    defineMovement(extension) {
        // Start position of the object
        this.start1 = { x: 40 + extension, y: 0, z: 0 };
        this.end1 = { x: -40 - extension, y: 0, z: 0 };
        let position1 = { x: 40, y: 0, z: 0 };

        // // Movement definition
        this.speed = 2000;      // Seconds to go from start to end1

        // this.movement1 = new TWEEN.Tween(position1)
        //     .to(this.end1, this.speed)
        //     .easing(TWEEN.Easing.Quadratic.InOut)
        //     .onStart(() => {
        //         this.objetoVolador.position.x = position1.x;
        //     })
        //     .onUpdate(() => {
        //         this.objetoVolador.position.x = position1.x;
        //     })
        //     .onComplete()
        //     .repeat(Infinity)
        //     .yoyo(true);
        
        this.start2 = { x: 0, y: 0, z: 40 };
        this.end2 = { x: 0, y: 0, z: -40 };
        let position2 = { x: 0, y: 0, z: 40 };
        
        this.movement2 = new TWEEN.Tween(position2)
        .to(this.end2, this.speed)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onStart(() => {
            this.objetoVolador.position.z = position2.z;
        })
        .onUpdate(() => {
            this.objetoVolador.position.z = position2.z;
        })
        .onComplete()
        .repeat(Infinity)
        .yoyo(true);

        this.movement1.start();
        this.movement2.start();

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
        
        // this.movement.chain(this.movement2);
        // this.movement2.chain(this.movement);

        // this.movement.start();

        // return object;
    }
    
}

// EXAMEN
