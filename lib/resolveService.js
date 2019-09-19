'use strict';

const util = require('util');

const dnscache = require('dnscache')({
  enable: true,
  ttl: 1,
  cachesize: 1000
});

const droddel = require('@sealsystems/droddel');
const getenv = require('getenv');
const retry = require('async-retry');

const resolveSrv = util.promisify(dnscache.resolveSrv);

const consulDomain = getenv('CONSUL_DOMAIN', 'consul');
const droddelMap = {};

const resolveService = async function(serviceName) {
  if (!serviceName) {
    throw new Error('Service name is missing.');
  }

  const fullServiceName = `${serviceName}.service.${consulDomain}`;

  if (!droddelMap[fullServiceName]) {
    droddelMap[fullServiceName] = droddel(async () => await resolveSrv(fullServiceName));
  }

  const services = await retry(async (bail) => {
    try {
      return await droddelMap[fullServiceName]();
    } catch (e) {
      if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') {
        return bail(e);
      }
      throw e;
    }
  }, this.retryOptions);

  return services;
};

module.exports = resolveService;
