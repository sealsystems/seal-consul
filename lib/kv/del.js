'use strict';

const del = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.key) {
    throw new Error('Options.key is missing.');
  }

  if (!options.key.startsWith('dc/home/env')) {
    options.key = `dc/home/env/${options.key}`;
    options = Object.assign({}, options);
  }

  options.token = options.token || this.token || '';

  this.agent.consul.kv.del(options, (errDel) => {
    if (errDel) {
      return callback(errDel);
    }
    callback(null);
  });
};

module.exports = del;
