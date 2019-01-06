var user = require('../models/user.js');
// middleware function to check for logged-in users



//TODO : PLATIN ADD RENDER HERE
/**
 * var getLogin - renders login/signup page
 *
 */
var getLogin = function(req, res) {
  var message = req.query.error == "invalid" ? "Incorrect username or password" : req.query.error;
  res.render('login.ejs', {
    message: message
  });
};

//TODO: PLATIN ADD REDIRECTS ON SUCCESS

/**
 * var checkLogin - description
 *
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {String} req.body.username user's email
 * @param  {String} res.body.password
 * @return {type}     description
 */

var checkLogin = function(req, res) {
  var userInput = req.body;

  user.checkLogin(userInput.username, userInput.password,
    function(err, data) {

      if (err) {
        res.send(err);

        //res.redirect('/?error=' + encodeURI(err));
      } else if (data) {

        req.session.username = data.get('email');
        req.session.userId = data.get('id');
        req.session.profile = data;
        req.session.save();
        res.redirect('/feed');
      } else {
        res.send("Bad Login");
      }
    });
};



var getVisualizer = function(req, res) {
  res.render("friendvisualizer.ejs");
};


/**
 * var updateProfile - update user profile with new information
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {Object} req.body.email email string
 * @param  {Object} req.body.profile profile object
 * @param  {String} req.body.profile.first profile object
 * @param  {String} req.body.profile.last profile object
 * @param  {String} req.body.profile.birthday profile object
 * @param  {String[]} req.bo	dy.profile.affiliation profile object
 * @param  {String[]} req.body.profile.interests profile object
 *
 *
 * @param  {type} res response object
 */
var updateProfile = function(req, res) {
  var newProfile = req.body;
  user.updateProfile(req.body.id, req.body.profile, function(err, data) {
    if (err) {

    } else if (data) {


      req.session.profile = data;
      

    } else {

      res.status(400).send();
    }
  })
};

/**
 * var updateProfile - update user profile with new information
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {Object} req.body.profile profile object
 * @param  {String} req.body.profile.username string
 * @param  {String} req.body.profile.password string
 * @param  {String} req.body.profile.first string
 * @param  {String} req.body.profile.last string
 *
 *
 * @param  {type} res response object
 */

var createAccount = function(req, res) {
  var userData = req.body;
  user.createAccount(userData.email, userData.password, userData.firstname, userData.lastname, userData.birthday, function(err, data) {
    if (err) {
      res.send(err);
    } else if (data) {
      req.session.user = data;
	req.session.username = data.get('email');
        req.session.userId = data.get('id');
        req.session.profile = data;
        req.session.save();
      req.session.save();
     res.status(200).send();
      
    }
  });
};

/**
 * var createFriendRequest - send friend request from -> to
 *
 * @param  {String} req.session.username user's email address
 * @param  {UUID} req.body.toId target user's UUID
 *
 * @param  {type} res response object
 */
var createFriendRequest = function(req, res) {
  var userData = req.body;
  user.createFriendRequest(req.body.id, userData.toId, userData.fromName, function(err, data) {
    if (err) {
      res.status(400).send({
        status: "error",
        data: err
      });
    } else if (data) {
      res.status(200).send({status: "success", data: data});
    }
  });
};

/**
 * var getSearch - searches table by name
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {Object} req.body.name NAme query string, <= 2 elements
 *
 *
 * @param  {type} res response object
 */
var getSearch = function(req, res) {
  var userData = req.body.letter;
  user.searchByName(userData, function(err, data) {
    if (err) {
      res.send({
        status: "error",
        data: err
      });
    } else if (data) {
      res.status(200).send({
        status: "success",
        data: data
      });
    }
  });
}

/**
 * var updateFriendRequest - send friend request from -> to
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {UUID} req.body.toId target user's UUIDv5
 * @param  {String} req.body.status "accept" to accept, decline o.w.
 *@param  {Object} req.session
 *  @param  {String} req.session.username user's email address
 *
 * @param  {type} res response object
 */
