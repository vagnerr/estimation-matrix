var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("Server running");

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

var state = { name: {}, last: {}};

function newConnection(socket) {
  console.log('new connection: ' + socket.id);
  socket.on('mouse', mouseMsg);
  socket.on('command', processCommand);
  socket.on('name', receiveUserName);

  state[socket.id]={};

  function mouseMsg(data) {
    //socket.broadcast.emit('mouse', data);
    // io.sockets.emit('mouse', data);    // send to everyone including original sender
    console.log(data);
    state['last'][socket.id] = data;
  }

  function processCommand(data) {
    console.log('command: ' + data.command);

    switch(data.command) {
      case 'show':
        io.sockets.emit('show',state);
        break;
      case 'hide':
        io.sockets.emit('hide');
        break;
      case 'reset':
        io.sockets.emit('reset');
        state['last'] = {};   // Reset all the points, but keep names
        break;
      default:
        console.log('Unknown command: ' + data.command);
    }
    console.log('STATE: ');
    console.log(state);
  }

  function receiveUserName(data) {
    console.log('Name: ' + data.name);
    state['name'][socket.id] = data.name;
  }
}

