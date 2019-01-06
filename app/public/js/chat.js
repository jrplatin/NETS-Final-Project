  var socket = io.connect('http://localhost:8080');
$(function(){
  // get elements from DOM
  var message = document.getElementById('message');
  var output = document.getElementById('out');
  var username = document.getElementById('username');
  var isTyping = document.getElementById('typing');
  var bar = document.getElementById('bar');

  // set nickname
  socket.nickname = username.innerHTML;
  console.log("client username", username.innerHTML);
  console.log(socket.id);

//username event
  socket.emit('username', {
    username: socket.nickname,
    id: socket.id
  });

  //if keypress in message bar
  $("#message").keypress(function() {
    console.log(socket.nickname + ' is typing on client side');
    socket.emit('typing', {
      name: socket.nickname,
      room: bar.innerHTML
    });
  });

  //username change
  $("#username").change(function() {
  })

//emit a new room event
  $(".newRoom").click(function() {
    bar.innerHTML = this.innerHTML;
    output.innerHTML = "";
    console.log(this.innerHTML);
    socket.emit('join', {
      room: this.innerHTML,
      name: socket.nickname
    });
  });



  // Emit chat event
  $("#send").click(function(){
    if (message.value != ""){
      console.log(message.value);
    socket.emit('chat', {
        message: message.value,
        user:socket.nickname,
        room: bar.innerHTML
    });
    message.value = "";
  }
  });

  // Listen for chat event
  socket.on('chat', function(data) {
    console.log(data);
    //change color if its your chat
    if(data.user === socket.nickname) {
      output.innerHTML += '<p><b> Me: ' + data.message + '<b></p>';
    } else {
      output.innerHTML += '<p><strong>' + data.user + ': ' + data.message + '</strong></p>';
      //bar.innerHTML += data.user + ', ';
    }
    isTyping.innerHTML = "";
  });

  //listen for typing event
  socket.on('typing', function(data) {
    isTyping.innerHTML = '<p> <i>' + data + ' is typing... </i></p>'
  });

  //listen for username change
  socket.on('username', function(data) {
    console.log('new guy sent');
  });



});
