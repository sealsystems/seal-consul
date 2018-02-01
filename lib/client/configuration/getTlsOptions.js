'use strict';

const getenv = require('getenv');

const tlscert = require('@sealsystems/tlscert');

const getTlsOptions = async function () {
  const tlsUnprotected = getenv('TLS_UNPROTECTED', 'loopback');

  if (tlsUnprotected !== 'none' && tlsUnprotected !== 'loopback') {
    return {};
  }

  const tlsOptions = {
    secure: true
  };

  const keystore = await tlscert.get();

  if (keystore.ca) {
    tlsOptions.ca = [keystore.ca];
  }

  return tlsOptions;
};

module.exports = getTlsOptions;
