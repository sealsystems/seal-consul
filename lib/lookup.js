'use strict';

const dnscache = require('dnscache')({
  enable: true,
  ttl: 1,
  cachesize: 1000
});

const retry = require('retry');
const droddel = require('seal-droddel');

const droddelMap = {};

const lookup = function (hostname, callback) {
  if (!hostname) {
    throw new Error('Hostname is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  const retryOperation = retry.operation(this.retryOptions);

  const faultTolerantLookup = (cb) => {
    if (!droddelMap[hostname]) {
      droddelMap[hostname] = droddel((throttleCallback) => {
        dnscache.resolve(hostname, throttleCallback);
      });
    }

    retryOperation.attempt(() => {
      droddelMap[hostname]((err, addresses) => {
        if (retryOperation.retry(err)) {
          return;
        }

        cb(err ? retryOperation.mainError() : null, addresses);
      });
    });
  };

  faultTolerantLookup((err, addresses) => {
    if (err) {
      return callback(err);
    }
    if (!addresses || addresses.length === 0) {
      return callback(new Error('No addresses found'));
    }
    return callback(null, addresses[0]);
  });
};

module.exports = lookup;
