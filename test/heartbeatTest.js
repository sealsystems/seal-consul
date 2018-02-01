'use strict';

const assert = require('assertthat');

const heartbeat = require('../lib/heartbeat');

suite('heartbeat', () => {
  test('is a function.', async () => {
    assert.that(heartbeat).is.ofType('function');
  });
});
