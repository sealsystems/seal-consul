'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const host = require('docker-host')().host;

const conectOptions = {
  consulUrl: `http://${host}:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('kv/del', () => {
  suiteSetup((done) => {
    consul.connect(conectOptions, (errConnect) => {
      assert.that(errConnect).is.null();
      done();
    });
  });

  suiteTeardown((done) => {
    consul.delKvs({
      key: 'test',
      recurse: true
    }, (errDel) => {
      assert.that(errDel).is.falsy();
      consul.agent.service.deregister(consul.options, done);
    });
  });

  test('is a function.', (done) => {
    assert.that(consul.delKvs).is.ofType('function');
    done();
  });

  test('throws error if options are missing', (done) => {
    assert.that(() => {
      consul.delKvs();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws error if options.key is missing', (done) => {
    assert.that(() => {
      consul.delKvs({});
    }).is.throwing('Options.key is missing.');
    done();
  });

  test('deletes kv value', (done) => {
    const key = 'test/kv/kvdelTest';
    const value = 'kvdelTestvalue';

    consul.setKv({
      key,
      value
    }, (errSet, result) => {
      assert.that(errSet).is.falsy();
      assert.that(result).is.true();

      consul.getKvs({
        key
      }, (errGet1, getResult1) => {
        assert.that(errGet1).is.null();
        assert.that(getResult1.Value).is.equalTo(value);

        consul.delKvs({
          key
        }, (errDel) => {
          assert.that(errDel).is.null();

          consul.getKvs({
            key
          }, (errGet2, getResult2) => {
            assert.that(errGet2).is.null();
            assert.that(getResult2).is.undefined();
            done();
          });
        });
      });
    });
  });
});
