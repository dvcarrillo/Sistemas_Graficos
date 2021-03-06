/**
 * Scene class
 * Represents all the elements in the scene
 * The Model Facade class. The root node of the graph.
 * 
 * @author David Vargas, Andres Molina
 * 
 * @param renderer = The renderer to visualize the scene
 * 
 */

// Converts angles in degrees to angles in radians
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**********************************************************************************/

class TheScene extends THREE.Scene {

  constructor(renderer) {
    super();

    // Maximum number of Ovo objects in the scene
    this.MAX_NUMBER_OVO = 40;
    this.currentOvo = 0;

    // Current difficulty
    this.difficulty = 1;

    // Attributes
    this.ambientLight = null;
    this.spotLight = null;
    this.camera = null;
    this.trackballControls = null;
    this.robot = null;
    this.ground = null;
    this.sky = null;
    this.ovoList = new Array(this.MAX_NUMBER_OVO).fill(0); // 0:bad, 1: good

    this.energyBar = null;

    let contList = 0;
    while (contList < (Math.floor(this.MAX_NUMBER_OVO * 0.2))) {
      const rand = Math.floor(Math.random() * 20);
      if (this.ovoList[rand] !== 1) {
        this.ovoList[rand] = 1;
        contList++;
      }
    }

    this.createLights();
    this.createCamera(renderer);
    this.axis = new THREE.AxisHelper(25);
    this.add(this.axis);
    this.model = this.createModel();
    this.add(this.model);
  }

  /// It creates the camera and adds it to the graph
  /**
   * @param renderer - The renderer associated with the camera
   */
  createCamera(renderer) {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-300, 200, 0);
    var look = new THREE.Vector3(10, 0, 0);
    this.camera.lookAt(look);

    this.trackballControls = new THREE.TrackballControls(this.camera, renderer);
    this.trackballControls.rotateSpeed = 5;
    this.trackballControls.zoomSpeed = -2;
    this.trackballControls.panSpeed = 0.5;
    this.trackballControls.target = look;

