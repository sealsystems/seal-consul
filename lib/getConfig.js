'use strict';

let config;

const getConfig = function (callback) {
  if (!this.agent) {
    throw new Error('Agent not initialized.');
  }
  if (!callback) {
    throw new Error('Missing callback.');
  }

  if (config) {
    return process.nextTick(() => {
      callback(null, config);
    });
  }

  this.agent.self((err, data) => {
    if (err) {
      return callback(err);
    }

    config = data.Config;
    callback(null, config);
  });
};

module.exports = getConfig;
