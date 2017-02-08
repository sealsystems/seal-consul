'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

const getConsulId = proxyquire('../lib/getConsulId', {
  os: {
    hostname () {
      return 'localhost';
    }
  }
});

suite('getConsulId', () => {
  test('is a function.', (done) => {
    assert.that(getConsulId).is.ofType('function');
    done();
  });

  test('throws an error if options are missing.', (done) => {
    assert.that(() => {
      getConsulId();
    }).is.throwing('Options are missing.');
    done();
  });

  test('throws an error if name is missing.', (done) => {
    assert.that(() => {
      getConsulId({
        port: 1234
      });
    }).is.throwing('Name is missing.');
    done();
  });

  test('returns service name and hostname.', (done) => {
    assert.that(getConsulId({
      name: 'foo'
    })).is.equalTo('foo@localhost');
    done();
  });

  test('returns service name, hostname, port.', (done) => {
    assert.that(getConsulId({
      name: 'foo',
      port: 1234
    })).is.equalTo('foo@localhost:1234');
    done();
  });

  test('returns single tag.', (done) => {
    assert.that(getConsulId({
      name: 'foo',
      port: 1234,
      tags: ['bar']
    })).is.equalTo('[bar].foo@localhost:1234');
    done();
  });

  test('returns multiple tags.', (done) => {
    assert.that(getConsulId({
      name: 'foo',
      port: 1234,
      tags: ['bar', 'baz']
    })).is.equalTo('[bar,baz].foo@localhost:1234');
    done();
  });
});