var updateFriendRequest = function(req, res) {
  var userData = req.body;
  var fromName = req.session.profile.first + ' ' +  req.session.profile.last;
  user.updateFriendRequest(req.session.userId, fromName, req.session.profile.friends,
    userData.toId, userData.status, function(err, data) {
    if (err) {
      res.status(400).send({
        status: "error",
        data: err
      });
    } else if (data) {
      res.status(200).send();
    }
  });
};

/**
 * var postToWall - post on wall of toId, from username
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {String} req.session.username user's email address
 * @param  {uuid} req.body.toId target user's UUIDv5
 * @param  {String} req.body.status "accept" to accept, decline o.w.
 * @param  {String} req.body.content String content to put on wall
 *
 * @param  {type} res response object
 */
var postToWall = function(req, res) {
  var userData = req.body;
  var fullName = req.session.profile.first + " " + req.session.profile.last;
  user.createPost(req.session.userId, fullName, req.session.profile.friends, userData.toId,
    userData.content, "OTHER_POST",
    function(err, data) {
      if (err) {
        res.send({
          status: "error",
          data: err
        });
      } else if (data) {
        res.status(200).send();
      }
    });
};

/**
 * var createStatus - create a status update (for self!)
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {Object} req.session
 * @param  {String} req.session.username user's email address
 * @param  {UUID} req.session.userId user's own id
 * @param  {String} req.body.status "accept" to accept, decline o.w.
 * @param  {String} req.body.content String content to put on wall
 *
 * @param  {type} res response object
 */
var createStatus = function(req, res) {
  var userData = req.body;
  var fullName = req.session.profile.first + " " + req.session.profile.last;
  user.createStatus(req.session.userId, fullName, req.session.profile.friends,
     userData.content, "SELF_POST", function(err, data) {
    if (err) {
      res.send({
        status: "error",
        data: err
      });
    } else if (data) {
      res.status(200).send();
    }
  });
}

/**
 * var createStatus - create a status update (for self!)
 * @param  {Object} req
 * @param  {Object} req.body
 * @param  {Object} req.session
 * @param  {String} req.session.username user's email address
 * @param  {String} req.body.actionId id of action to comment on
 * @param  {String} req.body.content String content to place as comment
 *
 * @param  {type} res response object
 */
var addComment = function(req, res) {
  var userData = req.body;
  user.addComment(userData.id, userData.nameR, userData.actionId, userData.content, function(err, data) {
    if (err) {
      res.send({
        status: "error",
        data: err
      });
    } else if (data) {
      res.status(200).send();
    }
  });
}

/**
 * var getWall - getsWall for user who placed request
 * @param  {Object} req
 * @param  {Object} req.session
 * @param  {String} req.session.username user's email address
 *
 * @param  {type} res response object
 */
var getWall = function(req, res) {
  user.getWall(req.params.userId, 0, 5, function(err, wall) {
    if (err) {
      res.status(400).send({
        status: "error",
        data: err
      });
    } else if (wall) {

      res.render('wall.ejs', {
        wall: wall.feed,
        profile: wall,
        currentProfile: req.session.profile
      });
    }
  });
}

/**
 * var getWall - getsWall for user who placed request
 * @param  {Object} req
 * @param  {Object} req.session
 * @param  {String} req.session.username user's email address
 *
 * @param  {type} res response object
 */
var getWallData = function(req, res) {
  user.getWall(req.body.userId, req.body.start, req.body.end, function(err, wall) {
    if (err) {
      res.status(400).send({
        status: "error",
        data: err
      });
    } else if (wall) {
      res.status(200).send({
        data: wall
      });
    }
  });
}

/**
 * var getFeed - getsFeed for user who placed request
 * @param  {Object} req
 * @param  {Object} req.session
 * @param  {String} req.session.username user's email address
 *
 * @param  {type} res response object
 */
//send the number of relevant objects too
var getFeed = function(req, res) {

  var rtnData;

  user.getFeed(req.session.userId, req.body.startFeed, req.body.endFeed, function(err, feed) {

    if (err) {
      res.status(400).send({
        status: "error",
        data: err
      });
    } else if (feed) {


      res.render('main.ejs', {
        feed: feed,
        profile: req.session.profile
      });
    }
  });
}



var getFeedData = function(req, res) {

  var rtnData;

  user.getFeed(req.session.userId, req.body.startFeed, req.body.endFeed, function(err, feed) {

    if (err) {
      res.status(400).send({
        status: "error",
        data: err
      });
    } else if (feed) {


      res.status(200).send({
        status: "success",
        data: feed
      });
    }
  });
}

