'use strict';

const assert = require('assertthat');
const host = require('docker-host')().host;
const uuid = require('uuidv4');

const consul = require('../../lib/consul');

const kvTree = require('../../lib/watch/kv');

suite('watch/kv', () => {
  test('is a function.', (done) => {
    assert.that(kvTree).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', (done) => {
    assert.that(() => {
      kvTree();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if service name is missing.', (done) => {
    assert.that(() => {
      kvTree({});
    }).is.throwing('Key is missing.');
    done();
  });

  test('calls callback when a key is changing', function (done) {
    const key = `dc/home/${uuid()}/`;
    let subKeyChanged = false;

    this.timeout(10000);
    consul.connect({
      consulUrl: `http://${host}:8500`,
      serviceName: 'test',
      serviceUrl: `http://${host}:3000`,
      status: 'pass'
    }, (errConnect) => {
      assert.that(!errConnect || errConnect.message === 'Verification failed.').is.true();

      consul.consul.kv.set({ key, value: '' }, (errSet, result) => {
        assert.that(errSet).is.falsy();
        assert.that(result).is.true();

        consul.watchKv({
          key
        }, (errWatchTree, data) => {
          assert.that(errWatchTree).is.null();

          if (subKeyChanged) {
            assert.that(data).is.ofType('array');
            subKeyChanged = false;

            return done();
          }
        });

        consul.consul.kv.set({
          key: `${key}sub/yy`,
          value: 'huhu'
        }, (errSet2, result2) => {
          subKeyChanged = true;
          assert.that(errSet2).is.falsy();
          assert.that(result2).is.true();
        });
      });
    });
  });
});
