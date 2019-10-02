'use strict';

const os = require('os');

const assert = require('assertthat');
const ipaddr = require('ipaddr.js');

const lookup = require('../../lib/cloud/lookup');

suite('cloud.lookup', () => {
  test('returns an ip address', async () => {
    const ip = await lookup(os.hostname());

    assert.that(ip).is.ofType('string');
    assert.that(ipaddr.isValid(ip)).is.true();
  });
});
