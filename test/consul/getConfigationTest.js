'use strict';

const assert = require('assertthat');

const getConfiguration = require('../../lib/consul/getConfiguration');

suite('consul.getConfiguration', () => {
  test('is a function.', async () => {
    assert.that(getConfiguration).is.ofType('function');
  });

  test('throws error if agent is not initialized', async () => {
    await assert
      .that(async () => {
        await getConfiguration.call({});
      })
      .is.throwingAsync('Agent not initialized.');
  });

  test('returns an error if querying Consul failed.', async () => {
    const agent = {
      async self() {
        throw new Error('foo');
      }
    };

    await assert
      .that(async () => {
        await getConfiguration.call({ agent });
      })
      .is.throwingAsync('foo');
  });

  test('returns the config provided by Consul.', async () => {
    const agent = {
      async self() {
        return {
          Config: {
            Datacenter: 'dc1',
            Domain: 'consul.',
            NodeName: 'server1'
          }
        };
      }
    };

    const configuration = await getConfiguration.call({ agent });

    assert.that(configuration.Datacenter).is.equalTo('dc1');
  });

  // Please note: Depends on test above!
  test('returns the config from cache.', async () => {
    let wasCalled = false;

    const agent = {
      async self() {
        wasCalled = true;
      }
    };

    const configuration = await getConfiguration.call({ agent });

    assert.that(wasCalled).is.false();
    assert.that(configuration.Domain).is.equalTo('consul.');
  });
});
