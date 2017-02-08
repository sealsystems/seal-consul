'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');
const uuid = require('uuidv4');

const consul = require('../lib/consul');
const resolveService = require('../lib/resolveService');

let resolveResults;
let resolveResultIndex;
const mockedResolveService = proxyquire('../lib/resolveService', {
  dnscache () {
    return {
      resolveSrv (serviceName, callback) {
        if (resolveResults[resolveResultIndex]) {
          callback(resolveResults[resolveResultIndex].err, resolveResults[resolveResultIndex].result);
          return resolveResultIndex++;
        }
        callback(null, []);
      }
    };
  }
});

suite('resolveService', () => {
  const serviceName = uuid();
  const servicePort = 3000;

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
    assert.that(resolveService).is.ofType('function');
    done();
  });

  test('throws an error if service name is missing.', (done) => {
    assert.that(() => {
      resolveService();
    }).is.throwing('Service name is missing.');
    done();
  });

  test('throws an error if callback is missing.', (done) => {
    assert.that(() => {
      resolveService('foo');
    }).is.throwing('Callback is missing.');
    done();
  });

  test('returns list of hosts', (done) => {
    resolveResults = [
      {
        err: null,
        result: [{
          name: 'node1.node.dc1.consul',
          port: servicePort
        }]
      }
    ];
    mockedResolveService.call(consul, serviceName, (errResolve, addresses) => {
      assert.that(errResolve).is.null();
      assert.that(addresses).is.ofType('array');
      assert.that(addresses[0].name).is.equalTo('node1.node.dc1.consul');
      assert.that(addresses[0].port).is.equalTo(servicePort);
      done();
    });
  });

  test('returns empty array if service is not available', (done) => {
    mockedResolveService.call(consul, 'hugo', (err, addresses) => {
      assert.that(err).is.null();
      assert.that(addresses).is.ofType('array');
      assert.that(addresses.length).is.equalTo(0);
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
        result: [{ address: 'localhost', port: 4712 }]
      }
    ];
    mockedResolveService.call(consul, 'hugo', (err, addresses) => {
      assert.that(err).is.null();
      assert.that(addresses).is.equalTo(resolveResults[1].result);
      done();
    });
  });

  test('does not retry in case of ENODATA response', (done) => {
    const errNoData = new Error('Service not found');

    errNoData.code = 'ENODATA';
    resolveResults = [
      {
        err: errNoData
      }
    ];
    mockedResolveService.call(consul, 'hugo', (err) => {
      assert.that(err).is.equalTo(errNoData);
      done();
    });
  });

  test('gives up after 5 retries', (done) => {
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
    mockedResolveService.call(consul, 'hugo', (err) => {
      assert.that(err).is.not.null();
      assert.that(err).is.equalTo(resolveResults[5].err);
      done();
    });
  });
});
