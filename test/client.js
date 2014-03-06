var riak = require('../lib/client.js');
var chai = require('chai');
var expect = chai.expect;

before(function(done) {
  var client = new riak.client();
  client.bucket('test').object('doc', { bar: 'baz' }).store(function(err, status) {
    expect(err).to.not.exist;
    expect(status).to.equal(204);
    done();
  });
});

after(function(done) {
  var client = new riak.client();
  client.bucket('test').remove('doc', function(err, status) {
    expect(err).to.not.exist;
    expect(status).to.equal(204);

    client.bucket('test').resetProps(function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.equal(204);
      done();
    });
  });
});

describe('Iak Client', function() {
  var client;

  beforeEach(function() {
    client = new riak.client();
  });

  afterEach(function() {
    client = null;
  });

  it('initalizes a Riak client with default port and host', function(done) {
    expect(client.protocol).to.equal('http');
    expect(client.port).to.equal(8098);
    expect(client.host).to.equal('127.0.0.1');
    done();
  });

  it('initializes a Riak client with custom port and host', function(done) {
    var client = new riak.client('https', 10000, '192.168.0.1');

    expect(client.protocol).to.equal('https');
    expect(client.port).to.equal(10000);
    expect(client.host).to.equal('192.168.0.1');
    done();
  });

  describe('ping', function() {
    it('pings Riak', function(done) {
      client.ping(function(err, ok) {
        expect(err).to.not.exist;
        expect(ok).to.equal('OK');
        done();
      });
    });
  });

  describe('buckets.list', function() {
    it('lists all buckets on a host', function(done) {
      client.buckets.list(function(err, buckets) {
        expect(err).not.to.exist;
        expect(buckets).to.contain('test');
        done();
      });
    });
  });
});

