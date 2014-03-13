var http = require('http');
var object = require('./object.js');
var counter = require('./counter.js');
var mapred = require('./mapred.js');

var bucket = function(name, client) {
  this.name = name;
  this.client = client;
  this.uri = client.baseUri + '/buckets/' + name;
};

bucket.prototype.object = function(key, value) {
  var _object = new object(key, value, this);

  return _object;
};

bucket.prototype.counter = function(key) {
  var _counter = new counter(key, this);

  return _counter;
};

bucket.prototype.mapred = function() {
  var _mapred = new mapred(this);

  return _mapred;
};


/** Riak Bucket Methods */

bucket.prototype.keys = function(callback) {
  http.get(this.uri + '/keys?keys=true', function(response) {
    var data = '';

    response.on('data', function(d) {
      data += d;
    });

    response.on('end', function() {
      try {
        data = JSON.parse(data).keys;
      } catch (error) {
        callback(error);
      }

      callback(null, data);
    });
  }).on('error', function(err) {
    callback(err);
  });
};

bucket.prototype.getProps = function(options, callback) {
  var props = options.props || true;
  var keys = options.keys || false;

  if (!callback) callback = options;

  http.get(this.uri + '/props?props=' + props + '&keys=' + keys, function(response) {
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

      if (keys) {
        data = {
          props: data.props,
          keys: data.keys
        };
      } else {
        data = data.props;
      }

      callback(null, data);
    });
  }).on('error', function(err) {
    callback(err);
  });
};

bucket.prototype.setProps = function(props, callback) {
  var allowed = [
    'n_val',
    'allow_mult',
    'last_write_wins',
    'precommit',
    'postcommit',
    'r',
    'w',
    'dw',
    'rw',
    'backend'
  ];

  for (var prop in props) {
    if (allowed.indexOf(prop) === -1) {
      callback(new Error('Properties must be one of ' +
        JSON.stringify(allowed) + '.'));
    }

    if (prop === 'n_val' && typeof props[prop] !== 'number') {
      callback(new Error('The value of n_val must be an integer.'));
    } else if ((prop === 'allow_mult'
        || prop === 'last_write_wins')
        && typeof props[prop] !== 'boolean') {
      callback(new Error('The value of ' + prop + ' must be a boolean.'));
    }
  }

  props = JSON.stringify({ props: props });

  var options = {
    hostname: this.client.host,
    port: this.client.port,
    method: 'PUT',
    path: this.uri + '/props',
    headers: {
      'content-type': 'application/json'
    }
  };

  var request = http.request(options, function(response) {
    response.on('data', function(data) {});

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  });

  request.on('error', function(err) {
    callback(err);
  });

  request.write(props);
  request.end();
};

bucket.prototype.resetProps = function(callback) {
  var options = {
    hostname: this.client.host,
    port: this.client.port,
    method: 'DELETE',
    path: this.uri + '/props'
  };

  var request = http.request(options, function(response) {
    response.on('data', function(data) {});

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  });

  request.on('error', function(err) {
    callback(err);
  });

  request.end();
};


/** Riak Object Methods */

bucket.prototype.store = function(key, value, callback) {
  var options = {
    hostname: this.client.host,
    port: this.client.port,
    headers: {
      'content-type': 'application/json'
    }
  };

  if (arguments.length === 3) {
    options.method = 'PUT';
    options.path = this.uri + '/keys/' + key;
  } else {
    options.method = 'POST';
    options.path = this.uri + '/keys';
    callback = value;
    value = key;
    key = Object.getOwnPropertyNames(value)[0];
  }

  var request = http.request(options, function(response) {
    response.on('data', function(data) {
    });

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  });

  request.on('error', function(err) {
    callback(err);
  });

  request.write(JSON.stringify(value));
  request.end();
};

bucket.prototype.head = function(key, callback) {
  var options = {
    hostname: this.client.host,
    port: this.client.port,
    path: this.uri + '/keys/' + key,
    method: 'HEAD',
    headers: {
      'content-type': 'application/json'
    }
  };

  var request = http.request(options, function(response) {
    response.on('data', function(data) {});

    response.on('end', function() {
      var object = {
        status: response.statusCode,
        headers: response.headers
      };

      callback(null, object);
    });
  });

  request.on('error', function(error){
    callback(error);
  });

  request.end();
};

bucket.prototype.fetch = function(key, callback) {
  http.get(this.uri + '/keys/' + key, function(response) {
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

bucket.prototype.remove = function(key, callback) {
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


/** Riak Counter Methods */

bucket.prototype.increment = function(key, inc, callback) {
  var options = {
    hostname: this.client.host,
    port: this.client.port,
    method: 'POST',
    path: this.uri + '/counters/' + key,
  };

  var request = http.request(options, function(response) {
    response.on('data', function(data) {});

    response.on('end', function() {
      callback(null, response.statusCode);
    });
  }).on('error', function(err) {
    callback(err);
  });

  request.write(inc.toString());
  request.end();
};

bucket.prototype.getCount = function(key, callback) {
  http.get(this.uri + '/counters/' + key, function(response) {
    var data = '';

    response.on('error', function(error) {
      callback(error);
    });

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

module.exports = bucket;
