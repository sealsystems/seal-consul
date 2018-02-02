'use strict';

const retry = require('async-retry');
const shell = require('shelljs');

const waitForConsul = async function () {
  await retry(async () => {
    const { stdout } = shell.exec('docker logs consul', { silent: true });

    if (!stdout.includes('[INFO] agent: Synced node info')) {
      throw new Error('Consul not yet ready.');
    }
  });
};

module.exports = waitForConsul;
