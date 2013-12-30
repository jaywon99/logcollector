// LogCollector.js 1.0.0
// http://somewhere
// (c) 2013 Jongpil Won
// Underscore may be freely distributed under the GPL v2

exports = module.exports = {
  queues: {},
  queue_flush: 100,
  buffered: true,
  storage: null,
  handlers: [],
}

exports.configure = function(conf) {
  switch (conf.type) {
    case 'buffered':
      this.buffered = true;
      if (conf.flush_count !== undefined) {
        this.queue_flush = conf.flush_count;
      }
      break;
    case 'direct':
      this.buffered = false;
      break;
    default: throw "type should be one of 'buffered' or 'direct'";
  }
  switch (conf.storage) {
    case 'mongodb':
      this.storage = require('./storage/mongodb').createStorage(conf.storage_option);
      break;
    case 'file':
      this.storage = require('./storage/file').createStorage(conf.storage_option);
      break;
    default: throw "storage should be one of 'mongodb'";
  }
};

exports.makeUniqueId = function(d) {
  if (d === undefined) d = new Date();
  var n = "00000000000" + d.getTime().toString(16);
  n = n.substr(n.length-11);
  var l = Math.floor((1 + Math.random()) * 0x100000)
              .toString(16)
              .substring(1);
  n = n + l;
  return n.substr(0,4)+"-"+n.substr(4,4)+"-"+n.substr(8,4)+"-"+n.substr(12,4);
};


exports.addExtraHandler = function(handler) {
  if (handler === null || typeof(handler) !== 'function') throw "handler should be function";
  this.handlers[this.handlers.length] = handler;
};

exports.log = function(log_group, obj) {
  if (this.storage === undefined || this.storage === null) {
    throw "Please configure logcollector first.";
  }
  var d = new Date();

  if (obj['_created_at'] === undefined) {
    obj['_created_at'] = d;
  }
  if (obj['_generated_id'] === undefined) {
    obj['_generated_id'] = this.makeUniqueId(d);
  }
  if (obj['_log_type'] === undefined) {
    obj['_log_type'] = 'DEFAULT';
  }

  console.log(this.buffered);
  if (this.buffered) {
    if (this.queues[log_group] === undefined) {
      this.queues[log_group] = [obj];
    } else {
      this.queues[log_group][this.queues[log_group].length] = obj;
    }
    if (this.queues[log_group].length % this.queue_flush === 0) {
      var queue_backup = this.queues[log_group];
      this.queues[log_group] = [];
      this.storage.log(log_group, queue_backup, function(err) {
        if (err) {
          exports.queues[log_group] = exports.queues[log_group].concat(queue_backup);
        }
      });
    }
  } else {
    this.storage.log(log_group, obj, function(err) { });
  }

  for (var i in this.handlers) {
    this.handlers[i](log_group, obj);
  }

  return obj;
};

exports.flush = function() {
  if (this.storage === undefined || this.storage === null) {
    throw "Please configure logcollector first.";
  }

  for (var log_group in this.queues) {
    var queue_backup = this.queues[log_group];
    this.queues[log_group] = [];
    this.storage.log(log_group, queue_backup, function(err) {
      if (err) {
        exports.queues[log_group] = exports.queues[log_group].concat(queue_backup);
      }
    });
  }
}


