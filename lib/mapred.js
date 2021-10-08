var http = require('http');

var mapred = function(bucket) {
  this.bucket = bucket;
  this.uri = bucket.client.baseUri + '/mapred';
  this.query = [];
  this._inputs = null;
};

mapred.prototype.inputs = function(obj) {
  this.inputs = obj;

  return this;
};

mapred.prototype.map = function(func) {
  if (typeof func === 'function') {
    func = func.toString();
  }

  this.query.append({ map: { language: "javascript", source: func }});

  return this;
};

mapred.prototype.reduce = function(func) {
  if (typeof func === 'function') {
    func = func.toString();
  }

  this.query.append({ reduce: { language: "javascript", source: func }});

  return this;
};

mapred.prototype.link = function(obj) {
  this.query.append({ link: obj });
};

mapred.prototype.exec = function(callback) {
  var options = {
    hostname: this.bucket.client.host,
    port: this.bucket.client.port,
    path: this.uri,
    method: 'POST',
    headers: { 'content-type': 'application/json' }
  }

  var body = { inputs: this.inputs, query: this.query };

  var request = http.request(options, function(response) {
    var data = '';

    response.on('error', function(err) {
      callback(err);
    });

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      callback(null, data);
    });
  });

  request.on('error', function(err) {
    callback(err);
  });

  request.write(JSON.stringify(body));
  request.end();
};

module.exports = mapred;
