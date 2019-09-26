'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

const consul = require('../../lib/consul');

let resolveResults;
let resolveResultIndex;

const mockedConsul = proxyquire('../../lib/consul', {
  dns: {
    resolve(hostname, callback) {
      if (resolveResults[resolveResultIndex]) {
        callback(resolveResults[resolveResultIndex].err, resolveResults[resolveResultIndex].result);

        return resolveResultIndex++;
      }
      callback(null, []);
    },

    lookup(hostname, callback) {
      if (!hostname) {
        return callback(null, null);
      }

      callback(null, '127.0.0.1');
    }
  }
});

suite('consul.index', () => {
  setup(async () => {
    mockedConsul.retryOptions = {
      retries: 5,
      minTimeout: 0.1 * 1000,
      maxTimeout: 0.2 * 1000,
      factor: 2,
      randomize: true
    };

    resolveResults = [];
    resolveResultIndex = 0;
  });

  test('is an object.', async () => {
    assert.that(consul).is.ofType('object');
  });

  suite('pass', () => {
    test('is a function.', async () => {
      assert.that(consul.pass).is.ofType('function');
    });

    test('sets status to "pass".', async () => {
      await consul.pass();

      assert.that(consul.status).is.equalTo('pass');
    });
  });

  suite('warn', () => {
    test('is a function.', async () => {
      assert.that(consul.warn).is.ofType('function');
    });

    test('sets status to "warn".', async () => {
      await consul.warn();

      assert.that(consul.status).is.equalTo('warn');
    });
  });

  suite('fail', () => {
    test('is a function.', async () => {
      assert.that(consul.fail).is.ofType('function');
    });

    test('sets status to "fail".', async () => {
      await consul.fail();

      assert.that(consul.status).is.equalTo('fail');
    });
  });
});
