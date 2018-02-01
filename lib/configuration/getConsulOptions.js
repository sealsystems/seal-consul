'use strict';

const url = require('url');

const getTlsOptions = require('./getTlsOptions');

const getConsulOptions = async function ({ consulUrl, token = '' }) {
  if (!consulUrl) {
    throw new Error('Consul url is missing.');
  }

  const { protocol, hostname, port } = url.parse(consulUrl);

  if (!['https:', 'http:'].includes(protocol)) {
    throw new Error('Wrong protocol in consul url provided.');
  }

  const consulOptions = {
    defaults: { token },
    host: hostname,
    promisify: true
  };

  if (port) {
    consulOptions.port = port - 0;
  }

  let tlsOptions = {};

  if (protocol === 'https:') {
    tlsOptions = await getTlsOptions();
  }

  return { ...consulOptions, ...tlsOptions };
};

module.exports = getConsulOptions;
