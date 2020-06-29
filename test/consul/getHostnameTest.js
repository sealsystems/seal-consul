'use strict';

const assert = require('assertthat');

const getHostname = require('../../lib/consul/getHostname');

suite('consul.getHostname', () => {
  test('is a function.', async () => {
    assert.that(getHostname).is.ofType('function');
  });

  test('returns an error if querying Consul failed.', async () => {
    const agent = {
      async self() {
        throw new Error('foo');
      }
    };

    await assert
      .that(async () => {
        await getHostname.call({ agent });
      })
      .is.throwingAsync('foo');
  });

  test('returns cached hostname.', async () => {
    let noCalled = 0;

    const agent = {
      async self() {
        noCalled++;
        return {
          Config: {
            NodeName: 'foo',
            Datacenter: 'bar'
          }
        };
      }
    };

    await getHostname.call({ agent });
    const hostname = await getHostname.call({ agent });

    assert.that(noCalled).is.equalTo(1);
    assert.that(hostname).is.equalTo('foo.node.bar.consul');
  });
});
