'use strict';

const os = require('os');

const getConsulId = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.name) {
    throw new Error('Name is missing.');
  }

  const tags = options.tags || [];

  let portSuffix = '',
      tagPrefix = '';

  if (tags.length) {
    tagPrefix = `[${tags.toString()}].`;
  }
  if (options.port) {
    portSuffix = `:${options.port}`;
  }

  return `${tagPrefix}${options.name}@${os.hostname()}${portSuffix}`;
};

module.exports = getConsulId;
