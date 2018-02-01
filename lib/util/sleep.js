'use strict';

const util = require('util');

const sleep = util.promisify(setTimeout);

module.exports = sleep;
