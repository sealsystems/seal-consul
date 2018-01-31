'use strict';

const assert = require('assertthat');

const getConfiguration = require('../lib/getConfiguration');

suite('getConfiguration', () => {
  test('is a function.', (done) => {
    assert.that(getConfiguration).is.ofType('function');
    done();
  });

  test('throws error if agent is not initialized', (done) => {
    assert.that(() => {
      getConfiguration.call({});
    }).is.throwing('Agent not initialized.');
    done();
  });

  test('throws error if callback is missing', (done) => {
    const agent = {
      self () {}
    };

    assert.that(() => {
      getConfiguration.call({ agent });
    }).is.throwing('Missing callback.');
    done();
  });

  test('returns an error if querying Consul failed.', (done) => {
    const agent = {
      self (callback) {
        callback(new Error('foo'));
      }
    };

    getConfiguration.call({ agent }, (err) => {
      assert.that(err).is.not.falsy();
      assert.that(err.message).is.equalTo('foo');
      done();
    });
  });

  test('returns the config provided by Consul.', (done) => {
    const agent = {
      self (callback) {
        callback(null, {
          Config: {
            Datacenter: 'dc1',
            Domain: 'consul.',
            NodeName: 'server1'
          }
        });
      }
    };

    getConfiguration.call({ agent }, (err, config) => {
      assert.that(err).is.null();
      assert.that(config.Datacenter).is.equalTo('dc1');
      done();
    });
  });

  // Please note: Depends on test above!
  test('returns the config from cache.', (done) => {
    const agent = {
      self () {
        // Function should not be called
        assert.that(false).is.equalTo(true);
      }
    };

    getConfiguration.call({ agent }, (err, config) => {
      assert.that(err).is.null();
      assert.that(config.Domain).is.equalTo('consul.');
      done();
    });
  });
});
