'use strict';

const get = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.key) {
    throw new Error('Options.key is missing.');
  }

  if (!options.key.startsWith('dc/home/env')) {
    options = Object.assign({}, options);
    options.key = `dc/home/env/${options.key}`;
  }

  options.token = options.token || this.token;

  this.agent.consul.kv.get(options, (errKeys, keys) => {
    if (errKeys) {
      return callback(errKeys);
    }

    callback(null, keys);
  });
};

module.exports = get;
