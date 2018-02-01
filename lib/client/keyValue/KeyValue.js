'use strict';

const EventEmitter = require('../util/EventEmitter');

class KeyValue {
  constructor ({ consul, token }) {
    if (!consul) {
      throw new Error('Consul is missing.');
    }

    this.consul = consul;
    this.token = token;
  }

  async get ({ key }) {
    if (!key) {
      throw new Error('Key is missing.');
    }

    const { consul, token } = this;

    if (!key.startsWith('dc/home/env')) {
      key = `dc/home/env/${key}`;
    }

    const keys = await consul.agent.consul.kv.get({ key, token });

    return keys;
  }

  async set ({ key, value }) {
    if (!key) {
      throw new Error('Key is missing.');
    }
    if (!value) {
      throw new Error('Value is missing.');
    }

    const { consul, token } = this;

    if (!key.startsWith('dc/home/env')) {
      key = `dc/home/env/${key}`;
    }

    const result = await consul.agent.consul.kv.set({ key, value, token });

    return result;
  }

  async remove ({ key }) {
    if (!key) {
      throw new Error('Key is missing.');
    }

    const { consul, token } = this;

    if (!key.startsWith('dc/home/env')) {
      key = `dc/home/env/${key}`;
    }

    await consul.agent.consul.kv.del({ key, token });
  }

  watch ({ key }) {
    if (!key) {
      throw new Error('Key is missing.');
    }

    const { consul } = this;

    const eventEmitter = new EventEmitter();

    const watch = consul.watch({
      method: consul.kv.keys,
      options: {
        key,
        recurse: true,
        separator: '/'
      }
    });

    watch.on('change', (keylist) => {
      eventEmitter.emit('change', keylist);
    });

    watch.on('error', (err) => {
      eventEmitter.emit('error', err);
    });

    return eventEmitter;
  }
}

module.exports = KeyValue;
