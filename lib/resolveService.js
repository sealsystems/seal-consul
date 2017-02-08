'use strict';

const dnscache = require('dnscache')({
  enable: true,
  ttl: 1,
  cachesize: 1000
});
const droddel = require('seal-droddel');
const getenv = require('getenv');
const retry = require('retry');

const consulDomain = getenv('CONSUL_DOMAIN', 'consul');
const droddelMap = {};

const resolveService = function (serviceName, callback) {
  if (!serviceName) {
    throw new Error('Service name is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  const retryOperation = retry.operation(this.retryOptions);

  const faultTolerantResolve = (fullServiceName, cb) => {
    if (!droddelMap[fullServiceName]) {
      droddelMap[fullServiceName] = droddel((throttleCallback) => {
        dnscache.resolveSrv(fullServiceName, throttleCallback);
      });
    }

    retryOperation.attempt(() => {
      droddelMap[fullServiceName]((err, services) => {
        if (err && (err.code === 'ENOTFOUND' || err.code === 'ENODATA')) {
          retryOperation.retry(null);
          return cb(err);
        }
        if (retryOperation.retry(err)) {
          return true;
        }

        cb(err ? retryOperation.mainError() : null, services);
      });
    });
  };

  faultTolerantResolve(`${serviceName}.service.${consulDomain}`, callback);
};

module.exports = resolveService;
