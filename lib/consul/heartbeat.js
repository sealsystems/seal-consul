'use strict';

const log = require('@sealsystems/log').getLogger();

const heartbeat = async function() {
  const options = this.options.check;

  options.token = options.token || this.token;

  try {
    await this.agent.check[this.status](options);
  } catch (err) {
    log.debug('Exception while sending heartbeat.', { err });
  }
};

module.exports = heartbeat;
