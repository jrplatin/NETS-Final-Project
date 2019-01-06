var vogels = require('vogels');
var action = require('./action.js');
var conversation = require('../models/conversation.js');
var Joi = require('joi');
var _ = require('lodash');
var uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk')
AWS.config.loadFromPath('./config.json');

var dynamodb = new AWS.DynamoDB();
vogels.dynamoDriver(dynamodb);


//Define friend rec object
const rec_object = Joi.object().keys({
  userId: Joi.string().required(),
  mutualFriends: Joi.number().required()
});

const req_object = Joi.object().keys({
  userId: Joi.string().required(),
  name: Joi.string().required()
});

const action_object = Joi.object().keys(
  action.Action.schema
);

var Account = vogels.define('Account', {
  hashKey: 'id',

  // add the timestamp attributes (updatedAt, createdAt)
  timestamps: true,
  schema: {
    recFriends: Joi.array().items(rec_object).required(),
    friendRequests: Joi.array().items(req_object).required(),
    id: Joi.string().guid().required(),
    feed: Joi.array().items(action_object).required(),
    conversations: Joi.array().items(Joi.string().guid()).required(),
    password: Joi.string().required(),
    friends: Joi.array().items(Joi.string().guid()).required(),
    email: Joi.string().email().required(),
    first: Joi.string().required(),
    last: Joi.string().required(),
    birthday: Joi.string().required(),
    affiliation: Joi.string().required(),
    interests: Joi.array().items(Joi.string()).required()
  },
  indexes: [{
    hashKey: 'email',
    name: 'EmailIndex',
    type: 'global'
  }]
});


var checkLogin = function(email, password, route_callback) {
  Account.query(email).usingIndex('EmailIndex').exec(function(err, data) {
    if (err) {
      route_callback("Error logging in: " + err, null);
    } else if (data.Items[0] == null) {
      route_callback(null, null);
    } else {
      if (data.Items[0].get('password') == password) {
        var rtnData = data.Items[0];
        delete rtnData.attrs.password;
        route_callback(null, rtnData);
      } else {
        route_callback("Incorrect Password", null);
      }
    }
  });
};

//Validate that user posting is on their friends list.
var createPost = function(fromId, fromName, fromFriends, toId,
  action_content, action_type, route_callback) {
  Account.get(toId, function(err, recepientAcc) {
    if (err) {
      route_callback("Error finding friend's account: " + err);
    } else if (recepientAcc === null) {
      route_callback("Friend Account not found")
    } else {
      var toName = recepientAcc.get('first') + ' ' + recepientAcc.get('last');
      action.createAction(fromId, fromName, toId,
        toName, action_content, action_type,
        function(err2, actionData) {
          if (err2) {
            route_callback("Error creating status");
          } else if (actionData === null) {
            route_callback("Null action returned", null);
          } else {
            route_callback(null, actionData);
            var toFriends = recepientAcc.get('friends');
            var allFriends = _.union(fromFriends, toFriends, [fromId, toId]);
            allFriends.forEach(function(friendId) {
              Account.get(friendId, function(err, friendAcc) {
                var currFeed = friendAcc.get('feed') || [];
                currFeed.unshift(actionData.get('id'));
                friendAcc.set({
                  feed: currFeed
                });
                friendAcc.update(function(err) {
                  console.log(err);
                });
              });
            });
          }
        });
    }
  });
}

//Validate that user posting is on their friends list.
var createStatus = function(fromId, fromName, fromFriends,
  action_content, action_type, route_callback) {
  action.createAction(fromId, fromName, fromId,
    fromName, action_content, action_type,
    function(err, actionData) {
      if (err) {
        route_callback("Error creating status: " + err, null);
      } else if (actionData === null) {
        route_callback("Null action returned", null);
      } else {
        route_callback(null, actionData);
        if (!fromFriends) {
          fromFriends = [];
        }
        fromFriends.push(fromId);
        fromFriends.forEach(function(friendId) {
          console.log(friendId);
          Account.get(friendId, function(err, friendAcc) {
            var currFeed = friendAcc.get('feed');
            currFeed.unshift(actionData.get('id'));
            friendAcc.set({
              feed: currFeed
            });
            friendAcc.update(function(err) {
              console.log(err);
            });
          });
        });
      }
    });
}

