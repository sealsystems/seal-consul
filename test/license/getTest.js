'use strict';

const assert = require('assertthat');

const consul = require('../../lib/consul');

const conectOptions = {
  consulUrl: `http://localhost:8500`,
  serviceName: 'foo',
  serviceUrl: 'http://localhost:19876'
};

suite('license/get', () => {
  suiteSetup((done) => {
    consul.connect(conectOptions, () => {
      done();
    });
  });

  test('is a function.', (done) => {
    assert.that(consul.getLicense).is.ofType('function');
    done();
  });

  test('throws error if options are missing', (done) => {
    assert.that(() => {
      consul.getLicense();
    }).is.throwing('Options are missing.');
    done();
  });

  test('get value', (done) => {
    const license = {
      certificate: 'cert',
      license: 'hugo',
      signature: 'signature'
    };

    consul.setLicense({}, license, (errSet) => {
      assert.that(errSet).is.falsy();

      consul.getLicense({}, (errGet, licenseResult) => {
        assert.that(errGet).is.falsy();
        assert.that(licenseResult).is.ofType('object');
        assert.that(licenseResult.certificate).is.equalTo(license.certificate);
        done();
      });
    });
  });
});
