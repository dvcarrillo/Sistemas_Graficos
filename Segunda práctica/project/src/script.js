
/// Several functions, including the main

/// The scene graph
scene = null;
camera = null;
requestID = null;

/// The GUI information
GUIcontrols = null;

/// The object for the statistics
stats = null;

/// A boolean to know if the left button of the mouse is down
mouseDown = false;

/// The current mode of the application
applicationMode = TheScene.NORMAL_CAMERA;

/// It creates the GUI and, optionally, adds statistic information
/**
 * @param withStats - A boolean to show the statictics or not
 */
function createGUI(withStats) {
  GUIcontrols = new function () {
    // this.axis = true;
    this.transform = true;
    this.rotationHead = 0;
    this.rotationBody = 0;
    this.scaleLegs = 1;
    this.difficulty = 1;
  }

  var gui = new dat.GUI();

  var robotControls = gui.addFolder('Robot Controls');
  robotControls.add(GUIcontrols, 'scaleLegs', 1, 1.2, 0.1).name('Leg scale (%)');
  robotControls.add(GUIcontrols, 'rotationHead', -80, 80, 0.1).name('Head rotation');
  robotControls.add(GUIcontrols, 'rotationBody', -45, 30, 0.1).name('Body rotation');

  var difficultyControl = gui.addFolder('Game Difficulty');
  difficultyControl.add(GUIcontrols, 'difficulty', 1, 3).name('Difficulty');

  // The method  listen()  allows the height attribute to be written, not only read

  if (withStats)
    stats = initStats();
}

/// It adds statistics information to a previously created Div
/**
 * @return The statistics object
 */
function initStats() {

  var stats = new Stats();

  stats.setMode(0); // 0: fps, 1: ms

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  $("#Stats-output").append(stats.domElement);

  return stats;
}

/// It shows a feed-back message for the user
/**
 * @param str - The message
 */
function setMessage(str) {
  document.getElementById("Messages").innerHTML = "<h2 class='points-display'>" + str + "</h2>";
}

/// It processes the clic-down of the mouse
/**
 * @param event - Mouse information
 */
function onMouseDown(event) {
  if (event.ctrlKey) {
    // The Trackballcontrol only works if Ctrl key is pressed
    scene.getCameraControls().enabled = true;
  } else {
    scene.getCameraControls().enabled = false;
    if (event.button === 0) {   // Left button
      mouseDown = true;
      switch (applicationMode) {
        case TheScene.ADDING_BOXES:
          // scene.addBox (event, TheScene.NEW_BOX);
          break;
        case TheScene.MOVING_BOXES:
          // scene.moveBox (event, TheScene.SELECT_BOX);
          break;
        case TheScene.DELETING_BOXES:
          // scene.removeBox (event, TheScene.DELETE_BOX);
          break;
        default:
          applicationMode = TheScene.NO_ACTION;
          break;
      }
    } else {
      setMessage("");
      applicationMode = TheScene.NO_ACTION;
    }
  }
}

/// It processes the drag of the mouse
/**
 * @param event - Mouse information
 */
function onMouseMove(event) {
  if (mouseDown) {
    switch (applicationMode) {
      case TheScene.ADDING_BOXES:
      case TheScene.MOVING_BOXES:
        // scene.moveBox (event, TheScene.MOVE_BOX);
        break;
      case TheScene.DELETING_BOXES:
        break;
      default:
        applicationMode = TheScene.NO_ACTION;
        break;
    }
  }
}

/// It processes the clic-up of the mouse
/**
 * @param event - Mouse information
 */
function onMouseUp(event) {
  if (mouseDown) {
    switch (applicationMode) {
      case TheScene.ADDING_BOXES:
        // scene.addBox (event, TheScene.END_ACTION);
        break;
      case TheScene.MOVING_BOXES:
        // scene.moveBox (event, TheScene.END_ACTION);
        break;
      case TheScene.DELETING_BOXES:
        // scene.removeBox (event, TheScene.END_ACTION);
        break;
      default:
        applicationMode = TheScene.NO_ACTION;
        break;
    }
    mouseDown = false;
  }
}

