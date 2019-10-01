'use strict';

const assert = require('assertthat');

const getMember = require('../../lib/consul/getMember');

suite('consul.getMember', () => {
  test('is a function.', async () => {
    assert.that(getMember).is.ofType('function');
  });

  test('throws error if agent is not initialized', async () => {
    await assert
      .that(async () => {
        await getMember.call({});
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
        await getMember.call({ agent });
      })
      .is.throwingAsync('foo');
  });

  test('returns the member info provided by Consul.', async () => {
    const agent = {
      async self() {
        return {
          Config: {
            Datacenter: 'dc1',
            Domain: 'consul.',
            NodeName: 'server1'
          },
          Member: {
            Name: 'foobar',
            Addr: '10.1.10.12',
            Port: 8301
          }
        };
      }
    };

    const member = await getMember.call({ agent });

    assert.that(member).is.equalTo({
      Name: 'foobar',
      Addr: '10.1.10.12',
      Port: 8301
    });
  });
});
