var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(3000, function(){
    console.log('listening on port 3000');
});
var io = socket(server);
var users = [];
var messages = [];

// Static files
app.use(express.static('public'));
// Socket setup & pass server
io.on('connection', function(socket) {

    socket.on('username', function(data) {
      console.log("server side " + data.username);
      socket.broadcast.emit('username', data.username);
      console.log(messages)
      console.log("server side " + data.id)
      var i;
      for (i = 0; i < messages.length; i++) {
        console.log("stevebert");
        console.log(messages[i].user);
        socket.emit('chat', messages[i]);
      }
    });

    console.log('connection', socket.id);

    // Handle chat event
    socket.on('chat', function(data){
        messages.push(data);
        io.sockets.emit('chat', data);
    });

    //broadcast if user is typing
    socket.on('typing', function(data) {
      socket.broadcast.emit('typing', data);
    });
});
