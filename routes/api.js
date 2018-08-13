/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ThreadHandler = require('../controllers/threadHandler.js');
var ReplyHandler = require('../controllers/replyHandler.js');

module.exports = function (app) {
  
  var threadHandler = new ThreadHandler();
  var replyHandler = new ReplyHandler();
  
  app.route('/api/threads/:board')
    .get(threadHandler.getThread)
    .post(threadHandler.postThread)
    .put(threadHandler.reportThread)
    .delete(threadHandler.deleteThread);
    
  app.route('/api/replies/:board')
    .get(replyHandler.getReply)
    .post(replyHandler.postReply)
    .put(replyHandler.reportReply)
    .delete(replyHandler.deleteReply);

};
