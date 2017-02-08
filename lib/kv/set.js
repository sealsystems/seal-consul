'use strict';

const set = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.key) {
    throw new Error('Options.key is missing.');
  }
  if (!options.value) {
    throw new Error('Options.value is missing.');
  }

  if (!options.key.startsWith('dc/home/env')) {
    options = Object.assign({}, options);
    options.key = `dc/home/env/${options.key}`;
  }

  options.token = options.token || this.token;

  this.agent.consul.kv.set(options, (errSet, result) => {
    if (errSet) {
      return callback(errSet);
    }
    callback(null, result);
  });
};

module.exports = set;
