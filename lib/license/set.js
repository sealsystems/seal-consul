'use strict';

const async = require('async');

const set = function (options, license, callback) {
  if (!options) {
    throw new Error('Options are missing.');
  }

  if (!license) {
    throw new Error('License is missing.');
  }

  options.token = options.token || this.token || '';

  async.eachSeries(['certificate', 'license', 'signature'], (item, asyncDone) => {
    options.key = `dc/home/license/${item}`;
    options.value = license[item];

    this.agent.consul.kv.set(options, asyncDone);
  }, callback);
};

module.exports = set;
