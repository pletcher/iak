var riak = require('../lib/client.js');
var chai = require('chai');
var expect = chai.expect;

describe('Iak Counter', function() {
  var client;

  beforeEach(function() {
    client = new riak.client();
  });

  afterEach(function() {
    client.bucket('test').resetProps(function(err, response) {});
    client = null;
  });

  describe('increment', function() {
    it('responds with 409 if `allow_mult != true`', function(done) {
      client.bucket('test').counter('count').increment(1, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(409);
        done();
      });
    });

    it('responds with 204 if `allow_mult == true`', function(done) {
      client.bucket('test').setProps({ 'allow_mult': true }, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(204);

        client.bucket('test').counter('count').increment(1, function(err, status) {
          expect(err).to.not.exist;
          expect(status).to.equal(204);

          client.bucket('test').counter('count').decrement(1, function(err, status) {
            expect(err).to.not.exist;
            expect(status).to.equal(204);

            done();
          });
        });
      });
    });
  });

  describe('value', function() {
    it("gets a counter's count", function(done) {
      client.bucket('test').counter('count').value(function(err, count) {
        expect(err).to.not.exist;
        expect(count).to.equal(0);
        done();
      });
    });
  });
});
