'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const host = require('docker-host')().host;

const connectOptions = {
  consulUrl: `http://${host}:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('kv/set', () => {
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
    assert.that(consul.setKv).is.ofType('function');
  });

  test('throws error if key is missing', async () => {
    await assert.that(async () => {
      await consul.setKv({});
    }).is.throwingAsync('Key is missing.');
  });

  test('throws error if value is missing', async () => {
    await assert.that(async () => {
      await consul.setKv({ key: 'hugo' });
    }).is.throwingAsync('Value is missing.');
  });

  test('set a value', async () => {
    const key = 'test/kv/kvsetTest';

    const result = await consul.setKv({ key, value: 'kvsetTestvalue' });

    assert.that(result).is.true();
  });

  test('keeps prefix if given', async () => {
    const key = 'dc/home/env/test/kv/setTest2';

    const result = await consul.setKv({ key, value: 'kvsetTestvalue2' });

    assert.that(result).is.true();
  });
});
