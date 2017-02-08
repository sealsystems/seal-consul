'use strict';

const consul = require('consul');

const getConsulOptions = require('../util/getConsulOptions');

const service = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.serviceName) {
    throw new Error('Service name is missing.');
  }

  const instance = consul(getConsulOptions(options));

  const watch = instance.watch({
    method: instance.health.service,
    options: {
      dc: options.dc,
      passing: true,
      service: options.serviceName,
      tag: options.serviceTag
    }
  });

  watch.on('change', (data) => {
    const nodes = [];

    data.forEach((item) => {
      nodes.push({
        host: item.Node.Address,
        node: item.Node.Node.toLowerCase(),
        port: item.Service.Port
      });
    });

    callback(null, nodes);
  });

  watch.on('error', (err) => {
    callback(err);
  });
};

module.exports = service;
