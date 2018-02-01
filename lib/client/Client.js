'use strict';

const consul = require('consul');
const { defaults, once } = require('lodash');

const filterByStatus = require('../util/filterByStatus');
const getConsulOptions = require('../configuration/getConsulOptions');
const { KeyValue } = require('./keyValue');
const { Service } = require('./service');

class Client {
  async connect (options) {
    if (!options) {
      throw new Error('Options are missing.');
    }

    const consulOptions = await getConsulOptions(options);

    this.getConfiguration = once(this.getConfiguration);
    this.getHostname = once(this.getHostname);

    this.consul = consul(consulOptions);
    this.token = options.token;

    this.keyValue = new KeyValue({ consul: this.consul, token: this.token });
    this.service = new Service({ consul: this.consul, token: this.token });
  }

  async getConfiguration () {
    const data = await this.consul.agent.self();
    const configuration = data.Config;

    return configuration;
  }

  async getHostname () {
    const data = await this.consul.agent.self();
    const { NodeName, Datacenter, Domain } = data.Config;

    const hostname = `${NodeName}.node.${Datacenter}.${Domain.slice(0, -1)}`;

    return hostname;
  }

  async getNodes (options) {
    options = defaults({}, options, { token: this.token });

    const nodes = await this.consul.agent.consul.catalog.service.nodes(options);

    if (!options.status || !nodes) {
      return nodes;
    }

    const checks = await this.consul.agent.consul.health.checks(options);
    const filteredNodes = filterByStatus(options, nodes, checks);

    return filteredNodes;
  }
}

module.exports = Client;
