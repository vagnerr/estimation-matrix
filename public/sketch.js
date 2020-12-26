//const { text } = require("express");

var socket;
var visible     = false;
var lastdata    = null;    // Last dataset of all users choices
var lastchoice  = null;  // last choice by current user
const canvasX = 500;
const canvasY = 500;

function setup() {
  // put setup code here
  var canvas = createCanvas(canvasX,canvasY);
  canvas.parent('sketch-holder');

  background(51);
  resetCanvas();

  socket = io.connect();
  socket.on('mouse', newDrawing);
  socket.on('show', revealAll);
  socket.on('hide', hideCanvas);
  socket.on('reset', resetCanvas);
  socket.on('users', updateUsers)
}




function hideCanvas() {
  console.log('canvas Hidden');
  visible=false;

  redrawCanvas();
  // Put current users original choice back
  if (lastchoice) {
    fill(0, 255, 0);
    ellipse(lastchoice.x, lastchoice.y, 6, 6);
  }

}

function resetCanvas() {
  console.log('canvas reset');
  visible=false;

  redrawCanvas();
}

function redrawCanvas() {
  clear();
  background(51);
  stroke(255);
  line(167,0,167,500);  // TODO convert all this into fractions of canvasX/Y
  line(333,0,333,500);
  line(0,167,500,167);
  line(0,333,500,333);
  fill(255);
  textSize(16);
  text('Short & Simple', 5, 490);
  text('Simple', 175,490 );
  text('Long & Simple', 340, 490);
  text('Short', 5, 328);
  text('Average', 175,328 );
  text('Long', 340, 328);
  text('Short & Complex', 5, 163);
  text('Complex', 175,163 );
  text('Long & Complex', 340, 163);
}

function revealAll(data){
  console.log('Showing all marks');
  visible = true;
  lastdata = data;   // keep local copy for refreshes
  redrawCanvas() // deals with drawover
  console.log(data['last']);
  //map(data['last']).forEach((value, key) => {
  drawEstimates(data);
}

function drawEstimates(data) {
  for (var sid in data['last']) {
    if (data['last'][sid].x &&
      data['last'][sid].y &&
      data['name'][sid]) {
      noStroke();
      fill(0, 255, 0);
      ellipse(data['last'][sid].x, data['last'][sid].y, 6, 6);
      fill(0, 180, 50);
      textSize(8);
      text(
        data['name'][sid],
        data['last'][sid].x + 5,
        data['last'][sid].y
      );
    }
  }
}

function newDrawing(data){
  noStroke();
  fill(255,0,100);
  ellipse(data.x, data.y, 36,36);
}

function mouseClicked() {
  // Canvas check
  // Ignore the click if its OUTSIDE the canvas area
  // otherwise it will pickup the click events on the
  // control buttons
  if (   mouseX < 0
      || mouseY < 0
      || mouseX > canvasX
      || mouseY > canvasY){
        return
      }


  redrawCanvas();
  if( visible && lastdata ){
    console.log('drawing everything else');
    drawEstimates(lastdata);
  }
  console.log(mouseX + ', ' + mouseY);
  noStroke();
  fill(255,100,100);
  ellipse(mouseX, mouseY, 6, 6);

  var data = {
    x: mouseX,
    y: mouseY
  }
  lastchoice = data;
  socket.emit('mouse', data);
}
function draw() {
  // put drawing code here
  //background(51);
  //ellipse(mouseX, mouseY, 60, 60);
}

function sendCommand(message) {
  var data = {
    command: message
  }
  socket.emit('command', data);
}

function sendName() {
  console.log('sending name');
  var data = {
    name: document.getElementById('userName').value
  }
  socket.emit('name', data);
}

function updateUsers(data){
  console.log('Got user list data',data)
  var users = document.getElementById('users')
  console.log(typeof(data))
  var userhtml = ""
  for(var index in data){
    userhtml += `<li>${data[index]}</li>`
  }
  console.log(userhtml)
  users.innerHTML = "<p>UserData</p><ul>" + userhtml + "</ul>"

}