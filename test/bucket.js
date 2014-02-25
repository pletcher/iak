var riak = require('../lib/client.js');
var chai = require('chai');
var expect = chai.expect;

describe('Iak Buckets', function() {
  describe('bucket', function() {
    var client;

    beforeEach(function() {
      client = new riak.client();
    });

    afterEach(function() {
      client = null;
    });

    describe('keys', function() {
      it("lists a bucket's keys", function(done) {
        client.bucket('test').keys(function(err, keys) {
          expect(err).to.not.exist;
          expect(keys).to.eql(['count', 'doc']);
          done();
        });
      });
    });

    it("gets a bucket's properties", function(done) {
      client.bucket('test').getProps(function(err, props) {
        expect(err).to.not.exist;
        expect(props).to.eql(require('./test_props.json'));
        done();
      });
    });

    it("sets a bucket's properties", function(done) {
      client.bucket('test').setProps({ n_val: 4 }, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(204);

        client.bucket('test').getProps(function(err, props) {
          expect(props.n_val).to.equal(4);
          done();
        });
      });
    });

    it("resets a bucket's properties", function(done) {
      client.bucket('test').resetProps(function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(204);
        
        client.bucket('test').getProps(function(err, props) {
          expect(props.n_val).to.equal(3);
          done();
        });
      });
    });

    it('stores an object', function(done) {
      client.bucket('test').store('doc', { bar: 'baz' }, function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(204);
        done();
      });
    });

    it('fetches an object', function(done) {
      client.bucket('test').fetch('doc', function(err, doc) {
        expect(err).to.not.exist;
        expect(doc).to.eql({ bar: 'baz' });
        done();
      });
    });

    it('removes an object', function(done) {
      client.bucket('test').remove('doc', function(err, status) {
        expect(err).to.not.exist;
        expect(status).to.equal(204);

        var doc = { bar: 'baz' };

        client.bucket('test').object('doc', doc).store(function(err, status) {
          expect(err).to.not.exist;
          expect(status).to.equal(204);
          done();
        });
      });
    });
  });
});