var addComment = function(userId, fromName, actionId, comment_content, route_callback) {
  action.addComment(userId, fromName, actionId, comment_content, function(err, data) {
    if (err) {
      route_callback("Error creating status");
    } else if (data === null) {
      route_callback("Null action returned", null);
    } else {
      route_callback(null, data);
    }
  })
};

var searchByName = function(name, route_callback) {
  var nameArr = name.split(" ");
  Account
    .scan()
    .where('first').beginsWith(nameArr[0])
    .attributes(['first', 'last', 'id'])
    .limit(5)
    .returnConsumedCapacity()
    .exec(function(err, data) {
      if (err) {
        route_callback("Error searching table request " + err, null);
      } else if (data === null) {
        route_callback("Nothing found", null);
      } else {
        route_callback(null, data);
      }
    });
}

//This returns all conversations and members
var getConversationData = function (conversationList, route_callback) {
  var rtn = []
  conversationList.forEach(function(convo) {
    conversation.getConversationById(convo, function(err, data) {
      if (err) {
        route_callback("Error finding conversation" + err, null);
      } else if (data == null) {
        route_callback("Nothing found", null);
      } else {
        delete data.attrs.messages;
        rtn.push(data.attrs);
      }
    });
  });
  route_callback(null, rtn);
}

//Send friend friendRequests
var createFriendRequest = function(fromId, toId, toName, route_callback) {
  Account.get(fromId, function(err, acc) {
    if (err) {
      route_callback("Error sending friend request " + err, null);
    } else if (acc === null) {
      route_callback(null, null);
    } else {
      var currRequests = acc.get('friendRequests') || [];
      if (currRequests.includes(toId)) {
        route_callback("Already sent friend request");
      } else {
        currRequests.push({
          userId: toId,
          name: toName
        });
        console.log(currRequests);
        acc.set({
          friendRequests: currRequests
        });
        acc.update(function(err) {
          if (err) {
            route_callback("Error sending friend request " + err);
          } else {
            route_callback(null, "Added user " + toId + "to " + fromId);
          }
        });
      }
    }
  });
  //Lookup if friend reqest already in to's lis
  //Return 400 if already in friend listen
  //Return 200 if successfull ADD
  //Return ERR_CODE otherwise
}

//Send friend friendRequests
var updateFriendRequest = function(fromId, fromName, fromFriends, toId, status, route_callback) {
  Account.get(toId, function(err, acc) {
    if (err) {
      route_callback("Error updating friend request " + err, null);
    } else if (acc === null) {
      route_callback(null, null);
    } else {
      var currRequests = acc.get('friendRequests');
      if (!currRequests.includes(fromId)) {
        route_callback("No friend request found", null);
      } else {
        currRequests.splice(currRequests.indexOf(fromId), 1);
        acc.set({
          friendRequests: currRequests
        });
        if (status == "accept") {
          var currFriends = acc.get("friends");
          currFriends.push(fromId);
          acc.set({
            friends: currFriends
          });
          var action_content = fromName + " and " + acc.get('first') + " " + acc.get('last') + " became friends";
          user.createPost(fromId, fromName, fromFriends, toId,
            action_content, "NEW_FRIEND",
            function(err, data) {
              if (err) {
                console.log("failed to post");
              }
            });
          acc.update(function(err) {
            if (err) {
              route_callback("Error sending friend request " + err, null);
            } else {
              Account.get(fromId, function(err, acc) {
                if (err) {
                  route_callback("Error updating friend request " + err, null);
                } else if (acc === null) {
                  route_callback(null, null);
                } else {
                  currFriends.push(fromId);
                  acc.set({
                    friends: currFriends
                  });
                  acc.update(function(err) {
                    if (err) {
                      route_callback("Error sending friend request " + err, null);
                    } else {
                      route_callback(null, "Added user " + toId + "to " + fromId);
                    }
                  });
                }
              });
            }
          })
        } else {
          route_callback(null, "feature removed");
        }
      }
    }
  });
}

