'use strict';

const assert = require('assertthat');

const getHostname = require('../lib/getHostname');

suite('getHostname', () => {
  test('is a function.', async () => {
    assert.that(getHostname).is.ofType('function');
  });

  test('returns an error if querying Consul failed.', async () => {
    const agent = {
      async self () {
        throw new Error('foo');
      }
    };

    await assert.that(async () => {
      await getHostname.call({ agent });
    }).is.throwingAsync('foo');
  });

  test('returns the hostname provided by Consul.', async () => {
    const agent = {
      async self () {
        return {
          Config: {
            NodeName: 'foo',
            Datacenter: 'bar',
            Domain: 'baz.'
          }
        };
      }
    };

    const hostname = await getHostname.call({ agent });

    assert.that(hostname).is.equalTo('foo.node.bar.baz');
  });

  // Please note: Depends on test above!
  test('returns cached hostname.', async () => {
    let wasCalled = false;

    const agent = {
      async self () {
        wasCalled = true;
      }
    };

    const hostname = await getHostname.call({ agent });

    assert.that(wasCalled).is.false();
    assert.that(hostname).is.equalTo('foo.node.bar.baz');
  });
});
