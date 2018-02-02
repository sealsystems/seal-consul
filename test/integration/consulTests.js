'use strict';

const dns = require('dns');

const assert = require('assertthat');
const { isIp } = require('formats');
const processenv = require('processenv');
const uuid = require('uuidv4');

const consul = require('../../lib/consul');

const consulUrl = 'https://localhost:8500';
const token = processenv('CONSUL_TOKEN');

suite('consul', () => {
  let originalDnsServers;

  suiteSetup(async () => {
    originalDnsServers = dns.getServers();
  });

  teardown(async () => {
    dns.setServers(originalDnsServers);
  });

  test('is an object.', async () => {
    assert.that(consul).is.ofType('object');
  });

  suite('connect', () => {
    test('is a function.', async () => {
      assert.that(consul.connect).is.ofType('function');
    });

    test('throws an error if consul url is missing.', async () => {
      await assert.that(async () => {
        await consul.connect({});
      }).is.throwingAsync('Consul url is missing.');
    });

    test('throws an error if the protocol is wrong.', async () => {
      await assert.that(async () => {
        await consul.connect({ consulUrl: 'ftp://localhost:8500', token });
      }).is.throwingAsync('Wrong protocol in consul url provided.');
    });

    test('throws an error if the host is wrong.', async () => {
      await assert.that(async () => {
        await consul.connect({ consulUrl: 'https://non-existent:8500', token });
      }).is.throwingAsync((ex) => ex.code === 'ENOTFOUND');
    });

    test('throws an error if the port is wrong.', async () => {
      await assert.that(async () => {
        await consul.connect({ consulUrl: 'https://localhost:12345', token });
      }).is.throwingAsync((ex) => ex.code === 'ECONNREFUSED');
    });

    test('returns a client.', async () => {
      const client = await consul.connect({ consulUrl: 'https://localhost:8500', token });

      assert.that(client).is.ofType('object');
    });

    test('sets Consul as DNS server.', async () => {
      const googleDns = '8.8.8.8';

      dns.setServers([googleDns]);
      await consul.connect({ consulUrl: 'https://localhost:8500', token });

      const dnsServers = dns.getServers();

      assert.that(dnsServers).is.equalTo(['127.0.0.1']);
    });
  });

  suite('setAsDns', () => {
    test('is a function.', async () => {
      assert.that(consul.setAsDns).is.ofType('function');
    });

    test('throws an error if consul url is missing.', async () => {
      await assert.that(async () => {
        await consul.setAsDns({});
      }).is.throwingAsync('Consul url is missing.');
    });

    test('sets the given host as DNS server.', async () => {
      await consul.setAsDns({ consulUrl });

      const dnsServers = dns.getServers();

      assert.that(dnsServers).is.equalTo(['127.0.0.1']);
    });
  });

  suite('lookup', () => {
    test('is a function.', async () => {
      assert.that(consul.lookup).is.ofType('function');
    });

    test('throws an error if hostname is missing.', async () => {
      await assert.that(async () => {
        await consul.lookup();
      }).is.throwingAsync('Hostname is missing.');
    });

    test('throws an error for a non-registered service.', async () => {
      await assert.that(async () => {
        await consul.lookup('non-existent.service.consul');
      }).is.throwingAsync('No addresses found.');
    });

    test('throws an error for a registered service that does not pass.', async () => {
      const serviceName = uuid();
      const serviceUrl = 'https://www.example.com';

      const client = await consul.connect({ consulUrl });

      await client.service.register({ serviceName, serviceUrl });

      await assert.that(async () => {
        await consul.lookup(`${serviceName}.service.consul`);
      }).is.throwingAsync('No addresses found.');
    });

    test('returns the ip for a registered service.', async () => {
      const serviceName = uuid();
      const serviceUrl = 'https://www.example.com';

      const client = await consul.connect({ consulUrl });
      const registeredService = await client.service.register({ serviceName, serviceUrl });

      await registeredService.pass();

      const address = await consul.lookup(`${serviceName}.service.consul`);

      assert.that(isIp(address)).is.true();
    });
  });
});
