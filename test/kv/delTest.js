'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const host = require('docker-host')().host;

const connectOptions = {
  consulUrl: `http://${host}:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('kv/del', () => {
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
    assert.that(consul.delKvs).is.ofType('function');
  });

  test('throws error if key is missing', async () => {
    await assert.that(async () => {
      await consul.delKvs({});
    }).is.throwingAsync('Key is missing.');
  });

  test('deletes kv value', async () => {
    const key = 'test/kv/kvdelTest';
    const value = 'kvdelTestvalue';

    const result = await consul.setKv({ key, value });

    assert.that(result).is.true();

    const getResult1 = await consul.getKvs({ key });

    assert.that(getResult1.Value).is.equalTo(value);

    await consul.delKvs({ key });

    const getResult2 = await consul.getKvs({ key });

    assert.that(getResult2).is.undefined();
  });
});
