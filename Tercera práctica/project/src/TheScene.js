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
/**********************************************************************************/

class TheScene extends THREE.Scene {

  constructor(renderer) {
    super();

    // Current difficulty
    this.difficulty = 1;

    // Attributes
    this.ambientLight = null;
    this.spotLight = null;
    this.camera = null;
    this.trackballControls = null;

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
    this.setDifficulty(controls.difficulty);
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

  movePlatform(action) {
    switch (action) {
      case TheScene.MOVE_RIGHT:
        break;
      case TheScene.MOVE_LEFT:
        break;
    }
  }
  
  // Sets the game difficulty
  setDifficulty(level) {
    level = Math.floor(level);
  }
}


// class variables

// Application modes
TheScene.NORMAL_CAMERA = 0;
TheScene.EYE_CAMERA = 1;

// Actions
TheScene.MOVE_RIGHT = 1;
TheScene.MOVE_LEFT = 2;