'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const host = require('docker-host')().host;

const conectOptions = {
  consulUrl: `http://${host}:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('setKv', () => {
  suiteSetup((done) => {
    consul.connect(conectOptions, (errConnect) => {
      assert.that(errConnect).is.null();
      done();
    });
  });

  suiteTeardown((done) => {
    consul.delKvs({
      key: 'test',
      recurse: true
    }, (errDel) => {
      assert.that(errDel).is.falsy();
      consul.agent.service.deregister(consul.options, done);
    });
  });

  test('is a function.', (done) => {
    assert.that(consul.setKv).is.ofType('function');
    done();
  });

  test('throws error if options are missing', (done) => {
    assert.that(() => {
      consul.setKv();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws error if options.key is missing', (done) => {
    assert.that(() => {
      consul.setKv({});
    }).is.throwing('Options.key is missing.');
    done();
  });

  test('throws error if options.value is missing', (done) => {
    assert.that(() => {
      consul.setKv({
        key: 'hugo'
      });
    }).is.throwing('Options.value is missing.');
    done();
  });

  test('set a value', (done) => {
    const key = 'test/kv/kvsetTest';

    consul.setKv({
      key,
      value: 'kvsetTestvalue'
    }, (errSet, result) => {
      assert.that(errSet).is.falsy();
      assert.that(result).is.true();
      done();
    });
  });

  test('keeps prefix if given', (done) => {
    const key = 'dc/home/env/test/kv/setTest2';

    consul.setKv({
      key,
      value: 'kvsetTestvalue2'
    }, (errSet, result) => {
      assert.that(errSet).is.falsy();
      assert.that(result).is.true();
      done();
    });
  });
});
