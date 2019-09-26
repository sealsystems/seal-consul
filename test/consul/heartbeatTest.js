'use strict';

const assert = require('assertthat');

const heartbeat = require('../../lib/consul/heartbeat');

suite('consul.heartbeat', () => {
  test('is a function.', async () => {
    assert.that(heartbeat).is.ofType('function');
  });
});
