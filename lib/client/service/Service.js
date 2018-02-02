'use strict';

const EventEmitter = require('../../util/EventEmitter');
const RegisteredService = require('./RegisteredService');

class Service {
  constructor ({ consul, token }) {
    if (!consul) {
      throw new Error('Consul is missing.');
    }
    if (token === undefined) {
      throw new Error('Token is missing.');
    }

    this.consul = consul;
    this.token = token;
  }

  async register ({ serviceName, serviceUrl, serviceTags = [], status = 'warn' }) {
    if (!serviceName) {
      throw new Error('Service name is missing.');
    }
    if (!serviceTags) {
      throw new Error('Service name is missing.');
    }

    const { consul, token } = this;

    const registeredService = new RegisteredService({ consul, token });

    await registeredService.register({ serviceName, serviceUrl, serviceTags, status });

    return registeredService;
  }

  watch ({ dc, serviceName, serviceTag }) {
    if (!serviceName) {
      throw new Error('Service name is missing.');
    }

    const { consul } = this;

    const eventEmitter = new EventEmitter();

    const watch = consul.watch({
      method: consul.health.service,
      options: {
        dc,
        passing: true,
        service: serviceName,
        tag: serviceTag
      }
    });

    watch.on('change', (data) => {
      const nodes = data.map((item) => ({
        host: item.Node.Address,
        node: item.Node.Node.toLowerCase(),
        port: item.Service.Port
      }));

      eventEmitter.emit('change', nodes);
    });

    watch.on('error', (err) => {
      eventEmitter.emit('error', err);
    });

    return eventEmitter;
  }
}

module.exports = Service;