    this.add(this.camera);
  }

  /// It creates lights and adds them to the graph
  createLights() {
    // add subtle ambient lighting
    this.ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
    this.add(this.ambientLight);

    // add spotlight for the shadows
    this.spotLight = new THREE.SpotLight(0xffffff, 0.3);
    this.spotLight.position.set(150, 60, 0);
    this.spotLight.castShadow = true;
    // the shadow resolution
    this.spotLight.shadow.mapSize.width = 2048;
    this.spotLight.shadow.mapSize.height = 2048;
    this.add(this.spotLight);
  }

  /// It creates the geometric model: robot, ground and energy bar
  /**
   * @return The model
   */
  createModel() {
    var model = new THREE.Object3D()
    var loader = new THREE.TextureLoader();
    var ground_texture = loader.load('../img/iron.jpg');
    var sky_texture = loader.load('../img/mw.jpg');
    this.robot = new Robot({});
    this.robot.translateX(-100);
    this.robot.rotateY(degToRad(90));

    // Energy bar
    this.energyBar = new EnergyBar({});

    model.add(this.robot);
    model.add(this.energyBar);
    this.ground = new Ground(300, 300, new THREE.MeshPhongMaterial({ map: ground_texture }), 4);
    this.sky = new Sky({ background: new THREE.MeshBasicMaterial({ map: sky_texture }) });
    model.add(this.ground);
    model.add(this.sky);

    return model;
  }

  /// It sets the robot position according to the GUI
  /**
   * @controls - The GUI information
   */
  animate(controls) {
    this.axis.visible = controls.axis;
    this.robot.setHeadRotation(controls.rotationHead);
    this.robot.setBodyRotation(controls.rotationBody);
    this.robot.setLegsScale(controls.scaleLegs);

    this.setDifficulty(controls.difficulty);

    if (this.currentOvo < this.MAX_NUMBER_OVO) {
      // 30% of chance for generating an Ovo object
      if (Math.floor(Math.random() * 9) < 1) {
        this.generateOvo();
        this.currentOvo++;
      }
    }

    // Siguiente paso en el movimiento de todos los objetos
    TWEEN.update();

    /* Only checks for collisions if all the following is true:
    *   - Robot is defined
    *   - Robot is alive
    *   - ovoList[i] is an object
    *   - ovo in ovoList[i] is enabled
    */
    if ((this.robot) && (!this.robot.isDead)) {
      // Iterates over the ovo list and detects collisions
      this.ovoList.forEach(ovo => {

        if ((typeof ovo === "object") && (ovo.ovoState === 1)) {
          // Ovo collider creation
          var ovoCollider = new THREE.Box3();
          ovoCollider.setFromObject(ovo);

          // Robot collider creation
          var robotCollider = new THREE.Box3();
          robotCollider.setFromObject(this.robot);

          // Collision check
          if (ovoCollider.intersectsBox(robotCollider)) {
            var ovoType = ovo.ovoType;

            if (ovoType === 0) {    // ovo damages the robot
              this.robot.substractEnergy(ovo.damage);
              this.energyBar.setToEnergy(this.robot.currentEnergy);
            }
            else {                  // ovo benefits the robot
              this.robot.addPoints(ovo.addPoints);
              this.robot.addEnergy(ovo.addEnergy);
              this.energyBar.setToEnergy(this.robot.currentEnergy);
            }
            ovo.hitRobot();
          }

          // // For TESTING purposes
          // // Helps to visualize object colliders
          // var ovoColliderView = new THREE.Box3Helper(ovoCollider, 0xffff00);
          // this.add(ovoColliderView);
          // var robotColliderView = new THREE.Box3Helper(robotCollider, 0xffff00);
          // this.add(robotColliderView);
        }
      });
    }
  }

  /// Generates an ovo object in the scene
  generateOvo() {
    const ovo = new Ovo({ type: this.ovoList[this.currentOvo] });

    this.ovoList[this.currentOvo] = ovo;
    this.model.add(ovo);
  }

  /// It returns the camera
  /**
   * @return The camera
   */
  getCamera() {
    return this.camera;
  }

  // It returns the eye camera of the robot
  getEyeCamera() {
    return this.robot.eyeCamera;
  }

  /// It returns the camera controls
  /**
   * @return The camera controls
   */
  getCameraControls() {
    return this.trackballControls;
  }

  /// It updates the aspect ratio of the camera
  /**
   * @param anAspectRatio - The new aspect ratio for the camera
   */
  setCameraAspect(anAspectRatio) {
    this.camera.aspect = anAspectRatio;
    this.camera.updateProjectionMatrix();
  }

  moveRobot(action) {
    switch (action) {
      case TheScene.MOVE_FORWARD:
        this.robot.position.x += 2 * Math.cos(degToRad(this.robot.currentRotation));
        this.robot.position.z -= 2 * Math.sin(degToRad(this.robot.currentRotation));
        if (this.robot.position.x > 150 || this.robot.position.x < -150 || this.robot.position.z > 150 || this.robot.position.z < -150) {
          this.robot.substractEnergy(this.robot.currentEnergy);
          this.energyBar.setToEnergy(this.robot.currentEnergy);
        }
        else {
          this.robot.substractEnergy(1);
          this.energyBar.setToEnergy(this.robot.currentEnergy);
        }
        break;
      case TheScene.MOVE_BACKWARD:
        this.robot.position.x -= 2 * Math.cos(degToRad(this.robot.currentRotation));
        this.robot.position.z += 2 * Math.sin(degToRad(this.robot.currentRotation));
        if (this.robot.position.x > 150 || this.robot.position.x < -150 || this.robot.position.z > 150 || this.robot.position.z < -150) {
          this.robot.substractEnergy(this.robot.currentEnergy);
          this.energyBar.setToEnergy(this.robot.currentEnergy);
        }
        else {
          this.robot.substractEnergy(1);
          this.energyBar.setToEnergy(this.robot.currentEnergy);
        }
        break;
      case TheScene.TURN_RIGHT:
        this.robot.rotation.y -= degToRad(10);
        this.robot.currentRotation -= 10;
        // this.robot.substractEnergy(1);
        this.energyBar.setToEnergy(this.robot.currentEnergy);
        break;
      case TheScene.TURN_LEFT:
        this.robot.rotation.y += degToRad(10);
        this.robot.currentRotation += 10;
        // this.robot.substractEnergy(1);
        this.energyBar.setToEnergy(this.robot.currentEnergy);
        break;
    }
  }
  
  // Sets the game difficulty
  setDifficulty(level) {
    level = Math.floor(level);

    if (level != this.difficulty) {
      this.difficulty = level;

      if (this.difficulty <= 1.9) {
        this.MAX_NUMBER_OVO = 10;
        console.log("NIVEL UNO");
      } else if (this.difficulty <= 2.9) {
        this.MAX_NUMBER_OVO = 20;
        console.log("NIVEL DOS");
      } else {
        this.MAX_NUMBER_OVO = 40;
        console.log("NIVEL TRES");
      }

      if (this.currentOvo > this.MAX_NUMBER_OVO) {
        for (let index = 0; index < this.ovoList.length; index++) {
          this.model.remove(this.ovoList[index]);
          this.ovoList[index] = 0;
        }

        this.currentOvo = 0;

        let contList = 0;
        while (contList < (Math.floor(this.MAX_NUMBER_OVO * 0.2))) {
          const rand = Math.floor(Math.random() * 20);
          if (this.ovoList[rand] !== 1) {
            this.ovoList[rand] = 1;
            contList++;
          }
        }
      }
    }
  }
}


// class variables

// Application modes
TheScene.NORMAL_CAMERA = 0;
TheScene.EYE_CAMERA = 1;

// Actions
TheScene.MOVE_FORWARD = 0;
TheScene.MOVE_BACKWARD = 1;
TheScene.TURN_RIGHT = 2;
TheScene.TURNING_LEFT = 3;