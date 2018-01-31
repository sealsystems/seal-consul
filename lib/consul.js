'use strict';

const connect = require('./connect');
const delKvs = require('./kv/del');
const getConfiguration = require('./getConfiguration');
const getHostname = require('./getHostname');
const getKvs = require('./kv/get');
const getNodes = require('./getNodes');
const heartbeat = require('./heartbeat');
const initialize = require('./initialize');
const lookup = require('./lookup');
const resolveService = require('./resolveService');
const setKv = require('./kv/set');
const watchKv = require('./watch/kv');
const watchService = require('./watch/service');

const consul = {
  connect,
  getConfiguration,
  getHostname,
  getNodes,
  heartbeat,
  initialize,
  lookup,
  resolveService,

  setKv,
  getKvs,
  delKvs,

  watchService,
  watchKv
};

['pass', 'warn', 'fail'].forEach((status) => {
  consul[status] = async () => {
    consul.status = status;

    return await consul.heartbeat();
  };
});

module.exports = consul;
