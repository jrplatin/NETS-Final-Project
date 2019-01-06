var vogels = require('vogels');
var Joi = require('joi');
var uuidv1 = require('uuid/v1');

const comment_obj = Joi.object().keys({
  userId: Joi.string().guid().required(),
  content: Joi.string().required(),
  name: Joi.string().required()
});

var Action = vogels.define('Action', {
  hashKey: 'id',
  rangeKey: 'timestamp',
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps: true,
  schema: {
    fromId: Joi.string().guid().required(),
    fromName: Joi.string().required(),
    toId: Joi.string().guid().required(),
    toName: Joi.string().required(),
    comments: Joi.array().items(comment_obj).required(),
    content: Joi.string().required(),
    timestamp: Joi.date().iso().required(),
    type: Joi.string().valid('NEW_FRIEND', 'SELF_POST', "OTHER_POST", "PROFILE_UPDATE"),
    isWall: Joi.boolean().required(),
    id: Joi.string().guid().required()
  }
});

var getActionById = function(actionId, route_callback) {
  Action.query(actionId).exec(function(err, action) {
    if (err) {
      route_callback("Error getting action: " + err, null);
    } else if (action === null) {
      route_callback("No action found", null);
    } else {
      route_callback(null, action.Items[0]);
    }
  });
};

var addComment = function(fromId, fromName, actionId, comment_content, route_callback) {
  Action.query(actionId).exec(function(err, action) {
    if (err) {
      route_callback("Error getting action: " + err, null);
    } else if (action.Items[0] == null) {
      route_callback("No action found", null);
    } else {
      actionData = action.Items[0];
      var currComments = actionData.get('comments') || [];
      currComments.push({
        userId: fromId,
        name: fromName,
        content: comment_content
      });
      actionData.set({
        comments: currComments
      });
      actionData.update(function(err) {
        if (err) {
          route_callback("Error sending friend request " + err);
        } else {
          route_callback(null, "Added comment by " + fromId + " to " + actionId);
        }
      });
    }
  });
};

//this is internal
var createAction = function(fromId, fromName, toId,
  toName, action_content, action_type, route_callback) {
  Action.create({
    fromId: fromId,
    fromName: fromName,
    toId: toId,
    toName: toName,
    comments: [],
    content: action_content,
    timestamp: (new Date).toISOString(),
    type: action_type,
    isWall: true,
    id: uuidv1()
  }, function(err, acc) {
    if (err) {
      route_callback("Error creating user: " + err);
    } else if (acc) {
      route_callback(null, acc);
    } else {
      route_callback("SHOULDNT HAPPEN");
    }
  });
};

//var user = {
//		recFriends: [],
//		friendRequests: [],
//		id: uuid(),
//		feed: uuid[ACCTIONS],
//		friends: uuid[USERS]
//		profile: {
//			first: "",
//			last: "",
//			birthday: "DD/MM/YYY",
//			affiliation: "",
//			interests: String[],
//			email: "xxxx@yyy.com"
//		}
//}

//var action = {
//		timestamp: (new Date()).getTime(),
//		type: "",
//		isWall: true,
//		id: uuid()
//}


//Local methods:
//Push to Friend feeds
//


//Visible methods

// or globally use custom DynamoDB instance
// all defined models will now use this driver

var database = {
  Action: Action,
  createAction: createAction,
  addComment: addComment,
  getActionById: getActionById
  //Put Methods
  // updateProfile: updateProfile,
  // updateStatus: updateStatus,
  //Get Methods
  // getUserData: getUserData
};

module.exports = database;
