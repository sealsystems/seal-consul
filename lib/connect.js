'use strict';

const dns = require('dns');
const url = require('url');

const parse = require('parse-duration');

const log = require('seal-log').getLogger();

const getConsulId = require('./getConsulId');
const serviceVersionAsTag = require('./serviceVersionAsTag');

const connect = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.serviceName) {
    throw new Error('Service name is missing.');
  }
  if (!options.serviceUrl) {
    throw new Error('Service url is missing.');
  }
  if (!options.consulUrl) {
    throw new Error('Consul url is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  this.initialize(options);

  const serviceUrlObj = url.parse(options.serviceUrl);

  this.retryOptions = {
    retries: options.connectionRetries = (options.connectionRetries >= 0) ? options.connectionRetries : 5,
    minTimeout: options.waitTimeBetweenRetries || (0.5 * 1000),
    maxTimeout: options.waitTimeBetweenRetries || (60 * 1000),
    factor: options.waitFactor || 2,
    randomize: true
  };

  let tags = options.serviceTags || [];

  // Remove empty tags to work around a bug in getenv
  tags = tags.filter((tag) => {
    return (tag.length > 0);
  });

  tags.push(serviceVersionAsTag());

  const id = getConsulId({
    name: options.serviceName,
    port: serviceUrlObj.port,
    tags
  });

  dns.lookup(serviceUrlObj.hostname, (errLookupService, serviceAddress) => {
    if (errLookupService) {
      return callback(errLookupService);
    }

    this.options = {
      id,
      name: options.serviceName,
      port: parseInt(serviceUrlObj.port, 10),
      tags,
      check: {
        id: `service:${id}`,
        deregistercriticalserviceafter: '1h',
        notes: 'Service Heartbeat',
        ttl: options.ttl || '10s'
      }
    };

    if (serviceAddress) {
      this.options.address = serviceAddress;
    }

    dns.lookup(url.parse(options.consulUrl).hostname, (errLookupConsul, consulAddress) => {
      if (errLookupConsul) {
        return callback(errLookupConsul);
      }

      this.agent.service.register(this.options, (errRegister) => {
        if (errRegister) {
          return callback(errRegister);
        }

        dns.setServers([consulAddress]);

        const status = options.status || 'warn';

        this[status](() => {
          setInterval(() => {
            this.heartbeat((errHeartbeat) => {
              if (errHeartbeat && errHeartbeat.message.indexOf('CheckID') !== -1) {
                throw errHeartbeat;
              }
            });
          }, Math.floor(parse(this.options.check.ttl) / 2));

          this.checkLicense(options, (errCheck, validLicense) => {
            if (errCheck) {
              return callback(errCheck);
            }
            if (!validLicense) {
              log.fatal('Invalid license. Please consult your dealer.');
            }
            callback(null);
          });
        });
      });
    });
  });
};

module.exports = connect;
