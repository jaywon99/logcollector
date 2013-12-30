// npm install mongodb
// npm install express
// bpm install underscore
var express = require('express');
var app = express();
var _ = require("underscore");
var logcollector = require("../lib/logcollector");

/*
logcollector.configure({
  type: 'buffered', // direct, buffered
  flush_count: 10,
  storage: 'mongodb',
  storage_option: {
    host: 'localhost',
    port: 27017,
    dbname: 'logCollector'
  }
});
*/

logcollector.configure({
  type: 'buffered', // direct, buffered
  flush_count: 10,
  storage: 'file',
  storage_option: {
    path: '/tmp/',
  }
});

logcollector.addExtraHandler(
  function(log_group, obj) {
    if (log_group === "hello") {
      // obj._log_type
      // obj._created_at
      // obj._generated_id
      console.log("EXTRA HANDLER - "+log_group);
      console.log(obj);
    }
  });

app.configure(function() {
  // app.use(express.bodyParser());
  app.use(express.json());
  app.use(express.urlencoded());
});

function handleCollection(req, res) {
  var log_group = req.params['log_group'];
  var log_type = req.params['log_type'];

  var param = _.extend(req.query || {}, req.body || {});
  param['_log_type'] = log_type;

  loggedObj = logcollector.log(log_group, param);

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(loggedObj['_generated_id']);
}

app.get('/log/:log_group/:log_type', function(req, res) {
  handleCollection(req, res);
});
app.post('/log/:log_group/:log_type', function(req, res) {
  handleCollection(req, res);
});
app.get('/log_flush', function(req, res) {
  logcollector.flush();
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("FLUSHED");
});

app.listen(1337);
console.log('Server running at http://127.0.0.1:1337/');

