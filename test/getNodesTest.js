'use strict';

const assert = require('assertthat');
const host = require('docker-host')().host;
const uuid = require('uuidv4');

const consul = require('../lib/consul');
const getNodes = require('../lib/getNodes');

suite('getNodes', () => {
  const serviceName = uuid();

  suiteSetup((done) => {
    consul.connect({
      consulUrl: `http://${host}:8500`,
      serviceName,
      serviceUrl: `http://${host}:2999`
    }, done);
  });

  test('is a function.', (done) => {
    assert.that(getNodes).is.ofType('function');
    done();
  });

  test('test', (done) => {
    consul.getNodes({ service: serviceName }, (errNodes, nodes) => {
      assert.that(errNodes).is.falsy();
      assert.that(nodes).is.not.falsy();
      assert.that(nodes).is.ofType('array');
      assert.that(nodes.length).is.greaterThan(0);
      done();
    });
  });
});
