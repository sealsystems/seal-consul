'use strict';

const tlscert = require('@sealsystems/tlscert');

const getTlsOptions = async function () {
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
