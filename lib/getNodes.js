'use strict';

const filterByStatus = require('./util/filterByStatus');

const getNodes = function (options, callback) {
  options.token = options.token || this.token || '';

  this.agent.consul.catalog.service.nodes(options, (errNodes, nodes) => {
    if (errNodes || !options.status || !nodes) {
      return callback(errNodes, nodes);
    }

    this.agent.consul.health.checks(options, (errChecks, checks) => {
      if (errChecks) {
        return callback(errChecks);
      }

      callback(null, filterByStatus(options, nodes, checks));
    });
  });
};

module.exports = getNodes;
