'use strict';

const url = require('url');

const getenv = require('getenv');

const tlscert = require('seal-tlscert');

const getTlsOptions = function () {
  const tlsUnprotected = getenv('TLS_UNPROTECTED', 'loopback');
  const result = {};

  if (tlsUnprotected !== 'none' && tlsUnprotected !== 'loopback') {
    return result;
  }

  result.secure = true;

  const keystore = tlscert.get();

  if (keystore.ca) {
    result.ca = [keystore.ca];
  }

  return result;
};

const getConsulOptions = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.consulUrl) {
    throw new Error('Consul url is missing.');
  }

  const urlObj = url.parse(options.consulUrl);

  if (['https:', 'http:'].indexOf(urlObj.protocol) === -1) {
    throw new Error('Wrong protocol in consul url provided.');
  }

  const consulOptions = {
    defaults: {
      token: options.token || ''
    }
  };

  consulOptions.host = urlObj.hostname;
  if (urlObj.port) {
    consulOptions.port = parseInt(urlObj.port, 10);
  }

  return Object.assign(consulOptions, getTlsOptions(consulOptions));
};

module.exports = getConsulOptions;
