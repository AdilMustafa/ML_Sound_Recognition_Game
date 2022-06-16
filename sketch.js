/*
  Data and machine learning for artistic practice
  Week 8
  
  Speech detection via sound recognition,
  
  instructions
  - you can alter the games settings by using the sliders
  - click play to start the game 
  - say up, down, left or right when the arrow is in the bottom right box
  - if your wrong/too slow it will reduce your health
  - if your correct you will gain health
  - when your health is 0 it will be game over and will display your score
  
*/

//sound recognition variables
let classifier,
  options = { probabilityThreshold: 0.9 },
  label = "",
  confidence = 0.0;

let mgr, font;

//game variables
let sceneNum,
  up, //up arrow
  down, //down arrow
  left, //left arrow
  right, //right arrow
  num, //random arrow selector
  upNum = 0, //up number
  downNum = 1, //down number
  leftNum = 2, //left number
  rightNum = 3, //right number
  Asize = 30, //arrow size
  xPos, //arrow X position
  yPos, //arrow Y position
  score, //scrolls the arrows
  space, //space between arrows
  Astorage = [], //arrow storage
  labelStorage = [], //arrow lable storage
  answer = false, //arrow is within answer area
  play = false; //when true the user can play the game

//slider variables
let quantitySlider,
  arrowQuantity = 100,
  healthSlider,
  health = 250,
  speedSlider,
  speedValue = 1;

function preload() {
  // load in classifier - provide options
  classifier = ml5.soundClassifier("SpeechCommands18w", options);
  font = loadFont("PressStart2P-Regular.ttf"); //loads font
  up = loadImage("up.png");
  down = loadImage("down.png");
  left = loadImage("left.png");
  right = loadImage("right.png");
}

function setup() {
  textFont(font); //applies font to text
  mgr = new SceneManager();
  mgr.addScene(SceneOne);
  mgr.addScene(SceneTwo);
  mgr.addScene(SceneThree);
  mgr.showNextScene();
}

function draw() {
  mgr.draw();
}

function SceneOne() {
  this.setup = function () {
    createCanvas(500, 500);
    sceneNum = 1;

    healthSlider = createSlider(100, 270, 175);
    healthSlider.position(10, height / 2);

    speedSlider = createSlider(1, 3, 2);
    speedSlider.position(165, height / 2);

    quantitySlider = createSlider(50, 500, 100);
    quantitySlider.position(320, height / 2);
  };

  this.draw = function () {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(30);
    text("SETTINGS", width / 2, 50);
    rect(50, height - 100, width - 100, 85);
    fill(0);
    text("PLAY", width / 2, height - 40);

    arrowQuantity = quantitySlider.value();
    health = healthSlider.value();
    speedValue = speedSlider.value();

    textAlign(LEFT);
    textSize(10);
    fill(255);
    text("Health:" + health, 20, height / 2);
    text("Start Speed:" + speedValue, 165, height / 2);
    text("Total Arrows:" + arrowQuantity, 320, height / 2);

    //checks if the mouse is over the start button
    let x = 50,
      y = height - 100,
      btn_Width = width - 100,
      btnHeight = 85;
    if (
      mouseX >= x &&
      mouseX <= x + btn_Width &&
      mouseY >= y &&
      mouseY <= y + btnHeight
    ) {
      push(); //draws a red border around the button
      stroke(255, 0, 0);
      strokeWeight(5);
      fill(255, 0);
      rect(x, y, btn_Width, btnHeight);
      cursor(HAND);
      pop();
      play = true;
    } else {
      cursor(ARROW);
      play = false;
    }
  };
}

function SceneTwo() {
  this.setup = function () {
    createCanvas(500, 500);
    sceneNum = 2; //scene number
    score = 0; //changes speed of falling arrows over time
    xPos = width - 63; //arrow X position
    yPos = 20; //arrow starting Y position
    space = 150; //space between each arrow
    //health = 250; //players starting health
    healthSlider.hide();
    speedSlider.hide();
    quantitySlider.hide();

    classifier.classify(gotResult);

    //pushes different arrows in the Astorage array & links them to a label
    for (let i = 0; i < arrowQuantity; i++) {
      num = int(random(0, 4));
      if (num == upNum) {
        Astorage.push(up);
        labelStorage.push("up");
      } else if (num == downNum) {
        Astorage.push(down);
        labelStorage.push("down");
      } else if (num == leftNum) {
        Astorage.push(left);
        labelStorage.push("left");
      } else if (num == rightNum) {
        Astorage.push(right);
        labelStorage.push("right");
      }
    }
    console.log(Astorage); //shows whats inside the array
    console.log(labelStorage); //shows whats inside the array
  };

  this.draw = function () {
    background(0);
    score += 1; //score changes over time
    cursor(ARROW);

    //changes the speed of yPos when score is a certain number
    if (score > 900 && score < 1800) yPos += speedValue + 2;
    else if (score > 1800) yPos += speedValue + 3;
    else {
      yPos += speedValue;
    }
    
    //detects if an arrow is in the bottom right area
    for (let i = 0; i < Astorage.length; i++) {
      image(Astorage[i], xPos, yPos - space * i, Asize, Asize);
      if (yPos - space * i < height && yPos - space * i > height - 75)
        answer = true;
      else {
        answer = false;
      }
      
      //if the answer is correct the user gains health
      if (answer && labelStorage[i] == label && health <= healthSlider.value())
        health++;
      
      //if the answer is incorrect player loses health
      else if (answer && labelStorage[i] !== label) health--;
    }
    UI(); //draws UI
  };
}

function SceneThree() {
  this.setup = function () {
    createCanvas(500, 500);
  };

  this.draw = function () {
    background(0);
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", width / 2, height / 2);

    textSize(20);
    text("Score " + score, width / 2, height / 2 + 40);
  };
}

function UI() {
  push();
  
  //draws onscreen lines
  stroke(255, 0, 0);
  strokeWeight(5);
  line(width / 1.25, 0, width / 1.25, height);
  line(width / 1.25, 75, width, 75);
  line(width / 1.25, height - 75, width, height - 75);
  noStroke();

  // draw label
  fill(255);
  textSize(40);
  textAlign(CENTER);
  text(label, 0, 200, width, 50);

  // draw confidence
  textSize(20);
  textAlign(LEFT);
  text(confidence, 10, 470, width - 10, 20);
  
  //draw health bar and score
  textSize(12);
  text("Score:" + score, 10, 20);
  text("Health: ", 10, height - 10);
  fill(255, 0, 0);
  rect(100, height - 23, health, 13);
  pop();

  if (health < 0) mgr.showScene(SceneThree); //switches to game over
}

function mousePressed() {
  if (sceneNum == 1 && play) mgr.showScene(SceneTwo); //plays the game
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  if (error) {
    // check for error
    return console.log(error);
  }

  console.log(results);

  // save these values
  label = results[0].label;
  confidence = nf(results[0].confidence, 0, 2); // Round the confidence to 0.01
}
