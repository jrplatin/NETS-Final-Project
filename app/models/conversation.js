var vogels = require('vogels');
var Joi = require('joi');

var Conversation = vogels.define('Conversation', {
  hashKey : 'conversationId',

  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
  schema : {
    conversationId: Joi.string().guid().required(),
    recipients: Joi.array().items(Joi.string().guid()).required()
  }
});



//Visible methods

// or globally use custom DynamoDB instance
// all defined models will now use this driver

var database = {
  Conversation: Conversation
	//Put Methods
	// updateProfile: updateProfile,
	// updateStatus: updateStatus,
	//Get Methods
	// getUserData: getUserData
};

module.exports = database;
