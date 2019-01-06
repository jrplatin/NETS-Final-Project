var vogels = require('vogels');
var Joi = require('joi');

var Message = vogels.define('Message', {
  hashKey : 'id',

  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
  schema : {
    conversationId: Joi.string().guid().required(),
    content: Joi.string().required(),
    sender: Joi.string().guid().required(),
		id: Joi.string().guid().required()
  }
});

var getActionById = function(actionId, route_callback) {
	Action.get(actionId, function (err, action) {
		if (err) {
			route_callback("Error getting action: " + err, null);
		} else if (data === null) {
			route_callback(null, null);
		} else {
			route_callback(err, action);
		}
	});
};

var addComment = function(fromEmail, actionId, comment_content, route_callback) {
	Action.get(actionId, function (err, action) {
		if (err) {
			route_callback("Error getting action: " + err, null);
		} else if (data === null) {
			route_callback(null, null);
		} else {
			route_callback(err, action);
		}
	});
};

//this is internal
var createMessage = function(action_type, action_content,toId, route_callback) {
		Action.create({
      to:  toId,
      content: action_content,
			timestamp: Date.now(),
			type:action_type,
			isWall: true,
			id: uuidv1()
		}), function(err, action) {
			if (err) {
				route_callback("Error creating user: " + err, null);
			} else {
				route_callback(null, action);
			}
		};
	};



//Visible methods

// or globally use custom DynamoDB instance
// all defined models will now use this driver

var database = {
  Message: Message
	//Put Methods
	// updateProfile: updateProfile,
	// updateStatus: updateStatus,
	//Get Methods
	// getUserData: getUserData
};

module.exports = database;
