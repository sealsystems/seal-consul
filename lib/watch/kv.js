'use strict';

const kv = function (options, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.key) {
    throw new Error('Key is missing.');
  }

  const watch = this.consul.watch({
    method: this.consul.kv.keys,
    options: {
      key: options.key,
      recurse: true,
      separator: '/'
    }
  });

  watch.on('change', (keylist) => {
    callback(null, keylist);
  });

  watch.on('error', (err) => {
    callback(err);
  });
};

module.exports = kv;
