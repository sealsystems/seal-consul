'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

const consul = require('../lib/consul');
const lookup = require('../lib/lookup');

let resolveResults;
let resolveResultIndex;
const mockedLookup = proxyquire('../lib/lookup', {
  dnscache () {
    return {
      resolve (hostname, callback) {
        if (resolveResults[resolveResultIndex]) {
          callback(resolveResults[resolveResultIndex].err, resolveResults[resolveResultIndex].result);

          return resolveResultIndex++;
        }
        callback(null, []);
      }
    };
  }
});

suite('lookup', () => {
  setup((done) => {
    consul.retryOptions = {
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

  test('is a function.', (done) => {
    assert.that(lookup).is.ofType('function');
    done();
  });

  test('throws an error if hostname is missing.', (done) => {
    assert.that(() => {
      lookup();
    }).is.throwing('Hostname is missing.');
    done();
  });

  test('throws an error if callback is missing.', (done) => {
    assert.that(() => {
      lookup('foo');
    }).is.throwing('Callback is missing.');
    done();
  });

  test('returns ip address of host', (done) => {
    resolveResults = [
      {
        err: null,
        result: ['127.0.0.1']
      }
    ];
    mockedLookup.call(consul, 'hugo.local', (err, ip) => {
      assert.that(err).is.null();
      assert.that(ip).is.equalTo('127.0.0.1');
      done();
    });
  });

  test('returns error if service is not available', (done) => {
    mockedLookup.call(consul, 'hugo', (err) => {
      assert.that(err).is.not.null();
      assert.that(err.message).is.equalTo('No addresses found');
      done();
    });
  });

  test('retries after failure', (done) => {
    resolveResults = [
      {
        err: new Error('resolve error')
      },
      {
        err: null,
        result: ['127.0.0.1']
      }
    ];
    mockedLookup.call(consul, 'hugo', (err, ip) => {
      assert.that(err).is.null();
      assert.that(ip).is.equalTo('127.0.0.1');
      done();
    });
  });

  test('gives up after 5 retries', function (done) {
    this.timeout(5 * 1000);
    resolveResults = [
      {
        err: new Error('resolve error 1')
      },
      {
        err: new Error('resolve error 2')
      },
      {
        err: new Error('resolve error 3')
      },
      {
        err: new Error('resolve error 4')
      },
      {
        err: new Error('resolve error 5')
      },
      {
        err: new Error('resolve error 6')
      }
    ];
    mockedLookup.call(consul, 'hugo', (err) => {
      assert.that(err).is.not.null();
      assert.that(err).is.equalTo(resolveResults[5].err);
      done();
    });
  });
});