var removeFriend = function(fromId, toId, status, route_callback) {
  Account.get(toId, function(err, acc) {
    if (err) {
      route_callback("Error updating friend list " + err, null);
    } else if (acc === null) {
      route_callback(null, null);
    } else {
      var currFriends = acc.get('friends');
      if (!currFriends.includes(fromId)) {
        route_callback("No friend found", null);
      } else {
        currFriends.splice(currFriends.indexOf(fromId), 1);
        acc.set({
          friends: currFriends
        });
        acc.update(function(err) {
          if (err) {
            route_callback("Error removing friend " + err, null);
          } else {
            Account.get(fromId, function(err, acc2) {
              if (err) {
                route_callback("Error updating friend request " + err, null);
              } else if (acc2 == null) {
                route_callback(null, null);
              } else {
                currFriends = acc2.get('friends');
                currFriends.splice(currFriends.indexOf(fromId), 1);
                acc2.set({
                  friends: currFriends
                });
                acc2.update(function(err) {
                  if (err) {
                    route_callback("Error sending friend request " + err, null);
                  } else {
                    route_callback(null, "Added user " + toId + "to " + fromId);
                  }
                });
              }
            });
          }
        })

      }
    }
  });
}

var createAccount = function(email, password, firstName, lastName, birthday, route_callback) {
  Account.query(email).usingIndex('EmailIndex').exec(function(err, userExists) {


    if (err) {
      route_callback("Error creating user: " + err, null);
    } else if (userExists.Count > 0) {
      route_callback("A user with that userId already exists", null);
    } else {

      Account.create({
        recFriends: [],
        password: password, //Don't return!
        friendRequests: [],
        id: uuidv1(),
        feed: [],
	email: email,
	conversations: [],
        friends: [],
        first: firstName,
        last: lastName,
        birthday: birthday,
        affiliation: "None",
        interests: []
      }, function(err, acc) {


        if (err) {
          route_callback("Error creating user: " + err, null);
        } else {
          delete acc.attrs.password;
          route_callback(null, acc);
        }
      });
    }
  });
};

var updateProfile = function(userId, newProfile, route_callback) {
  Account.get(userId, function(err, oldProfile) {
    if (err) {
      route_callback("Error finding profile: " + err, null);
    } else if (!oldProfile) {
      route_callback("No user found!", null);
    } else {
      //Update Account with new profile information.
      //Can't update userId, password, or id
      delete newProfile.interests;
      var addProfile = {
        first: newProfile.first || oldProfile.attrs.first,
        last: newProfile.last || oldProfile.attrs.last,
        birthday: oldProfile.attrs.birthday,
        affiliation: newProfile.affiliation || oldProfile.attrs.affiliation,
        interests: newProfile.interests || oldProfile.attrs.interests
      };
      oldProfile.set(addProfile);
      oldProfile.update(function(err) {
        if (err) {
          route_callback("Error updating profile " + err, null);
        } else {
          route_callback(null, oldProfile);
        }
      });
    }
  });
};

/**
 * var getProfile - description
 *
 * @param  {type} userId          description
 * @param  {type} route_callback description
 * @return {type}                description
 */
var getProfile = function(userId, route_callback) {
  Account.get(userId, function(err, data) {
    if (err) {
      route_callback("Error finding user: " + err, null);
    } else if (data === null) {
      route_callback("User not found", null);
    } else {
      data = data.attrs;
      delete data.password;
      delete data.feed;
      route_callback(null, data);
    }
  });
};


