'use strict';

const dns = require('dns');

const lookup = async function(hostname) {
  if (!hostname) {
    throw new Error('Hostname is missing.');
  }

  return await new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        return reject(err);
      }
      resolve(address);
    });
  });
};

module.exports = lookup;
