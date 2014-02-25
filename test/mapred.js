var riak = require('../lib/client.js');
var chai = require('chai');
var expect = chai.expect;

describe('Iak MapRed', function() {
  var client;

  beforeEach(function() {
    client = new riak.client();
  });

  afterEach(function() {
    client = null;
  });
});

