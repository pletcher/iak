var http = require('http');
var bucket = require('./bucket.js');

var counter = function(key, bucket) {
  this.key = key;
  this.bucket = bucket;
  this.uri = bucket.uri + '/counters/' + key;
};

counter.prototype.increment = function(inc, callback) {
  var options = {
    hostname: this.bucket.client.host,
    port: this.bucket.client.port,
    path: this.uri,
    method: 'POST'
  };

  inc = parseInt(inc, 10);

  var request = http.request(options, function(response) {
    var data = '';

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  }).on('error', function(err) {
    callback(err);
  });

  request.write(inc.toString());
  request.end();
};

counter.prototype.decrement = function(dec, callback) {
  this.increment(dec * -1, callback);
};

counter.prototype.value = function(callback) {
  http.get(this.uri, function(response) {
    var data = '';

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      callback(null, parseInt(data, 10));
    });
  }).on('error', function(err) {
    callback(err);
  });
};

module.exports = counter;
