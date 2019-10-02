'use strict';

const inCloud = require('./inCloud');

module.exports = inCloud() ? require('./cloud') : require('./consul/index');
