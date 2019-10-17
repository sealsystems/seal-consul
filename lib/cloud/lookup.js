'use strict';

const lookup = async function(hostport) {
  if (!hostport) {
    throw new Error('Service name is missing.');
  }

  return hostport.name;
};

module.exports = lookup;
