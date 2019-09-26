'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

let consulOptions;
const initialize = proxyquire('../lib/initialize', {
  consul(options) {
    consulOptions = options;

    return {};
  }
});

suite('initialize', () => {
  setup(() => {
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

  test('calls consul with the given options.', async () => {
    const context = {};

    await initialize.call(context, { consulUrl: 'http://foo:1234' });

    assert.that(consulOptions).is.equalTo({
      defaults: {
        token: ''
      },
      host: 'foo',
      promisify: true,
      port: 1234,
      secure: true
    });
  });
});
