// file.js 1.0.0 - LogCollector file storage
// http://somewhere
// (c) 2013 Jongpil Won
// Underscore may be freely distributed under the GPL v2

var fs = require('fs')
  , format = require('util').format

module.exports.createStorage = function(opts) {
  var p = opts.path;
  if (p[-1] !== '/') p += '/';

  app = {
    path: p,
    log: function(log_group, obj, callback) {
      if (obj instanceof Array) {
        var str = "";
        for (var i in obj) {
          str += JSON.stringify(obj[i]);
          str += "\n";
        }
        fs.appendFile(format("%s%s.log", this.path, log_group), str, callback);
      } else {
        fs.appendFile(format("%s%s.log", this.path, log_group), JSON.stringify(obj), callback);
      }
    }
  };

  return app;
}

