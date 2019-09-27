'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const host = require('docker-host')().host;

const connectOptions = {
  consulUrl: `http://${host}:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('kv/get', () => {
  suiteSetup(async () => await consul.connect(connectOptions));

  suiteTeardown(async () => {
    try {
      await consul.delKvs({
        key: 'test',
        recurse: true
      });
    } finally {
      await consul.agent.service.deregister(consul.options);
    }
  });

  test('is a function.', async () => {
    assert.that(consul.getKvs).is.ofType('function');
  });

  test('throws error if key is missing', async () => {
    await assert
      .that(async () => {
        await consul.getKvs({});
      })
      .is.throwingAsync('Key is missing.');
  });

  test('get value', async () => {
    const key = 'test/consulkv/kvgetTest';
    const value = 'kvgetTestvalue';

    const result = await consul.setKv({ key, value });

    assert.that(result).is.true();

    const kvResult = await consul.getKvs({ key, recurse: false });

    assert.that(kvResult).is.ofType('object');
    assert.that(kvResult.Value).is.equalTo(value);
  });

  test('keeps prefix if given', async () => {
    const key = 'dc/home/env/test/consulkv/kvgetTest2';
    const value = 'kvgetTestvalue2';

    const result = await consul.setKv({ key, value });

    assert.that(result).is.true();

    const kvResult = await consul.getKvs({ key, recurse: false });

    assert.that(kvResult).is.ofType('object');
    assert.that(kvResult.Value).is.equalTo(value);
  });
});
