const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const DATABASE = process.env.DB;

function ReplyHandler() {
  
  this.getReply = function(req, res) {
    const board = req.params.board;
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).find({_id: ObjectId(req.query.thread_id)}, 
                                {reported: 0,
                                 delete_password: 0,
                                 "replies.delete_password": 0,
                                 "replies.reported": 0})
      .toArray(function(err, data) {
        res.json(data[0]);
      });
      db.close();
    });
  };
  
  this.postReply = function(req, res) {
    const board = req.params.board;
    const newReply = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
    }
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).findAndModify(
        {_id: ObjectId(req.body.thread_id)}, {},
        {$set: {bumped_on: new Date()}, $push: {replies: newReply}},
        (err, data) => {
          if (err) return;
          res.redirect('/b/' + board + '/' + req.body.thread_id);
        });
       db.close();
      });
  };
  
  this.reportReply = function(req, res) {
    const board = req.params.board;
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).findAndModify(
        {_id: ObjectId(req.body.report_id), "replies._id": req.body.reply_id}, {},
        {$set: {"replies.$.reported": true}},
        (err, data) => {
          if (err) return;
          res.send('reported');
        });
        db.close();
      });
  };
  
  this.deleteReply = function(req, res) {
    const board = req.params.board;
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).findAndModify(
        {_id: ObjectId(req.body.thread_id), 
         replies: {$elemMatch:{_id: ObjectId(req.body.reply_id), 
                      delete_password: req.body.delete_password}}},{}, 
        {$set: {"replies.$.text": "[deleted]" }},
        (err, data) => {
          if (err) return;
          if (!data.value) res.send('incorrect password');
          else res.send('success');
        });
        db.close();
      });
  };


}

module.exports = ReplyHandler;