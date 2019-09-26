'use strict';

const assert = require('assertthat');
const proxyquire = require('proxyquire');

const getConsulId = proxyquire('../../lib/consul/getConsulId', {
  os: {
    hostname() {
      return 'localhost';
    }
  }
});

suite('consul.getConsulId', () => {
  test('is a function.', async () => {
    assert.that(getConsulId).is.ofType('function');
  });

  test('throws an error if name is missing.', async () => {
    assert
      .that(() => {
        getConsulId({ port: 1234 });
      })
      .is.throwing('Name is missing.');
  });

  test('returns service name and hostname.', async () => {
    assert
      .that(
        getConsulId({
          name: 'foo'
        })
      )
      .is.equalTo('foo@localhost');
  });

  test('returns service name, hostname, port.', async () => {
    assert
      .that(
        getConsulId({
          name: 'foo',
          port: 1234
        })
      )
      .is.equalTo('foo@localhost:1234');
  });

  test('returns single tag.', async () => {
    assert
      .that(
        getConsulId({
          name: 'foo',
          port: 1234,
          tags: ['bar']
        })
      )
      .is.equalTo('[bar].foo@localhost:1234');
  });

  test('returns multiple tags.', async () => {
    assert
      .that(
        getConsulId({
          name: 'foo',
          port: 1234,
          tags: ['bar', 'baz']
        })
      )
      .is.equalTo('[bar,baz].foo@localhost:1234');
  });
});
