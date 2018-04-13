
/// The Model Facade class. The root node of the graph.
/**
 * @param renderer - The renderer to visualize the scene
 */
class TheScene extends THREE.Scene {

  constructor(renderer) {
    super();

    // Maximum number of Ovo objects in the scene
    this.MAX_NUMBER_OVO = 20;
    this.currentOvo = 0;

    // Attributes

    this.ambientLight = null;
    this.spotLight = null;
    this.camera = null;
    this.trackballControls = null;
    this.robot = null;
    this.robotCollider = null;
    this.ground = null;
    this.ovoList = new Array(this.MAX_NUMBER_OVO).fill(0); // 0:bad, 1: good
    
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
    this.camera.position.set(150, 30, 150);
    var look = new THREE.Vector3(0, 20, 0);
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
    this.spotLight = new THREE.SpotLight(0xffffff);
    this.spotLight.position.set(60, 60, 40);
    this.spotLight.castShadow = true;
    // the shadow resolution
    this.spotLight.shadow.mapSize.width = 2048
    this.spotLight.shadow.mapSize.height = 2048;
    this.add(this.spotLight);
  }

  /// It creates the geometric model: crane and ground
  /**
   * @return The model
   */
  createModel() {
    var model = new THREE.Object3D()
    var loader = new THREE.TextureLoader();
    var textura = loader.load('../img/iron.jpg');
    //this.crane = new Crane({material: new THREE.MeshPhongMaterial ({color: 0xff0000, specular: 0xfbf804, shininess: 70})});
    //this.crane = new Crane({material: new THREE.MeshPhongMaterial ({map: textura})});
    //model.add (this.crane);
    this.robot = new Robot({});
    this.robot.translateX(-100);
    this.robot.rotateY(Math.PI / 2);

    // Robot collider
    this.robotCollider = new THREE.Box3();
    this.robotCollider.setFromObject(this.robot);

    model.add(this.robot);
    this.ground = new Ground(300, 300, new THREE.MeshPhongMaterial({ map: textura }), 4);
    model.add(this.ground);

    return model;
  }

  // // Public methods

  // /// It adds a new box, or finish the action
  // /**
  //  * @param event - Mouse information
  //  * @param action - Which action is requested to be processed: start adding or finish.
  //  */
  // addBox (event, action) {
  //   this.ground.addBox(event, action);
  // }

  // /// It moves or rotates a box on the ground
  // /**
  //  * @param event - Mouse information
  //  * @param action - Which action is requested to be processed: select a box, move it, rotate it or finish the action.
  //  */
  // moveBox (event, action) {
  //   this.ground.moveBox (event, action);
  // }

  // //! It deletes a box
  // /**
  //  * @param event - Mouse information
  //  * @param action - Which action is requested to be processed: select a box or finish the action.
  //  */
  // removeBox (event, action) {
  //   this.ground.removeBox (event, action);
  // }

  // /// The crane can take a box
  // /**
  //  * @return The new height of the hook, on the top of the taken box. Zero if no box is taken
  //  */
  // takeBox () { 
  //   var box = this.ground.takeBox (this.crane.getHookPosition());
  //   if (box === null)
  //     return 0; 
  //   else 
  //     return this.crane.takeBox (box); 
  //   // The retuned height set the new limit to down the hook
  // }

  // /// The crane drops its taken box
  // dropBox () {
  //   var box = this.crane.dropBox ();
  //   if (box !== null) {
  //     box.position.copy (this.crane.getHookPosition());
  //     box.position.y = 0;
  //     this.ground.dropBox (box);
  //   }
  // }


  /// It sets the robot position according to the GUI
  /**
   * @controls - The GUI information
   */
  animate(controls) {
    this.axis.visible = controls.axis;
    this.robot.setHeadRotation(controls.rotationHead);
    this.robot.setBodyRotation(controls.rotationBody);
    this.robot.setLegsScale(controls.scaleLegs);
    
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
      // Recorre la lista de ovo activos y detecta colisiones
      this.ovoList.forEach(ovo => {

        if ((typeof ovo === "object") &&(ovo.ovoState === 1)) {
          // Ovo collider creation
          var ovoCollider = new THREE.Box3();
          ovoCollider.setFromObject(ovo);
          
          // Collision check
          if (ovoCollider.intersectsBox(this.robotCollider)) {
            var ovoType = ovo.ovoType;
            
            if (ovoType === 0) {    // ovo damages the robot
              this.robot.substractEnergy(ovo.damage);
            }
            else {                  // ovo benefits the robot
              this.robot.addPoints(ovo.addPoints);
              this.robot.addEnergy();

              // // Check death from robot
              // if (this.robot.isDead)
              //   this.pauseGame();
            }
            ovo.hitRobot();
          }

          // // For TESTING purposes
          // // Helps to visualize object colliders
          // var ovoColliderView = new THREE.Box3Helper(ovoCollider, 0xffff00);
          // this.add(ovoColliderView);
          // var robotColliderView = new THREE.Box3Helper(this.robotCollider, 0xffff00);
          // this.add(robotColliderView);

          /* --------------- NOTA ---------------
          * Implementar la muerte del robot y la consecuente pausa del juego!
          * Recordar que no se podra mover en estado de pausa
          */
        }
      });
    }
  }

  /// Generates an ovo object in the scene
  generateOvo(){
    const ovo = new Ovo({type: this.ovoList[this.currentOvo]});

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

}

// class variables

// Application modes
TheScene.NO_ACTION = 0;
TheScene.ADDING_BOXES = 1;
TheScene.MOVING_BOXES = 2;
TheScene.DELETING_BOXES = 3;

// Actions
TheScene.NEW_BOX = 0;
TheScene.MOVE_BOX = 1;
TheScene.SELECT_BOX = 2;
TheScene.ROTATE_BOX = 3;
TheScene.DELETE_BOX = 4;
TheScene.END_ACTION = 10;