var getVisualizerData = function(userId, route_callback) {
  Account.get(userId, function(err, data) {
    if (err) {
      route_callback("Error finding user: " + err, null);
    } else if (data == null) {
      route_callback("User not found", null);
    } else {
      var rtnObj = {
        id: userId,
        name: data.get('first'),
        children: [],
      }
      var currFriends = data.get('friends') || [];
      currFriends.forEach(function(friendId) {
        Account.get(friendId, function(err, friendAcc) {
          var friendObj = {
            id: friendId,
            name: friendAcc.get('first'),
            children: []
          }
          rtnObj.children.push(friendObj);
        });
      });
    }
    var currAff = data.get('affiliation') || "";
    Account
    .scan()
    .where('affiliation').gte(currAff)
    .attributes(['id','first'])
    .exec(function (err, data) {
      if (err) {
        route_callback("Error finding user: " + err, null);
      } else {
          data.Items.forEach(function(affAcc){
            if ( affAcc.attrs.id != userId) {
              var friendObj = {
                id: affAcc.get('id'),
                name: affAcc.get('first'),
                children: []
              }
              rtnObj.children.push(friendObj);
            }
          });
	  console.log(rtnObj);
          route_callback(null, rtnObj);
      }
    });
  });
};

/**
 * var getUserFeed - description
 *
 * @param  {type} userId          description
 * @param  {type} route_callback description
 * @return {type}                description
 */
var getFeed = function(userId, startIdx, endIdx, route_callback) {
  var promiseArr = [];

  Account.get(userId, function(err, data) {

    if (err) {
      route_callback("Error finding user: " + err, null);
    } else if (data === null) {
      route_callback("User not found", null);
    } else if (data.attrs.feed) {
      //Validate inputs
      var start = startIdx || 0;
      var end = endIdx || 5;
      data.attrs.feed.slice(start, end).forEach(function(actionId) {
        promiseArr.push(new Promise(function(resolve, reject) {
          action.getActionById(actionId, function(err2, actionData) {
            if (err2) {
              reject(err2);
            } else if (actionData === null) {
              reject("Action not found");
            } else {
              resolve(actionData.attrs);
            }
          });
        }));
      });
    }
    //Execute array of promises, maintains order
    Promise.all(promiseArr).then(function(value) {
      route_callback(null, value);
    }).catch(function(error) {
      route_callback(error);
    })
  });
};

/**
 * var getUserFeed - description
 *
 * @param  {type} userId          description
 * @param  {type} route_callback description
 * @return {type}                description
 */
var getWall = function(userId, startIdx, endIdx, route_callback) {
  var promiseArr = [];
  Account.get(userId, function(err, data) {

    if (err) {
      route_callback("Error finding user: " + err, null);
    } else if (data === null) {
      route_callback("User not found", null);
    } else if (data.attrs.feed && data.attrs.feed.length > 0) {
      //Validate inputs
      var start = startIdx || 0;
      var end = endIdx || 5;
      data.attrs.feed.slice(start, end).forEach(function(actionId) {
        promiseArr.push(new Promise(function(resolve, reject) {
          action.getActionById(actionId, function(err2, actionData) {
            if (err2) {
              reject("Error finding action: " + err2);
            } else if (actionData === null) {
              reject("Action not found");
            } else if (actionData.get('isWall') && actionData.get('toId') == userId) {
              resolve(actionData.attrs);
            } else {
              resolve();
            }
          });
        }));
      });
      //Execute array of promises, maintains order
      if (promiseArr.length > 0) {
        Promise.all(promiseArr).then(function(value) {
          data.attrs.feed = value.filter(value => value !== undefined);
          route_callback(null, data.attrs);
        }).catch(function(error) {
          route_callback(error);
        });
      }
    } else {
      data.attrs.feed = [];
      route_callback(null, data.attrs);
    }
  });
};

//Visible methods

var database = {
  checkLogin: checkLogin,
  createAccount: createAccount,
  createFriendRequest: createFriendRequest,
  updateFriendRequest: updateFriendRequest,
  createPost: createPost,
  createStatus: createStatus,
  searchByName: searchByName,
  updateProfile: updateProfile,
  addComment: addComment,
  getFeed: getFeed,
  getWall: getWall,
  getVisualizerData: getVisualizerData,
  getProfile: getProfile,
  Account: Account,
  // getSuggestedFriends: getSuggestedFriends,
  // getFriendRequests: getFriendRequests
};

module.exports = database;