/**
 * var getProfile - getsProfile for user who placed request
 * @param  {Object} req
 * @param  {Object} req.session
 * @param  {String} req.session.username user's email address
 *
 * @param  {type} res response object
 */
var getProfile = function(req, res) {

  user.getProfile(req.body.id, function(err, data) {

    if (err) {
      res.send({
        status: "error",
        data: err
      });
    } else if (data) {


      res.redirect("/wall/" +req.body.id );

    }
  });
}

var userProfile = function(req, res) {
  res.render("userpage.ejs", {
    profile: req.session.otherprofile
  });
}


var logout = function(req, res) {

  if (req.session.username && req.cookies.sid) {
    res.clearCookie('sid');
    req.session = null;
  }
  res.redirect('/');
};


var getAffiliation = function(req, res) {

  // res.render


};


var visualizeFriends = function(req, res) {
  //loop through the returned list from John and do a foreach loop
  var json = {
    "id": "alice",
    "name": "Alice",
    "children": [{
      "id": "bob",
      "name": "Bob",
      "data": {},
      "children": [{
        "id": "dylan",
        "name": "Dylan",
        "data": {},
        "children": []
      }, {
        "id": "marley",
        "name": "Marley",
        "data": {},
        "children": []
      }]
    }, {
      "id": "charlie",
      "name": "Charlie",
      "data": {},
      "children": [{
        "id": "bob"
      }]
    }, {
      "id": "david",
      "name": "David",
      "data": {},
      "children": []
    }, {
      "id": "peter",
      "name": "Peter",
      "data": {},
      "children": []
    }, {
      "id": "michael",
      "name": "Michael",
      "data": {},
      "children": []
    }, {
      "id": "sarah",
      "name": "Sarah",
      "data": {},
      "children": []
    }],
    "data": []
  };
  res.send(json);
};

var getFriends = function(req, res) {

  var newFriends = {
    "id": "alice",
    "name": "Alice",
    "children": [{
      "id": "james",
      "name": "James",
      "data": {},
      "children": [{
        "id": "arnold",
        "name": "Arnold",
        "data": {},
        "children": []
      }, {
        "id": "elvis",
        "name": "Elvis",
        "data": {},
        "children": []
      }]
    }, {
      "id": "craig",
      "name": "Craig",
      "data": {},
      "children": [{
        "id": "arnold"
      }]
    }, {
      "id": "amanda",
      "name": "Amanda",
      "data": {},
      "children": []
    }, {
      "id": "phoebe",
      "name": "Phoebe",
      "data": {},
      "children": []
    }, {
      "id": "spock",
      "name": "Spock",
      "data": {},
      "children": []
    }, {
      "id": "matt",
      "name": "Matthe",
      "data": {},
      "children": []
    }],
    "data": []
  };
  res.send(newFriends);
};

var getVisualizerData = function(req, res){

 user.getVisualizerData(req.session.userId, function(err, data) {
      if (err) {
      res.send({
        status: "error",
        data: err
      });
    } else if (data) {


      res.status(200).send({data: data});

    }

  });


}

var getChat = function(req, res) {

  if(req.session.profile) {
	 res.render('chat.ejs', { profile: req.session.profile});
 } else {
   res.redirect("/");
 }
}

var routes = {
  getLogin: getLogin,
  checkLogin: checkLogin,
  getVisualizerData: getVisualizerData,
  createAccount: createAccount,
  logout: logout,
  createFriendRequest: createFriendRequest,
  updateFriendRequest: updateFriendRequest,
  postToWall: postToWall,
  createStatus: createStatus,
  updateProfile: updateProfile,
  getProfile: getProfile,
  addComment: addComment,
  getFeed: getFeed,
  visualizeFriends: visualizeFriends,
  getFriends: getFriends,
  getFeedData:getFeedData,
  getVisualizer: getVisualizer,
  getWall: getWall,
  getWallData: getWallData,
  getSearch: getSearch,
  getAffiliation: getAffiliation,
  userProfile: userProfile,
  getChat: getChat
};

module.exports = routes;
