'use strict';

const dns = require('dns');
const url = require('url');
const util = require('util');

const dnscache = require('dnscache')({ enable: true, ttl: 1 });
const retry = require('async-retry');

const droddel = require('@sealsystems/droddel');

const { Client } = require('./client');

const resolve = util.promisify(dnscache.resolve);
const resolveSrv = util.promisify(dnscache.resolveSrv);

class Consul {
  constructor () {
    this.throttledResolve = {};
    this.throttledResolveSrv = {};
  }

  async connect ({ consulUrl, token = '' }) {
    if (!consulUrl) {
      throw new Error('Consul url is missing.');
    }

    const client = new Client();

    await client.connect({ consulUrl, token });
    await this.setAsDns({ consulUrl });

    return client;
  }

  async setAsDns ({ consulUrl }) {
    if (!consulUrl) {
      throw new Error('Consul url is missing.');
    }

    const { hostname } = url.parse(consulUrl);
    const address = await this.lookup(hostname);

    dns.setServers([address]);
  }

  async lookup (hostname) {
    if (!hostname) {
      throw new Error('Hostname is missing.');
    }

    if (!this.throttledResolve[hostname]) {
      this.throttledResolve[hostname] = droddel(async () => await resolve(hostname));
    }

    const addresses = await retry(
      async (bail) => {
        try {
          return await this.throttledResolve[hostname]();
        } catch (ex) {
          if (ex.code === 'ENOTFOUND') {
            return bail(new Error('No addresses found.'));
          }
          if (ex.code === 'ESERVFAIL') {
            return bail(ex);
          }

          throw ex;
        }
      }
    );

    if (!addresses || addresses.length === 0) {
      throw new Error('No addresses found.');
    }

    return addresses[0];
  }

  async resolveService (serviceName, consulDomain = 'consul') {
    if (!serviceName) {
      throw new Error('Service name is missing.');
    }

    const fullServiceName = `${serviceName}.service.${consulDomain}`;

    if (!this.throttledResolveSrv[fullServiceName]) {
      this.throttledResolveSrv[fullServiceName] = droddel(async () => await resolveSrv(fullServiceName));
    }

    const services = await retry(
      async (bail) => {
        try {
          return await this.throttledResolveSrv[fullServiceName]();
        } catch (e) {
          if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') {
            return bail(e);
          }
          throw e;
        }
      }
    );

    return services;
  }
}

module.exports = new Consul();
