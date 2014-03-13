var http = require('http');

var object = function(key, value, bucket) {
  if (arguments.length === 3) {
    this.key = key;
    this.value = value;
    this.bucket = bucket;
  } else {
    typeof key === 'string' ? this.key = key : this.value = key;
    this.bucket = value;
  }

  this.uri = this.bucket.uri + '/keys';
};

object.prototype.store = function(callback) {
  var options = {
    hostname: this.bucket.client.host,
    port: this.bucket.client.port,
    headers: {
      'content-type': 'application/json'
    }
  };

  options.method = this.key ? 'PUT' : 'POST';
  options.path = this.key ? this.uri + '/' + this.key : this.uri;

  var request = http.request(options, function(response) {
    response.on('data', function(data) {});

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  });

  request.on('error', function(error){
    callback(error);
  });

  request.write(JSON.stringify(this.value));
  request.end();
};

object.prototype.fetch = function(callback) {
  http.get(this.uri + '/' + this.key, function(response) {
    var data = '';

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      try {
        data = JSON.parse(data);
      } catch (error) {
        callback(error);
      }

      callback(null, data);
    });
  }).on('error', function(err) {
    callback(err);
  });
};

object.prototype.remove = function(key, callback) {
  var options = {
    hostname: this.client.host,
    port: this.client.port,
    method: 'DELETE',
    path: this.uri + '/keys/' + key
  };

  var request = http.request(options, function(response) {
    response.on('data', function(data) {});

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  }).on('error', function(err) {
    callback(err);
  });

  request.end();
};

module.exports = object;
