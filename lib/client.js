var http = require('http');
var bucket = require('./bucket.js');

var client = function(protocol, port, host) {
  this.protocol = arguments[0] || 'http';
  this.port = arguments[1] || 8098;
  this.host = arguments[2] || '127.0.0.1';
  this.baseUri = this.protocol + '://' + this.host + ':' + this.port;

  var self = this;

  this.buckets = {
    list: function(callback) {
      http.get(self.baseUri + '/buckets?buckets=true', function(response) {
        var data = '';

        response.on('error', function(error) {
          callback(error);
        });

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
      });
    }
  }
};

client.prototype.ping = function(callback) {
  http.get(this.baseUri + '/ping', function(response) {
    var data = '';

    response.on('error', function(error) {
      callback(error);
    });

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      callback(null, data);
    });
  });
};

client.prototype.bucket = function(name) {
  var _bucket = new bucket(name, this);

  return _bucket;
};

exports.client = client;

