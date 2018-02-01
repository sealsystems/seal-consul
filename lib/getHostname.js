'use strict';

let hostname;

const getHostname = async function (options) {
  if (!this.agent) {
    this.initialize(options);
  }

  if (hostname) {
    return hostname;
  }

  const data = await this.agent.self();

  hostname = `${data.Config.NodeName}.node.${data.Config.Datacenter}.${data.Config.Domain.slice(0, -1)}`;

  return hostname;
};

module.exports = getHostname;
