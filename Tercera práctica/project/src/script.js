/**
 * Script
 * It adds the listeners to the scene and controls the animation
 * 
 * @author David Vargas, Andres Molina
 * 
 */

// Several functions, including the main

// The scene graph
scene = null;
camera = null;
requestID = null;

// The GUI information
GUIcontrols = null;

// The object for the statistics
stats = null;

// The current mode of the application
applicationMode = TheScene.NORMAL_CAMERA;

// It creates the GUI and, optionally, adds statistic information
/**
 * @param withStats - A boolean to show the statictics or not
 */
function createGUI(withStats) {
  GUIcontrols = new function () {
    this.transform = true;
    this.difficulty = 1;
  }

  var gui = new dat.GUI();

  var difficultyControl = gui.addFolder('Game Difficulty');
  difficultyControl.add(GUIcontrols, 'difficulty', 1, 3).name('Difficulty');

  // The method  listen()  allows the height attribute to be written, not only read

  if (withStats)
    stats = initStats();
}

// It adds statistics information to a previously created Div
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

// It shows a feed-back message for the user
/**
 * @param str - The message
 */
function setMessage(str) {
  document.getElementById("Messages").innerHTML = "<h2 class='points-display'>" + str + "</h2>";
}

// It processes the clic-down of the mouse
/**
 * @param event - Mouse information
 */
function onMouseDown(event) {
  if (applicationMode === TheScene.NORMAL_CAMERA) {
    scene.getCameraControls().enabled = true;
  } else {
    scene.getCameraControls().enabled = false;
  }
}

// It processes the wheel rolling of the mouse
/**
 * @param event - Mouse information
 */
function onMouseWheel(event) {
  if (applicationMode === TheScene.NORMAL_CAMERA) {
    scene.getCameraControls().enabled = true;
  } else {
    scene.getCameraControls().enabled = false;
  }
}

// It processes when the keys are pressed down
function onKeyDown(event) {
  switch (event.keyCode) {
    case 13: //enter
      if (requestID && scene.alive && scene.ballPaused)
        scene.throwBall();
      break;
    case 32:  //spacebar
      if (scene.alive)
        requestID ? stop() : start();
      break;
    case 37:  //left arrow
      if (requestID && scene.alive)
        scene.MOVE_LEFT = true;
      break;
    case 39:  //right arrow
      if (requestID && scene.alive)
        scene.MOVE_RIGHT = true;
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

// It processes when the keys are pressed down
function onKeyUp(event) {
  switch (event.keyCode) {
    case 37:  //left arrow
      if (requestID && scene.alive)
        scene.MOVE_LEFT = false;
      break;
    case 39:  //right arrow
      if (requestID && scene.alive)
        scene.MOVE_RIGHT = false;
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

// It renders every frame
function render() {
  requestID = undefined;

  stats.update();
  scene.getCameraControls().update();
  scene.animate(GUIcontrols);

  renderer.render(scene, camera);

  if (this.scene.alive && !this.scene.victory)
    start();
  else {
    if (this.scene.victory) {
      $("#screen-title").html("VICTORY");
      $("#screen-subtitle").html("You obtained " + scene.playerPoints + " points<br><br>Reload the page to play again");
      $("#game-container").css("display", "none");
      $("button").css("display", "none");
      $("select").css("display", "none");
      $("#game-title-screen").css("display", "block");
    } else {
      $("#screen-title").html("DEFEAT");
      $("#screen-subtitle").html("You obtained " + scene.playerPoints + " points<br><br>Reload the page to play again");
      $("#game-container").css("display", "none");
      $("button").css("display", "none");
      $("select").css("display", "none");
      $("#game-title-screen").css("display", "block");
    }
    stop();
  }
}

// It starts the render
function start() {
  if (!requestID) {
    requestID = requestAnimationFrame(render);
  }
}

// It stops the render
function stop() {
  if (requestID) {
    cancelAnimationFrame(requestID);
    requestID = undefined;
  }
}

// The main function
$(function () {
  $("#button-play").click(function () {
    // create a render and set the size
    renderer = createRenderer();
    // add the output of the renderer to the html element
    $("#WebGL-output").append(renderer.domElement);
    // listeners
    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("mousewheel", onMouseWheel, true);      // For Chrome an others
    window.addEventListener("DOMMouseScroll", onMouseWheel, true);  // For Firefox
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);
    // Fetch selected difficulty
    let difficulty = $("#lvl-selection").val();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new TheScene(renderer.domElement, difficulty);
    camera = scene.getCamera();
    requestID = undefined;
    createGUI(true);
    // Hide start screen elements
    $("#info-text").css("display", "none");
    $("#game-title-screen").css("display", "none");
    start();
  });
});
