'use strict';

const heartbeat = function (callback) {
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  const options = this.options.check;

  options.token = options.token || this.token;
  this.agent.check[this.status](options, callback);
};

module.exports = heartbeat;
