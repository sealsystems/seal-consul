'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

let consulOptions;
const initialize = proxyquire('../../lib/consul/initialize', {
  consul(options) {
    consulOptions = options;

    return {};
  }
});

suite('consul.initialize', () => {
  setup(async () => {
    consulOptions = null;
  });

  test('is a function.', async () => {
    assert.that(initialize).is.ofType('function');
  });

  test("throws an error if Consul's url is missing.", async () => {
    await assert
      .that(async () => {
        await initialize({});
      })
      .is.throwingAsync('Consul url is missing.');
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  test.skip('calls consul with the given options.', async () => {
    const context = {};

    await initialize.call(context, { consulUrl: 'http://foo:1234' });

    assert.that(consulOptions).is.equalTo({
      defaults: {
        token: ''
      },
      host: 'foo',
      promisify: true,
      port: 1234
    });
  });
});
