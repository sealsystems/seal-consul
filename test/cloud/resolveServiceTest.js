'use strict';

const assert = require('assertthat');

const resolveService = require('../../lib/cloud/resolveService');

suite('cloud.resolveService', () => {
  test('throws error if service name is missing', async () => {
    try {
      await resolveService();
      throw new Error('X');
    } catch (err) {
      assert.that(err.message).is.equalTo('Service name is missing.');
    }
  });

  test('resolves service name and default port', async () => {
    const services = await resolveService('otto');

    assert.that(services).is.ofType('array');
    assert.that(services[0].port).is.equalTo(3000);
    assert.that(services[0].name).is.equalTo('otto');
  });
});
