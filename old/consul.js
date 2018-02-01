'use strict';

const connect = require('./connect');
const heartbeat = require('./heartbeat');
const lookup = require('./lookup');
const resolveService = require('./resolveService');

const consul = {
  connect,
  heartbeat,
  lookup,
  resolveService
};

['pass', 'warn', 'fail'].forEach((status) => {
  consul[status] = async () => {
    consul.status = status;

    return await consul.heartbeat();
  };
});

module.exports = consul;
