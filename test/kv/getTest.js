'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const host = require('docker-host')().host;

const conectOptions = {
  consulUrl: `http://${host}:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('kv/get', () => {
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
    assert.that(consul.getKvs).is.ofType('function');
    done();
  });

  test('throws error if options are missing', (done) => {
    assert.that(() => {
      consul.getKvs();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws error if options.key is missing', (done) => {
    assert.that(() => {
      consul.getKvs({});
    }).is.throwing('Options.key is missing.');
    done();
  });

  test('get value', (done) => {
    const key = 'test/consulkv/kvgetTest';
    const value = 'kvgetTestvalue';

    consul.setKv({
      key,
      value
    }, (errSet, result) => {
      assert.that(errSet).is.falsy();
      assert.that(result).is.true();

      consul.getKvs({
        key,
        recurse: false
      }, (errGet, kvResult) => {
        assert.that(errGet).is.falsy();
        assert.that(kvResult).is.ofType('object');
        assert.that(kvResult.Value).is.equalTo(value);
        done();
      });
    });
  });

  test('keeps prefix if given', (done) => {
    const key = 'dc/home/env/test/consulkv/kvgetTest2';
    const value = 'kvgetTestvalue2';

    consul.setKv({
      key,
      value
    }, (errSet, result) => {
      assert.that(errSet).is.falsy();
      assert.that(result).is.true();

      consul.getKvs({
        key,
        recurse: false
      }, (errGet, kvResult) => {
        assert.that(errGet).is.falsy();
        assert.that(kvResult).is.ofType('object');
        assert.that(kvResult.Value).is.equalTo(value);
        done();
      });
    });
  });
});
