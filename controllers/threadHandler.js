const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const DATABASE = process.env.DB;

function ThreadHandler() {
  
  this.getThread = function(req, res) {
    const board = req.params.board;
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).find({},{delete_password: 0,
                                    reported: 0,
                                    "replies.delete_password": 0,
                                    "replies.reported": 0})
      .sort({bumped_on: -1})
      .limit(10)
      .toArray(function(err, data) {
        data.forEach((ele)=>{
          if(ele.replies.length > 3) {
            ele.replies = ele.replies.slice(0, 3);
          }
        });
        res.json(data);
      });
      db.close();
    });
  };
  
  this.postThread = function(req, res) {
    const board = req.params.board;
    const newThread = {
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    }
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).insert(newThread,(err, data) => {
          if (err) return;
          res.redirect('/b/' + board + '/');
        });
        db.close();
      });
  
  };
  
  this.reportThread = function(req, res) {
    const board = req.params.board;
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).findAndModify(
        {_id: ObjectId(req.body.report_id)}, {},
        {$set: {reported: true}},
        (err, data) => {
          if (err) return;
          res.send('reported');
        });
        db.close();
      });
  };
  
  this.deleteThread = function(req, res) {
    const board = req.params.board;
    MongoClient.connect(DATABASE, function(err, db) {
      db.collection(board).findAndModify(
        {_id: ObjectId(req.body.thread_id), delete_password: req.body.delete_password},
        {}, {},
        {remove: true},
        (err, data) => {
          if (err) return;
          if (!data.value) res.send('incorrect password');
          else res.send('success');
        });
        db.close();
      });
  
  };


}

module.exports = ThreadHandler;