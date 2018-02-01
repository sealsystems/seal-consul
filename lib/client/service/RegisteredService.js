'use strict';

const url = require('url');

const parse = require('parse-duration');

const getConsulId = require('./getConsulId');
const serviceVersionAsTag = require('./serviceVersionAsTag');
const sleep = require('../../util/sleep');

class RegisteredService {
  constructor ({ consul, token }) {
    if (!consul) {
      throw new Error('Consul is missing.');
    }
    if (!token) {
      throw new Error('Token is missing.');
    }

    this.consul = consul;
    this.token = token;

    this.registerOptions = undefined;
    this.status = undefined;
  }

  async register ({ serviceName, serviceUrl, serviceTags, status }) {
    if (!serviceName) {
      throw new Error('Service name is missing.');
    }
    if (!serviceUrl) {
      throw new Error('Service url is missing.');
    }
    if (!serviceTags) {
      throw new Error('Service tags are missing.');
    }
    if (!status) {
      throw new Error('Status is missing.');
    }

    const { consul } = this;

    const { port } = url.parse(serviceUrl);
    const tags = [...serviceTags, serviceVersionAsTag()];
    const id = getConsulId({ name: serviceName, port, tags });

    this.registerOptions = {
      id,
      name: serviceName,
      port: port - 0,
      tags,
      check: {
        id: `service:${id}`,
        deregistercriticalserviceafter: '1h',
        notes: 'Service Heartbeat',
        ttl: '10s'
      }
    };

    await consul.agent.service.register(this.registerOptions);

    try {
      await this[status]();
    } catch (ex) {
      // Intentionally ignore errors here.
    }

    (async () => {
      const interval = Math.floor(parse(this.registerOptions.check.ttl) / 2);

      for (;;) {
        try {
          await this.heartbeat();
        } catch (ex) {
          if (ex.message.indexOf('CheckID') !== -1) {
            throw ex;
          }

          // Intentionally ignore errors here.
        }

        await sleep(interval);
      }
    })();
  }

  async pass () {
    this.status = 'pass';

    return await this.heartbeat();
  }

  async warn () {
    this.status = 'warn';

    return await this.heartbeat();
  }

  async fail () {
    this.status = 'fail';

    return await this.heartbeat();
  }

  async heartbeat () {
    const { check } = this.registerOptions;
    const { consul, token } = this;

    const options = { ...check, token };

    await consul.agent.check[this.status](options);
  }
}

module.exports = RegisteredService;
