var express = require('express');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("Server running");

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

var state = { name: {}, last: {}, disconnect: {}};

function newConnection(socket) {
  console.log('new connection: ' + socket.id);
  socket.on('mouse', mouseMsg);
  socket.on('command', processCommand);
  socket.on('name', receiveUserName);
  socket.on('disconnect', clientDisconnect);
  state[socket.id]={};

  broadcastUserState();

  function clientDisconnect(id){
    console.log(`Client Disconnect: ${socket.id}`)
    state['disconnect'][socket.id] = Date.now();
    // Give the client a little time to re-connect
    // before purging them completely
    var sockid = socket.id;
    setTimeout(function(){
      console.log(`Client Disconnect Timeout: ${sockid}`);
      removeClient(sockid);
      broadcastUserState();
    },120000)
  }


  function mouseMsg(data) {
    //socket.broadcast.emit('mouse', data);
    // io.sockets.emit('mouse', data);    // send to everyone including original sender
    console.log(data);
    state['last'][socket.id] = data;
    broadcastUserState()
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
        broadcastUserState()
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
    // sent all the data back on every keypress for the moment.
    // noisy and inefficient, but will do for POC
    let user_state = broadcastUserState()
    console.log(user_state)
  }

  /** Build user stats and push to all users
   *
   * @returns user_state object
   */
  function broadcastUserState() {
    let user_state = {}
    for (let id in state['name']){
      user_state[id]={
        name: state['name'][id],
        active: state['disconnect'][id]?false:true,
        voted: state['last'][id]?true:false
      }
    }
    io.sockets.emit('users',user_state);
    return user_state
  }

  function removeClient(id) {
    //todo: check if the socketid has been re-established (is that even possible)
    console.log(`removing client: ${id}`)
    delete state['name'][id];
    delete state['last'][id];
    delete state['disconnect'][id];
  }
}