/// It processes the wheel rolling of the mouse
/**
 * @param event - Mouse information
 */
function onMouseWheel(event) {
  if (event.ctrlKey) {
    // The Trackballcontrol only works if Ctrl key is pressed
    scene.getCameraControls().enabled = true;
  } else {
    scene.getCameraControls().enabled = false;
    if (mouseDown) {
      switch (applicationMode) {
        case TheScene.MOVING_BOXES:
          // scene.moveBox (event, TheScene.ROTATE_BOX);
          break;
        case TheScene.ADDING_BOXES:
          // scene.moveBox (event, TheScene.ROTATE_BOX);
          break;
      }
    }
  }
}

function onKeyDown(event) {
  switch (event.keyCode) {
    case 32:  //spacebar
      if(!scene.robot.isDead) 
        requestID? stop() : start();
      break;
    case 37:  //left arrow
      if (requestID && !scene.robot.isDead)
        scene.moveRobot(TheScene.TURN_LEFT);
      break;
    case 38:  //up arrow
      if (requestID && !scene.robot.isDead)
        scene.moveRobot(TheScene.MOVE_FORWARD);
      break;
    case 39:  //right arrow
      if (requestID && !scene.robot.isDead)
        scene.moveRobot(TheScene.TURN_RIGHT);
      break;
    case 40:  //down arrow
      if (requestID && !scene.robot.isDead)
        scene.moveRobot(TheScene.MOVE_BACKWARD);
      break;
    case 86:  //key v
      if (requestID && !scene.robot.isDead) {
        if (applicationMode === TheScene.NORMAL_CAMERA) {
          camera = scene.getEyeCamera();
          applicationMode = TheScene.EYE_CAMERA;
        } else {
          camera = scene.getCamera();
          applicationMode = TheScene.NORMAL_CAMERA;
        }
      }
      break;
  }
}

// It processes the window size changes
function onWindowResize() {
  scene.setCameraAspect(window.innerWidth / window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// It creates and configures the WebGL renderer
/**
 * @return The renderer
 */
function createRenderer() {
  var renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  return renderer;
}

/// It renders every frame
function render() {
  requestID = undefined;

  stats.update();
  scene.getCameraControls().update();
  scene.animate(GUIcontrols);

  if (this.scene.robot.currentEnergy > 0)
    this.setMessage("ENERGY: " + this.scene.robot.currentEnergy + "% · POINTS: " + this.scene.robot.currentPoints);
  else
    this.setMessage("DEAD");

  renderer.render(scene, camera);

  if(!scene.robot.isDead)
    start();
  else{
    stop();
    window.alert("Game over! Refresh the page to restart the game\n· Total points: " + scene.robot.currentPoints);
  }
}

// It starts the render
function start() {
  if (!requestID){
    requestID = window.requestAnimationFrame(render);
  }
}

// It stops the render
function stop() {
  if (requestID) {
    window.cancelAnimationFrame(requestID);
    requestID = undefined;
  }
}

// The main function
$(function () {
  // create a render and set the size
  renderer = createRenderer();
  // add the output of the renderer to the html element
  $("#WebGL-output").append(renderer.domElement);
  // liseners
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove, true);
  window.addEventListener("mousedown", onMouseDown, true);
  window.addEventListener("mouseup", onMouseUp, true);
  window.addEventListener("mousewheel", onMouseWheel, true);      // For Chrome an others
  window.addEventListener("DOMMouseScroll", onMouseWheel, true);  // For Firefox
  window.addEventListener("keydown", onKeyDown, false);

  // create a scene, that will hold all our elements such as objects, cameras and lights.
  scene = new TheScene(renderer.domElement);
  camera = scene.getCamera();
  requestID = undefined;

  createGUI(true);

  start();
});
