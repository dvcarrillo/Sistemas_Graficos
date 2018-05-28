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
    this.HAS_OBJECT = false;
    this.OBJECT_USES = 3;
    this.MOVE_RIGHT = false;
    this.MOVE_LEFT = false;

    // Current difficulty
    this.endTime = null;
    this.difficulty = difficulty;
    if (this.difficulty === "6") {
      this.endTime = Date.now() + 120000;
    }

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
    this.specialObjects = [];
    this.specialObjectTexture = null;
    this.ball = null;

    this.rightWallHit = 0;
    this.leftWallHit = 0;
    this.topWallHit = 0;

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
    this.spotLight = new THREE.SpotLight(0xffffff, 0.9);
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
    var floor_texture = loader.load('../img/floor.png');
    var walls_texture = loader.load('../img/walls.jpg');
    var sky_texture = loader.load('../img/mw.jpg');
    this.specialObjectTexture = loader.load('../img/arrow.png');

    this.gameField = new GameField(this.gameFieldWidth, this.gameFieldDepth, new THREE.MeshPhongMaterial({ map: floor_texture }), 20, 40, new THREE.MeshPhongMaterial({ map: walls_texture }));
    this.sky = new Sky({ background: new THREE.MeshBasicMaterial({ map: sky_texture }) });

    this.platform = new Platform({});

    const numBricksRow = 10;
    const brickDepth = 20;
    const brickWidth = this.gameFieldWidth / numBricksRow;
    let cont = 0;
    for (let row = 0; row < this.difficulty; row++) {
      for (let col = 0; col < numBricksRow; col++) {
        // Create the brick
        const brick = new Brick({ width: brickWidth, depth: brickDepth, difficulty: this.difficulty });
        brick.createBrickOn(-this.gameFieldWidth / 2 + brickWidth / 2 + brickWidth * col, -this.gameFieldDepth / 2 + brickDepth / 2 + brickDepth * row);
        model.add(brick);
        this.bricks.push(brick);
        if (brick.type === 1){
          let sObject = new SpecialObject({numBrick: cont, texture: new THREE.MeshPhongMaterial({ map: this.specialObjectTexture })});
          sObject.createObjectOn(brick.collider.getCenter().x, brick.collider.getCenter().z);
          model.add(sObject);
          this.specialObjects.push(sObject);
        }
        cont++;
      }
    }

    this.ball = new Ball({});

    model.add(this.gameField);
    model.add(this.sky);
    model.add(this.platform);
    model.add(this.ball);

    return model;
  }

  /// Adds a new special object to the game
  /**
   * @posX - X position of the object
   * @posZ - Z position of the object
   */
  addSpecialObject(posX, posZ) {
    
    
    
  }

  /// Removes a special object from the game
  /**
   * @pos - position of the object in the array
   */
  removeSpecialObject(pos) {
    this.model.remove(this.specialObjects[pos]);
    this.specialObjects.splice(pos, 1);
  }

  /// It sets the robot position according to the GUI
  /**
   * @controls - The GUI information
   */
  animate(controls) {
    this.axis.visible = false;

    if (this.alive) {
      this.movePlatform();
      const platformCollider = this.platform.getCollider();

      // Move all the special objects in the scene and check collisions
      for (let i = 0; i < this.specialObjects.length; i++) {
        if (this.bricks[this.specialObjects[i].brickLinked] === undefined){
          this.specialObjects[i].moveObject();
          let objectCollider = this.specialObjects[i].getCollider();
  
          if (objectCollider.intersectsBox(this.platform.getCollider())) {
            this.removeSpecialObject(i);
            this.HAS_OBJECT = true;
            this.currentUses = this.OBJECT_USES;
          } else if (this.specialObjects[i].collider.getCenter().z > (this.platform.collider.getCenter().z + this.platform.depth)) {
            this.removeSpecialObject(i);
          }
        }
      }

      if (!this.ballPaused) {
        this.ball.moveBall(this.BALL_SPEED);

        if (this.ball.position.z > (this.platform.position.z + this.platform.depth)) {
          this.alive = false;
        } else {
          const ballCollider = this.ball.getCollider();
          if (ballCollider.intersectsBox(this.platform.getCollider())) {
            this.rightWallHit = 0;
            this.leftWallHit = 0;
            this.topWallHit = 0;

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
            if (this.HAS_OBJECT && this.currentUses > 0) {
              this.ballPaused = true;
              this.currentUses--;

              if (this.currentUses < 1)
                this.HAS_OBJECT = false;
            }
          } else if (ballCollider.intersectsBox(this.gameField.getCollider(0))) {
            this.leftWallHit = 0;
            this.topWallHit = 0;
            if (this.rightWallHit > 0)
              this.ball.position.x = this.gameFieldWidth/2 - this.ball.radius; // Consider the field width and the ball radius
            this.ball.calculateDirection(true);
            this.rightWallHit++;
          } else if (ballCollider.intersectsBox(this.gameField.getCollider(1))) {
            this.rightWallHit = 0;
            this.topWallHit = 0;
            if (this.leftWallHit > 0)
              this.ball.position.x = -(this.gameFieldWidth/2 - this.ball.radius); // Consider the field width and the ball radius
            this.ball.calculateDirection(true);
            this.leftWallHit++;
          } else if (ballCollider.intersectsBox(this.gameField.getCollider(2))) {
            this.rightWallHit = 0;
            this.leftWallHit = 0;
            if (this.topWallHit > 0)
              this.ball.position.z = -(this.gameFieldDepth/2 - this.ball.radius); // Consider the field width and the ball radius
            this.ball.calculateDirection();
            this.topWallHit++;
          } else {
            this.rightWallHit = 0;
            this.leftWallHit = 0;
            this.topWallHit = 0;
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
              // console.log(`BRICK: z: (${this.bricks[cont].collider.getCenter().z - this.bricks[cont].depth/2}, ${this.bricks[cont].collider.getCenter().z + this.bricks[cont].depth/2}) BALL: z: (${this.ball.collider.min.z}, ${this.ball.collider.max.z})`)
              // console.log(`BALL position z: ${this.ball.collider.getCenter().z}`);
              if (this.ball.collider.getCenter().z < (this.bricks[cont].collider.getCenter().z + this.bricks[cont].depth/2)  && this.ball.collider.getCenter().z > (this.bricks[cont].collider.getCenter().z - this.bricks[cont].depth/2) ) {
                if (this.ball.position.x < this.bricks[cont].position.x &&
                  this.ball.collider.max.x > this.bricks[cont].collider.min.x) { // The ball is at the left side of the brick and hit with it
                  this.ball.calculateDirection(true);
                } else if (this.ball.position.x > this.bricks[cont].position.x &&
                  this.ball.collider.min.x < this.bricks[cont].collider.max.x) { // The ball is at the right side of the brick and hit with it
                  this.ball.calculateDirection(true);
                }
              } else {
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
    let distance;
    let side;
    if(this.ball.position.x <= this.platform.position.x) {
      distance = this.platform.position.x - this.ball.position.x;
      side = "-";
    }
    else {
      distance = this.ball.position.x - this.platform.position.x;
      side = "+";
    }

    if (this.MOVE_RIGHT && !this.MOVE_LEFT) {
      this.platform.moveRight(this.gameFieldWidth, this.PLATFORM_SPEED);
      if (this.ballPaused) {
        this.ball.moveWithPlatform(this.platform.position.x, distance, side);
      }
    }
    else if (!this.MOVE_RIGHT && this.MOVE_LEFT) {
      this.platform.moveLeft(this.gameFieldWidth, this.PLATFORM_SPEED);
      if (this.ballPaused) {
        this.ball.moveWithPlatform(this.platform.position.x, distance, side);
      }
    }
  }

  throwBall() {
    this.ballPaused = false;
  }
}

// Application modes
TheScene.NORMAL_CAMERA = 0;
