//const { text } = require("express");

var socket;

function setup() {
  // put setup code here
  createCanvas(500,500);
  background(51);
  resetCanvas();
  socket = io.connect('http://172.16.1.26:3000');
  socket.on('mouse', newDrawing);
  socket.on('show', revealAll);
  socket.on('hide', resetCanvas);
  socket.on('reset', resetCanvas);
}

function resetCanvas() {
  console.log('canvas reset');
  clear();
  background(51);
  stroke(255);
  line(167,0,167,500);
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
  resetCanvas() // deals with drawover
  console.log(data['last']);
  //map(data['last']).forEach((value, key) => {
  for (var sid in data['last']){
    if (
      data['last'][sid].x &&
      data['last'][sid].y &&
      data['name'][sid]
    ){
      noStroke();
      fill(0,255,0);
      ellipse(data['last'][sid].x,data['last'][sid].y,6,6);
      fill(0,180,50);
      textSize(8);
      text(
            data['name'][sid],
            data['last'][sid].x+5,
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

function mouseDragged() {
  console.log(mouseX + ', ' + mouseY);
  noStroke();
  fill(255,100,100);
  ellipse(mouseX, mouseY, 6, 6);

  var data = {
    x: mouseX,
    y: mouseY
  }
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