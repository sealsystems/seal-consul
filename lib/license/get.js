'use strict';

const getLicense = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }

  options.token = options.token || this.token;
  options.key = `dc/home/license/`;
  options.recurse = true;

  this.agent.consul.kv.get(options, (errKeys, keys) => {
    if (errKeys) {
      return callback(errKeys);
    }

    const result = {};

    keys = keys || [];
    keys.forEach((item) => {
      result[item.Key.substring(options.key.length)] = item.Value;
    });
    callback(null, result);
  });
};

module.exports = getLicense;

