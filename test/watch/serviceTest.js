'use strict';

const assert = require('assertthat');
const host = require('docker-host')().host;
const uuid = require('uuidv4');

const consul = require('../../lib/consul');

const service = require('../../lib/watch/service');

suite('watch/service', () => {
  test('is a function.', (done) => {
    assert.that(service).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', (done) => {
    assert.that(() => {
      service();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if service name is missing.', (done) => {
    assert.that(() => {
      service({});
    }).is.throwing('Service name is missing.');
    done();
  });

  suite('sends notification', () => {
    test('about services that are already running at start.', function (done) {
      const serviceName = uuid();
      let iteration = 0;

      this.timeout(10000);
      consul.connect({
        consulUrl: `http://${host}:8500`,
        serviceName,
        serviceUrl: `http://${host}:3000`,
        status: 'pass'
      }, (errConnect) => {
        assert.that(!errConnect || errConnect.message === 'Verification failed.').is.true();

        consul.watchService({
          consulUrl: `http://${host}:8500`,
          serviceName
        }, (errService, nodes) => {
          assert.that(errService).is.null();

          iteration++;
          if (iteration === 1) {
            assert.that(nodes.length).is.equalTo(1);
            assert.that(nodes[0].host).is.ofType('string');
            assert.that(nodes[0].node).is.ofType('string');
            assert.that(nodes[0].port).is.equalTo(3000);

            return done();
          }
        });
      });
    });

    test('if an active service fails.', function (done) {
      const serviceName = uuid();
      let iteration = 0;

      this.timeout(10000);
      consul.connect({
        consulUrl: `http://${host}:8500`,
        serviceName,
        serviceUrl: `http://${host}:3000`,
        status: 'pass'
      }, (errConnect) => {
        assert.that(!errConnect || errConnect.message === 'Verification failed.').is.true();

        consul.watchService({
          consulUrl: `http://${host}:8500`,
          serviceName
        }, (errService, nodes) => {
          assert.that(errService).is.null();

          iteration++;
          if (iteration === 1) {
            assert.that(nodes.length).is.equalTo(1);
            assert.that(nodes[0].host).is.ofType('string');
            assert.that(nodes[0].node).is.ofType('string');
            assert.that(nodes[0].port).is.equalTo(3000);
            consul.warn(() => {});
          } else if (iteration === 2) {
            assert.that(nodes.length).is.equalTo(0);

            return done();
          }
        });
      });
    });

    test('if a broken service is up again.', function (done) {
      const serviceName = uuid();
      let iteration = 0;

      this.timeout(10000);
      consul.connect({
        consulUrl: `http://${host}:8500`,
        serviceName,
        serviceUrl: `http://${host}:3000`
      }, (errConnect) => {
        assert.that(!errConnect || errConnect.message === 'Verification failed.').is.true();

        consul.watchService({
          consulUrl: `http://${host}:8500`,
          serviceName
        }, (errService, nodes) => {
          assert.that(errService).is.null();

          iteration++;
          if (iteration === 1) {
            assert.that(nodes.length).is.equalTo(0);
            consul.pass(() => {});
          } else if (iteration === 2) {
            assert.that(nodes.length).is.equalTo(1);
            assert.that(nodes[0].host).is.ofType('string');
            assert.that(nodes[0].node).is.ofType('string');
            assert.that(nodes[0].port).is.equalTo(3000);

            return done();
          }
        });
      });
    });
  });
});
