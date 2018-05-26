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

  constructor(renderer, difficulty) {
    super();

    // Movement constants
    this.PLATFORM_SPEED = 4 + difficulty / 6;
    this.BALL_SPEED = 4 + difficulty / 6;
    this.MOVE_RIGHT = false;
    this.MOVE_LEFT = false;

    // Current difficulty
    this.difficulty = difficulty;

    // Current player points
    this.playerPoints = 0;

    // Attributes
    this.ambientLight = null;
    this.spotLight = null;
    this.camera = null;
    this.trackballControls = null;
    this.gameFieldWidth = 400;
    this.gameFieldDepth = 400;
    this.alive = true;
    this.victory = false;
    this.ballPaused = true;
    this.gameField = null;

    this.platform = null;
    this.bricks = [];
    this.ball = null;

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
    this.camera.position.set(0, 480, 300);
    var look = new THREE.Vector3(0, 0, 30);
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
    this.spotLight = new THREE.SpotLight(0xffffff, 0.7);
    this.spotLight.position.set(0, 400, 300);
    this.spotLight.castShadow = true;
    // the shadow resolution
    this.spotLight.shadow.mapSize.width = 2048;
    this.spotLight.shadow.mapSize.height = 2048;
    this.add(this.spotLight);
  }

  /// It creates the geometric model: gameField, sky, platform
  /**
   * @return The model
   */
  createModel() {
    var model = new THREE.Object3D()
    var loader = new THREE.TextureLoader();
    var floor_texture = loader.load('../img/floor.jpg');
    var walls_texture = loader.load('../img/walls.jpg');
    var sky_texture = loader.load('../img/mw.jpg');

    this.gameField = new GameField(this.gameFieldWidth, this.gameFieldDepth, new THREE.MeshPhongMaterial({ map: floor_texture }), 20, 40, new THREE.MeshPhongMaterial({ map: walls_texture }));
    this.sky = new Sky({ background: new THREE.MeshBasicMaterial({ map: sky_texture }) });

    this.platform = new Platform({});

    const numBricksRow = 10;
    const brickDepth = 20;
    const brickWidth = this.gameFieldWidth / numBricksRow;
    for (let row = 0; row < this.difficulty; row++) {
      for (let col = 0; col < numBricksRow; col++) {
        // Create the brick
        const brick = new Brick({ width: brickWidth, depth: brickDepth });
        brick.createBrickOn(-this.gameFieldWidth / 2 + brickWidth / 2 + brickWidth * col, -this.gameFieldDepth / 2 + brickDepth / 2 + brickDepth * row);
        model.add(brick);
        this.bricks.push(brick);
      }
    }

    this.ball = new Ball({});

    model.add(this.gameField);
    model.add(this.sky);
    model.add(this.platform);
    model.add(this.ball);

    return model;
  }

  /// It sets the robot position according to the GUI
  /**
   * @controls - The GUI information
   */
  animate(controls) {
    this.axis.visible = true;
    this.setDifficulty(controls.difficulty);

    if (this.alive) {
      this.movePlatform();
      const platformCollider = this.platform.getCollider();

      if (!this.ballPaused) {
        this.ball.moveBall(this.BALL_SPEED);

        if (this.ball.position.z > this.platform.position.z + this.platform.depth / 2) {
          this.alive = false;
        } else {
          const ballCollider = this.ball.getCollider();

          if (ballCollider.intersectsBox(this.platform.getCollider())) {
            console.log(`Platform: (${this.platform.position.x}, ${this.platform.position.z}) Ball: (${this.ball.position.x}, ${this.ball.position.z})`);
            if (this.ball.position.x > this.platform.position.x) { // The ball hits on the right side of the platform
              const distance = this.ball.position.x - this.platform.position.x;
              const newDirection = 270 + distance / 35 * 60; // 270 is the minimum angle, 35 is the maximum distance, 60 is the maximum difference between the minumun angle and the maximum angle allow
              this.ball.setDirection(Math.round(newDirection));
            } else if (this.ball.position.x < this.platform.position.x) { // The ball hits on the left side of the platform
              const distance = this.platform.position.x - this.ball.position.x;
              const newDirection = 270 - distance / 35 * 60;
              this.ball.setDirection(Math.round(newDirection));
            } else { // The ball hits on the middle of the platform
              this.ball.setDirection(Math.round(270));
            }
          } else if (ballCollider.intersectsBox(this.gameField.getCollider(0))) {
            console.log("Bola choca pared derecha");
            this.ball.calculateDirection(true);
          } else if (ballCollider.intersectsBox(this.gameField.getCollider(1))) {
            console.log("Bola choca pared izquierda");
            this.ball.calculateDirection(true);
          } else if (ballCollider.intersectsBox(this.gameField.getCollider(2))) {
            console.log("Bola choca pared superior");
            this.ball.calculateDirection();
          } else {
            let brickCollision = false;
            let cont = this.bricks.length - 1;
            while (cont >= 0 && !brickCollision) {
              if (this.bricks[cont] !== undefined) {
                if (ballCollider.intersectsBox(this.bricks[cont].getCollider())) {
                  brickCollision = true;
                  this.playerPoints += this.bricks[cont].points;
                } else {
                  cont--;
                }
              } else {
                cont--;
              }
            }

            if (brickCollision) {
              console.log(`BRICK: x: (${this.bricks[cont].collider.min.x}, ${this.bricks[cont].collider.max.x}), z: (${this.bricks[cont].collider.min.z}, ${this.bricks[cont].collider.max.z}) BALL: x: (${this.ball.collider.min.x}, ${this.ball.collider.max.x}), z: (${this.ball.collider.min.z}, ${this.ball.collider.max.z})`)
              console.log(`BALL position z: ${this.ball.collider.getCenter().z}`);
              if (this.ball.collider.getCenter().z < this.bricks[cont].collider.max.z && this.ball.collider.getCenter().z > this.bricks[cont].collider.min.z) {
                console.log("ENTRA EN CHOQUE LATERAL");
                if (this.ball.position.x < this.bricks[cont].position.x && 
                  this.ball.collider.max.x > this.bricks[cont].collider.min.x) { // The ball is at the left side of the brick and hit with it
                  console.log("ENTRA EN CHOQUE IZQUIERDO");
                  this.ball.calculateDirection(true);
                } else if (this.ball.position.x > this.bricks[cont].position.x &&
                   this.ball.collider.min.x < this.bricks[cont].collider.max.x) { // The ball is at the right side of the brick and hit with it
                  console.log("ENTRA EN CHOQUE DERECHO");
                  this.ball.calculateDirection(true);
                }
              } else {
                console.log("ENTRA EN ELSE");
                this.ball.calculateDirection();
              }
              this.model.remove(this.bricks[cont]);
              this.bricks[cont] = undefined;

              cont = 0;
              let empty = true;
              while (cont < this.bricks.length && empty) {
                if (this.bricks[cont] !== undefined) {
                  empty = false;
                } else {
                  cont++;
                }
              }
              if (empty) {
                this.victory = true;
              }
            }
          }
        }
      }
    }
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

  movePlatform() {
    if (this.MOVE_RIGHT && !this.MOVE_LEFT) {
      this.platform.moveRight(this.gameFieldWidth, this.PLATFORM_SPEED);
      if (this.ballPaused) {
        this.ball.moveWithPlatform(this.platform.position.x);
      }
    }
    else if (!this.MOVE_RIGHT && this.MOVE_LEFT) {
      this.platform.moveLeft(this.gameFieldWidth, this.PLATFORM_SPEED);
      if (this.ballPaused) {
        this.ball.moveWithPlatform(this.platform.position.x);
      }
    }
  }

  // Sets the game difficulty
  setDifficulty(level) {
    level = Math.floor(level);
  }

  throwBall() {
    this.ballPaused = false;
  }

  setKeyDown(key) {
    switch (key) {
      case "left":
        this.LEFT_KEY_DOWN = true;
        break;
      case "right":
        this.RIGHT_KEY_DOWN = true;
        break;
    }
  }

  setKeyUp(key) {
    switch (key) {
      case "left":
        this.LEFT_KEY_DOWN = false;
        break;
      case "right":
        this.RIGHT_KEY_DOWN = false;
        break;
    }
  }

}

// class variables

// Application modes
TheScene.NORMAL_CAMERA = 0;
TheScene.EYE_CAMERA = 1;
