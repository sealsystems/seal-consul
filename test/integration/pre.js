'use strict';

const oneLine = require('common-tags/lib/oneLine');
const shell = require('shelljs');

const waitForConsul = require('../helpers/waitForConsul');

const pre = function (done) {
  shell.exec(oneLine`
    docker
      run
        -d
        -p 8500:8500
        -p 53:8600
        -p 53:8600/udp
        --name consul
        plossys/consul:1.0.3
  `, (err) => {
    if (err) {
      return done(err);
    }

    (async () => {
      await waitForConsul();
      done(null);
    })();
  });
};

module.exports = pre;
