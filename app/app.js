/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var session = require('express-session');
var routes = require('./routes/routes.js');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var aws = require('aws-sdk')
var multer = require('multer');
var multerS3 = require('multer-s3')
var socket = require('socket.io');
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// app.use(express.logger("default"));
app.use(cookieParser());

app.use(session({
 key: 'sid',
 secret: 'andreas_BAEberland',
 resave: true,
 saveUninitialized: false,
 cookie: {
	 secure: false,
     expires: 3600000
 }
}));

app.set('view engine', 'ejs');

app.use(function(req, res, next) {
	  res.locals.message = req.session.message;

	  next();
	});


// app.use(function (req, res, next){
//     if (req.cookies.sid && !req.session.user) {
//         res.clearCookie('sid');
//     }
//     next();
// });

var sessionChecker = function (req, res, next) {
    if (req.session.username && req.cookies.sid) {
        next();
    } else {
        res.redirect('/');
    }
};
var path = require('path')
app.use(express.static(path.join(__dirname, 'public')));





//Viewing Pages

app.get('/', function(req,res,next){
  if (req.session.username && req.cookies.sid) {
      res.redirect('/feed')
  } else {
    next();
  }
}, routes.getLogin);

app.post('/checklogin', routes.checkLogin);
app.post('/signup', routes.createAccount);
app.get('/logout', routes.logout);

app.use(sessionChecker);
app.get('/visualizer', routes.getVisualizer);
app.get('/feed', routes.getFeed);
app.post('/getFeedData', routes.getFeedData);
app.post('/getProfile',routes.getProfile);

app.get('/wall/:userId', routes.getWall);

app.get('/profile/:userId', routes.userProfile);

// //Upload data

// app.post('/getWall', routes.getWallData);

app.post('/createFriendRequest', routes.createFriendRequest);
app.post('/updateFriendRequest', routes.updateFriendRequest);

// var uploadAction = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'nets212g12',
//     metadata: function (req, file, cb) {
//       cb(null, {fieldName: file.fieldname});
//     },
//     key: function (req, file, cb) {
//       cb(null, req.session.userId + "profile." + file.mimetype)
//     }
//   })
// })

app.post('/postToWall', routes.postToWall);
app.post('/getWallData', routes.getWallData);
app.post('/createStatus', routes.createStatus);

const AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'nets212g12',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, req.session.userId + "profile.jpg")
    }
  })
})

app.post('/uploadProfilePicture', upload.single('profilePicture'), function(req, res, next) {
  res.status(200).send({status: "success", data: 'Successfully uploaded new profile picture'});
});

app.post('/updateProfile', routes.updateProfile);
app.post('/addComment', routes.addComment);

app.post('/getVisualizerData', routes.getVisualizerData);

app.get('/chat', routes.getChat);


// //Load Data
app.post('/getSearch', routes.getSearch);

// app.get('/suggestedFriends', routes.getSuggestedFriends);
//app.get('/feed', routes.feed);




//Visualizer Setup
app.get('/friendvisualization', routes.visualizeFriends);

app.get('/getFriends/:user', routes.getFriends);




//Bad request
app.use(function (req, res, next) {
	  res.status(404).send("You got lost! What are you doing :(");
	});


//chat
/* Run the server */
  var server = app.listen(8080, function(){
      console.log('listening on port 8080');
      console.log('Authors: John Sarihan (jsarihan), Jacob Paltin (jplatin), Benjamin Robinov (brobinov)');
  });
  var io = socket(server);
  var users = {};
  var messages = [];

  // Static files
  // Socket setup & pass server
  io.on('connection', function(socket) {


      socket.on('username', function(data) {
        console.log("server id " + data.id);
        socket.broadcast.emit('username', data.username);
        console.log(messages)
        console.log("server side " + data.username)
        users[data.username] = socket;


      });

//when a socket joins a room
      socket.on('join', function(data) {
        socket.join(data.room);
        socket.to(data.room).emit('user joined', data.nickname);
        if (messages[data.room] == null) {
          messages[data.room] = [];
        }
        for (var i = 0; i < messages[data.room].length; i++) {
          console.log(messages[data.room][i]);
          socket.emit('chat', messages[data.room][i]);
        }
      });

      console.log('connection', socket.id);

      // Handle chat event
      socket.on('chat', function(data) {
          messages[data.room].push(data);
          io.in(data.room).emit('chat', data);
      });

      //broadcast if user is typing
      socket.on('typing', function(data) {
        socket.to(data.room).emit('typing', data.name);
      });
  });

/* Run the server */

//console.log('Authors: John Sarihan (jsarihan), Jacob Paltin (jplatin), Benjamin Robinov (brobinov)');
//app.listen(8080);
//console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
