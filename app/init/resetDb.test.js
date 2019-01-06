const {
  expect
} = require('chai');
const should = require('chai').should();

const uuidv1 = require('uuid/v1')

const vogels = require('vogels');
const {
  Account,
} = require('../models/user.js');
var user = require('../models/user.js');
var action = require('../models/action.js');
const {
  Action
} = require('../models/action.js');
const {
  Conversation
} = require('../models/conversation.js');
const AWS = require('aws-sdk');
var Joi = require('joi');

AWS.config.loadFromPath('./config.json');
var dynamodb = new AWS.DynamoDB();
vogels.dynamoDriver(dynamodb);

var sampleUserId = "1256a360-0175-11e9-948b-b1ffe61884a2";
var sampleUserId2 = "1256a361-0175-11e9-948b-b1ffe61884a2";


// describe('Delete Tables', function() {
//   describe('Delete Account Table', function() {
//     it('Should successfully delete table', function() {
//       Account.deleteTable(function(err) {
//         if (err) {
//           console.log(err);
//         }
//         should.not.exist(err);
//
//       });
//     });
//   });
//   describe('Delete Action Table', function() {
//     it('Should successfully delete table', function() {
//       Action.deleteTable(function(err) {
//         should.not.exist(err);
//       });
//     });
//   });
// });

// describe('Create Tables', function() {
//   describe('Creates Action and User Table', function() {
//     it('Should successfully create empty tables ', function() {
//       vogels.createTables(function(err) {
//         should.not.exist(err);
//       });
//     });
//   });
// });

describe('Load Sample Account Data', function() {
  describe('Loads Action and User Table Data', function() {

    it('Should successfully add 3 users', function() {
      Account.create({
        recFriends: [],
        password: "platin", //Don't return!
        friendRequests: [],
        id: sampleUserId,
        feed: [],
        friends: [],
        email: "jplatin@seas.upenn.edu",
        first: "Jacon",
        last: "Platin",
        birthday: "idk",
        affiliation: "Penn",
        interests: ["Food", "Meal Plan"]
      }, function(err, acc) {
        should.not.exist(err);
        should.exist(acc);
      });
      Account.create({
        recFriends: [],
        password: "robinov", //Don't return!
        friendRequests: [],
        id: uuidv1(),
        feed: [],
        friends: [],
        email: "brobinov@seas.upenn.edu",
        first: "Ben",
        last: "Robinov",
        birthday: "idk",
        affiliation: "Penn",
        interests: []
      }, function(err, acc) {
        should.not.exist(err);
        should.exist(acc);
      });
      Account.create({
        recFriends: [],
        password: "sarihan", //Don't return!
        friendRequests: [],
        id: sampleUserId2,
        feed: [],
        friends: [],
        email: "jsarihan@seas.upenn.edu",
        first: "John",
        last: "Sarihan",
        birthday: "idk",
        affiliation: "Penn",
          interests: []
        }, function(err, acc) {
          should.not.exist(err);
          should.exist(acc);
        });
      });
    });
  });

// describe('Load Message/Convo Test Data', function() {
//   describe('Loads Conversation and user Table Data', function() {
//     it('Should successfully add 3 users', function() {
//       var testId = uuidv1();
//       Conversation.create({
//         conversationId: testId,
//         recipients: [sampleUserId, sampleUserId2]
//       }, function(err, acc) {
//         should.not.exist(err);
//         should.exist(acc);
//       });
//       Message.create({
//         conversationId: testId,
//         content: "Hey there qt",
//         sender: sampleUserId2,
//         id: uuidv1()
//       }, function(err, acc) {
//         should.not.exist(err);
//         should.exist(acc);
//       });
//     });
//   });
// });

// describe('Load Action Test Data', function() {
//   describe('Loads Conversation and user Table Data', function() {
//     it('Create NEW_FRIEND post', function() {
//       user.createPost(sampleUserId, "Jacob Platin", [], sampleUserId2,
//         "Jacob Platin and John Sarihan became friends", "NEW_FRIEND",
//         function(err, acc) {
//           console.log(err);
//           should.not.exist(err);
//           should.exist(acc);
//         });
//     });
//     it('Create SELF_POST', function() {
//       user.createStatus(sampleUserId, "Jacob Platin", [],
//         "I hate school", "SELF_POST",
//         function(err, acc) {
//           should.not.exist(err);
//           should.exist(acc);
//         });
//     });
//     it('Create OTHER_POST', function() {
//       user.createPost(sampleUserId, "Jacob Platin", [], sampleUserId2,
//         "Happy birthday!", "OTHER_POST",
//         function(err, acc) {
//           should.not.exist(err);
//           should.exist(acc);
//         });
//     });
//     it('Create PROFILE_UPDATE', function() {
//       user.createStatus(sampleUserId, "Jacob Platin", [],
//         "Updated Profile!", "PROFILE_UPDATE",
//         function(err, acc) {
//           should.not.exist(err);
//           should.exist(acc);
//         });
//     });
//   });
// });
