'use strict';

const assert = require('assertthat');

const consul = require('../lib/consul');

const host = require('docker-host')().host;

suite('connect', () => {
  setup((done) => {
    consul.retryOptions = {
      retries: 5,
      minTimeout: 0.1 * 1000,
      maxTimeout: 0.2 * 1000,
      factor: 2,
      randomize: true
    };
    done();
  });

  test('is a function.', (done) => {
    assert.that(consul.connect).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', (done) => {
    assert.that(() => {
      consul.connect();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if service name is missing.', (done) => {
    assert.that(() => {
      consul.connect({
        consulUrl: 'http://foo:8500',
        serviceUrl: 'http://bar:1234'
      });
    }).is.throwing('Service name is missing.');
    done();
  });

  test('throws an error if service url is missing.', (done) => {
    assert.that(() => {
      consul.connect({
        consulUrl: 'http://foo:8500',
        serviceName: 'bar'
      });
    }).is.throwing('Service url is missing.');
    done();
  });

  test('throws an error if consul url is missing.', (done) => {
    assert.that(() => {
      consul.connect({
        serviceName: 'foo',
        serviceUrl: 'http://bar:1234'
      });
    }).is.throwing('Consul url is missing.');
    done();
  });

  test('throws an error if callback is missing.', (done) => {
    assert.that(() => {
      consul.connect({
        consulUrl: 'http://foo:8500',
        serviceName: 'bar',
        serviceUrl: 'http://baz:1234'
      });
    }).is.throwing('Callback is missing.');
    done();
  });

  test('stores the host and port of the service as provided in options.serviceUrl.', function (done) {
    this.timeout(10000);
    consul.connect({
      consulUrl: `http://${host}:8500`,
      serviceName: 'foo',
      serviceUrl: `http://${host}:3000`
    }, (err) => {
      const checkHost = function () {
        // Special treatment for localhost
        if (host === 'localhost') {
          return consul.options.address === '127.0.0.1';
        }
        return consul.options.address === host;
      };

      assert.that(!err || err.message === 'Verification failed.').is.true();
      assert.that(checkHost()).is.true();
      done();
    });
  });

  test('stores given service tags.', (done) => {
    consul.connect({
      consulUrl: `http://${host}:8500`,
      serviceName: 'foo',
      serviceTags: ['tag1', 'tag2'],
      serviceUrl: `bar://${host}:3000`
    }, (err) => {
      assert.that(!err || err.message === 'Verification failed.').is.true();
      assert.that(consul.options.tags.length).is.equalTo(3);
      assert.that(consul.options.tags[0]).is.equalTo('tag1');
      assert.that(consul.options.tags[1]).is.equalTo('tag2');
      assert.that(consul.options.tags[2]).is.equalTo(require('../package.json').version.replace(/\./g, '-'));
      done();
    });
  });

  test('ignores empty service tags.', (done) => {
    consul.connect({
      consulUrl: `http://${host}:8500`,
      serviceName: 'foo',
      serviceTags: ['tag', ''],
      serviceUrl: `bar://${host}:3000`
    }, (err) => {
      assert.that(!err || err.message === 'Verification failed.').is.true();
      assert.that(consul.options.tags.length).is.equalTo(2);
      assert.that(consul.options.tags[0]).is.equalTo('tag');
      assert.that(consul.options.tags[1]).is.equalTo(require('../package.json').version.replace(/\./g, '-'));
      done();
    });
  });

  test('does not set address if there is no hostname in "serviceUrl".', function (done) {
    this.timeout(60 * 1000);
    consul.connect({
      consulUrl: `http://${host}:8500`,
      serviceName: 'foo',
      serviceUrl: 'http://:3000'
    }, (err) => {
      assert.that(!err || err.message === 'Verification failed.').is.true();
      assert.that(consul.options.address).is.undefined();
      assert.that(consul.options.port).is.equalTo(3000);
      done();
    });
  });
});
