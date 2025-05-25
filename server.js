var express = require('express');
const { SocketAddress } = require('net');

var app = express();
var server = app.listen(3000);

app.use('/',express.static('lobby'));  // TODO: happy with 'lobby'
//app.use('/static',express.static('room'));  // TODO: rename to 'room' remove static data that now resides in 'lobby'
const path = require('path');

app.get('/room/:room', (req, res) => {  // TODO: happy with '/:room'? shoult it be '/room/:room'?
  res.sendFile(path.join(__dirname, 'room', 'index.html'));
});

console.log("Server running");

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

var state = { name: {}, last: {}, disconnect: {}, room: {} };  // TODO: should this be a class?

function newConnection(socket) {
  console.log('new connection: ' + socket.id);
  socket.on('mouse', mouseMsg);
  socket.on('command', processCommand);
  socket.on('name', receiveUserName);
  socket.on('disconnect', clientDisconnect);
  socket.on('room', setRoom);
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

    const target_room = state['room'][socket.id] || null;
    const filtered_state = getFilteredState(target_room);
    switch(data.command) {
      case 'show':
        io.to(target_room).emit('show',filtered_state);
        break;
      case 'hide':
        io.to(target_room).emit('hide');
        break;
      case 'reset':
        io.to(target_room).emit('reset');
        resetRoom(target_room);
        broadcastUserState()
        break;
      default:
        console.log('Unknown command: ' + data.command);
    }
    //console.log('STATE: ');
    console.log(state);
  }

  function resetRoom(target_room) {
    const users_in_room = Object.keys(state['room']).filter(id => state['room'][id] === target_room);

    for (let id of users_in_room) {
      state['last'][id] = null;  // Reset the last point for each user in the room
    }

  }

  function getFilteredState(target_room) {
    // Filter the state to only include users in the target room
    const users_in_room = Object.keys(state['room']).filter(id => state['room'][id] === target_room);


    let filtered_state = {
      name: {},
      last: {},
      disconnect: {},
      room: {}
    };

    for (let id of users_in_room) {
      filtered_state['name'][id] = state['name'][id];
      filtered_state['last'][id] = state['last'][id];
      filtered_state['disconnect'][id] = state['disconnect'][id];
      filtered_state['room'][id] = state['room'][id];
    }

    // console.log('raw state: ', state);
    // console.log('Filtered State: ', filtered_state);
    return filtered_state;
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
  function broadcastUserState() {  // TODO breakup by room
    let user_state = {}
    let target_room = state['room'][socket.id] || null;
    console.log(`broadcastUserState: target_room=${target_room}`);
    for (let id in state['name']){
      // If the user is in a room, only send them the users in that room
      if (!target_room || state['room'][id] !== target_room) {
        continue;  // skip users not in the same room
      }
      user_state[id]={
        name: state['name'][id],
        active: state['disconnect'][id]?false:true,
        voted: state['last'][id]?true:false,
        room: state['room']?state['room'][id]:null
      }
    }
    //console.log('emitting_state: ' + JSON.stringify(user_state)); // TODO bug: emitting all rooms on mouse vote.
    io.to(target_room).emit('users',user_state);
    return user_state
  }

  function removeClient(id) {
    //todo: check if the socketid has been re-established (is that even possible)
    console.log(`removing client: ${id}`)
    delete state['name'][id];
    delete state['last'][id];
    delete state['disconnect'][id];
    delete state['room'][id];
  }
  function setRoom(room) {
    console.log(`Client ${socket.id} joining room: ` + JSON.stringify(room));
    state['room'][socket.id] = room.room;
    socket.join(room.room);
    let user_state = broadcastUserState();
    //console.log(user_state);
    // socket.join(room);
    // state[socket.id].room = room;
  }
}

