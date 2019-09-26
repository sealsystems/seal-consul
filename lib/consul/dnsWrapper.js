'use strict';

const dns = require('dns');

const Cache = require('cache');

const dnsWrapper = {
  cache: new Cache(1000),

  async resolveSrv(hostname) {
    const v = this.cache.get(hostname);

    if (v) {
      return v;
    }

    return await new Promise((resolve, reject) => {
      dns.resolveSrv(hostname, (err, hosts) => {
        if (err) {
          return reject(err);
        }
        this.cache.put(hostname, hosts);

        return resolve(hosts);
      });
    });
  },

  async resolve(hostname, rrtype = 'A') {
    const v = this.cache.get(hostname);

    if (v) {
      return v;
    }

    return await new Promise((resolve, reject) => {
      dns.resolve(hostname, rrtype, (err, record) => {
        if (err) {
          return reject(err);
        }
        this.cache.put(hostname, record);

        return resolve(record);
      });
    });
  }
};

module.exports = dnsWrapper;
