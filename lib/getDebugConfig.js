'use strict';

let debugConfig;

const getDebugConfig = function (callback) {
  if (!this.agent) {
    throw new Error('Agent not initialized.');
  }
  if (!callback) {
    throw new Error('Missing callback.');
  }

  if (debugConfig) {
    return process.nextTick(() => {
      callback(null, debugConfig);
    });
  }

  this.agent.self((err, data) => {
    if (err) {
      return callback(err);
    }

    debugConfig = data.DebugConfig;
    callback(null, debugConfig);
  });
};

module.exports = getDebugConfig;
