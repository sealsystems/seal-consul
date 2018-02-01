'use strict';

const util = require('util');

const dnscache = require('dnscache')({
  enable: true,
  ttl: 1,
  cachesize: 1000
});

const droddel = require('@sealsystems/droddel');
const retry = require('async-retry');

const resolve = util.promisify(dnscache.resolve);

const droddelMap = {};

const lookup = async function (hostname) {
  if (!hostname) {
    throw new Error('Hostname is missing.');
  }

  if (!droddelMap[hostname]) {
    droddelMap[hostname] = droddel(async () => await resolve(hostname));
  }

  const addresses = await retry(
    async () => await droddelMap[hostname](),
    this.retryOptions
  );

  if (!addresses || addresses.length === 0) {
    throw new Error('No addresses found');
  }

  return addresses[0];
};

module.exports = lookup;
