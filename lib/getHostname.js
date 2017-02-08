'use strict';

let hostname;

const getHostname = function (options, callback) {
  // Ensure backward compatibilty by making options optional
  if (!callback) {
    callback = options;
    options = null;
  }

  if (!this.agent) {
    this.initialize(options);
  }

  if (hostname) {
    return process.nextTick(() => {
      callback(null, hostname);
    });
  }

  this.agent.self((err, data) => {
    if (err) {
      return callback(err);
    }

    hostname = `${data.Config.NodeName}.node.${data.Config.Datacenter}.${data.Config.Domain.slice(0, -1)}`;

    callback(null, hostname);
  });
};

module.exports = getHostname;
