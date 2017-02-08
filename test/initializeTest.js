'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

let consulOptions;
const initialize = proxyquire('../lib/initialize', {
  consul (options) {
    consulOptions = options;
    return {};
  }
});

suite('initialize', () => {
  setup(() => {
    consulOptions = null;
  });

  test('is a function.', (done) => {
    assert.that(initialize).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', (done) => {
    assert.that(() => {
      initialize();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if Consul\'s url is missing.', (done) => {
    assert.that(() => {
      initialize({});
    }).is.throwing('Consul url is missing.');
    done();
  });

  test('calls consul with the given options.', (done) => {
    const thisContext = {
    };

    initialize.call(thisContext, { consulUrl: 'http://foo:1234' });
    assert.that(consulOptions).is.equalTo({
      defaults: {
        token: ''
      },
      host: 'foo',
      port: 1234,
      secure: true
    });
    done();
  });
});
