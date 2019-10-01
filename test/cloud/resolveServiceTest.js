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
    const service = await resolveService('otto');

    assert.that(service).is.ofType('object');
    assert.that(service.port).is.equalTo(3000);
    assert.that(service.name).is.equalTo('otto');
  });
});
