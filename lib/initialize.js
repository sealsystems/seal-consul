'use strict';

const consul = require('consul');

const getConsulOptions = require('./util/getConsulOptions');

const initialize = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.consulUrl) {
    throw new Error('Consul url is missing.');
  }

  if (this.agent) {
    return;
  }

  this.agent = consul(getConsulOptions(options)).agent;
  this.token = options.token;
};

module.exports = initialize;
