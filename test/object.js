var riak = require('../lib/client.js');
var chai = require('chai');
var expect = chai.expect;

describe('Iak Objects', function() {
  var client;

  beforeEach(function() {
    client = new riak.client();
  });

  afterEach(function() {
    client = null;
  });

  describe('store', function() {
    it('stores an object in Riak', function(done) {
      var doc = { bar: 'baz' };

      client.bucket('test').object('doc', doc).store(function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(204);
        done();
      });
    });
  });
});

