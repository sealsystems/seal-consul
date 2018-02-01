'use strict';

const Client = require('./client/Client');

const consul = {
  async connect (options) {
    if (!options) {
      throw new Error('Options are missing.');
    }

    const client = new Client();

    await client.connect(options);

    return client;
  }
};

module.exports = consul;
