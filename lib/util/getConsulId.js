'use strict';

const os = require('os');

const getConsulId = function ({ name, port, tags = [] }) {
  if (!name) {
    throw new Error('Name is missing.');
  }

  const tagPrefix = tags.length > 0 ?
    `[${tags.toString()}].` :
    '';

  const portSuffix = port ?
    `:${port}` :
    '';

  return `${tagPrefix}${name}@${os.hostname()}${portSuffix}`;
};

module.exports = getConsulId;
