var http = require('http');
var bucket = require('./bucket.js');

var client = function(protocol, port, host) {
  if (arguments.length === 3) {
    this.protocol = protocol;
    this.port = port;
    this.host = host;
  } else if (arguments.length === 2) {
    this.protocol = 'http';
    this.port = protocol;
    this.host = port;
  } else if (typeof protocol === 'object') {
    this.protocol = protocol.protocol || 'http';
    this.port = protocol.port || 8098;
    this.host = protocol.host || '127.0.0.1';
  } else {
    this.protocol = 'http';
    this.port = 8098;
    this.host = '127.0.0.1';
  }

  this.baseUri = this.protocol + '://' + this.host + ':' + this.port;

  var self = this;

  this.buckets = {
    list: function(callback) {
      http.get(self.baseUri + '/buckets?buckets=true', function(response) {
        var data = '';

        response.on('data', function(d) {
          data += d;
        });

        response.on('end', function() {
          try {
            data = JSON.parse(data).buckets;
          } catch (error) {
            callback(error);
          }

          callback(null, data);
        });
      }).on('error', function(err) {
        callback(err);
      });
    }
  };

  return this;
};

client.prototype.ping = function(callback) {
  http.get(this.baseUri + '/ping', function(response) {
    var data = '';

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      callback(null, data);
    });
  }).on('error', function(err) {
    callback(err);
  });
};

client.prototype.bucket = function(name) {
  var _bucket = new bucket(name, this);

  return _bucket;
};

exports.client = client;
