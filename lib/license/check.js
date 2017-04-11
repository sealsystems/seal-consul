'use strict';

const crypto = require('crypto');

const log = require('seal-log').getLogger();

const check = function (options, callback) {
  this.getLicense(options, (errGet, licenseResult) => {
    if (errGet) {
      log.error('No signature found');
      return callback(null, false);
    }

    let verified = false;

    try {
      const verify = crypto.createVerify('RSA-SHA256');

      verify.update(licenseResult.license, 'utf8');
      verified = verify.verify(licenseResult.certificate, licenseResult.signature, 'base64');
    } catch (errCatch) {
      log.error('Verification failed', { err: errCatch });
      return callback(null, false);
    }

    callback(null, verified);
  });
};

module.exports = check;

