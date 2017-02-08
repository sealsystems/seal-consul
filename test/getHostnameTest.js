'use strict';

const assert = require('assertthat');

const getHostname = require('../lib/getHostname');

suite('getHostname', () => {
  test('is a function.', (done) => {
    assert.that(getHostname).is.ofType('function');
    done();
  });

  test('returns an error if querying Consul failed.', (done) => {
    const agent = {
      self (callback) {
        callback(new Error('foo'));
      }
    };

    getHostname.call({ agent }, (err) => {
      assert.that(err).is.not.falsy();
      assert.that(err.message).is.equalTo('foo');
      done();
    });
  });

  test('returns the hostname provided by Consul.', (done) => {
    const agent = {
      self (callback) {
        callback(null, {
          Config: {
            NodeName: 'foo',
            Datacenter: 'bar',
            Domain: 'baz.'
          }
        });
      }
    };

    getHostname.call({ agent }, (err, hostname) => {
      assert.that(err).is.null();
      assert.that(hostname).is.equalTo('foo.node.bar.baz');
      done();
    });
  });

  // Please note: Depends on test above!
  test('returns cached hostname.', (done) => {
    const agent = {
      self () {
        // Function should not be called
        assert.that(false).is.eqalTo(true);
      }
    };

    getHostname.call({ agent }, (err, hostname) => {
      assert.that(err).is.null();
      assert.that(hostname).is.equalTo('foo.node.bar.baz');
      done();
    });
  });
});
