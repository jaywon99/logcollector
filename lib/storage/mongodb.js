// mongodb.js 1.0.0 - LogCollector mongodb storage
// http://somewhere
// (c) 2013 Jongpil Won
// Underscore may be freely distributed under the GPL v2

var MongoClient = require('mongodb').MongoClient
  , mongo = require('mongodb')
  , format = require('util').format

module.exports.createStorage = function(opts) {
  app = {
    host: opts.host,
    port: opts.port,
    dbName: opts.dbName,
    log: function(log_group, obj, callback) {
      MongoClient.connect(format("mongodb://%s:%s/%s?w=1", this.host, this.port, this.dbname), function(err, db) {
        var collection = db.collection(log_group);

        collection.insert(obj, {w:0});
        db.close();
        if (typeof(callback) === 'function') {
          callback(err);
        }
      });
    }
  };

  return app;
}

