'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

const consul = require('../lib/consul');

let resolveResults;
let resolveResultIndex;
const mockedConsul = proxyquire('../lib/consul', {
  dns: {
    resolve (hostname, callback) {
      if (resolveResults[resolveResultIndex]) {
        callback(resolveResults[resolveResultIndex].err, resolveResults[resolveResultIndex].result);
        return resolveResultIndex++;
      }
      callback(null, []);
    },
    lookup (hostname, callback) {
      if (!hostname) {
        return callback(null, null);
      }

      callback(null, '127.0.0.1');
    }
  }
});

suite('consul', () => {
  setup((done) => {
    mockedConsul.retryOptions = {
      retries: 5,
      minTimeout: 0.1 * 1000,
      maxTimeout: 0.2 * 1000,
      factor: 2,
      randomize: true
    };

    resolveResults = [];
    resolveResultIndex = 0;
    done();
  });

  test('is an object.', (done) => {
    assert.that(consul).is.ofType('object');
    done();
  });

  suite('pass', () => {
    test('is a function.', (done) => {
      assert.that(consul.pass).is.ofType('function');
      done();
    });

    test('throws an error if callback is missing.', (done) => {
      assert.that(() => {
        consul.pass();
      }).is.throwing('Callback is missing.');
      done();
    });

    test('sets status to "pass".', (done) => {
      consul.pass((err) => {
        assert.that(err).is.falsy();
        assert.that(consul.status).is.equalTo('pass');
        done();
      });
    });
  });

  suite('warn', () => {
    test('is a function.', (done) => {
      assert.that(consul.warn).is.ofType('function');
      done();
    });

    test('throws an error if callback is missing.', (done) => {
      assert.that(() => {
        consul.warn();
      }).is.throwing('Callback is missing.');
      done();
    });

    test('sets status to "warn".', (done) => {
      consul.warn((err) => {
        assert.that(err).is.falsy();
        assert.that(consul.status).is.equalTo('warn');
        done();
      });
    });
  });

  suite('fail', () => {
    test('is a function.', (done) => {
      assert.that(consul.fail).is.ofType('function');
      done();
    });

    test('throws an error if callback is missing.', (done) => {
      assert.that(() => {
        consul.fail();
      }).is.throwing('Callback is missing.');
      done();
    });

    test('sets status to "fail".', (done) => {
      consul.fail((err) => {
        assert.that(err).is.falsy();
        assert.that(consul.status).is.equalTo('fail');
        done();
      });
    });
  });
});
