'use strict';

const _ = require('lodash');

const filterByStatus = function (options, nodes, checks) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.status) {
    throw new Error('Status is missing.');
  }
  if (!nodes) {
    throw new Error('Nodes are missing.');
  }
  if (!checks) {
    throw new Error('Checks are missing.');
  }

  let filter = options.status;
  const result = [];

  if (typeof filter === 'string') {
    filter = [filter];
  }

  filter.forEach((status) => {
    const matchingChecks = _.filter(checks, { Status: status });

    matchingChecks.forEach((check) => {
      result.push(_.find(nodes, { ServiceID: check.ServiceID }));
    });
  });

  return result;
};

module.exports = filterByStatus;
