'use strict';

const consul = {
  connect: require('./connect'),
  getConfig: require('./getConfig'),
  getHostname: require('./getHostname'),
  getNodes: require('./getNodes'),
  heartbeat: require('./heartbeat'),
  initialize: require('./initialize'),
  lookup: require('./lookup'),
  resolveService: require('./resolveService'),
  setKv: require('./kv/set'),
  getKvs: require('./kv/get'),
  delKvs: require('./kv/del'),
  getLicense: require('./license/get'),
  setLicense: require('./license/set'),
  checkLicense: require('./license/check'),
  watchService: require('./watch/service'),
  watchKv: require('./watch/kv')
};

['pass', 'warn', 'fail'].forEach((status) => {
  consul[status] = (callback) => {
    consul.status = status;
    consul.heartbeat(callback);
  };
});

module.exports = consul;
