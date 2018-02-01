'use strict';

const EventEmitter = require('../util/EventEmitter');

class KeyValue {
  constructor ({ consul }) {
    if (!consul) {
      throw new Error('Consul is missing.');
    }

    this.consul = consul;
  }

  async get ({ key, token = this.token }) {
    if (!key) {
      throw new Error('Key is missing.');
    }

    if (!key.startsWith('dc/home/env')) {
      key = `dc/home/env/${key}`;
    }

    const keys = await this.consul.agent.consul.kv.get({ key, token });

    return keys;
  }

  async set ({ key, value, token = this.token }) {
    if (!key) {
      throw new Error('Key is missing.');
    }
    if (!value) {
      throw new Error('Value is missing.');
    }

    if (!key.startsWith('dc/home/env')) {
      key = `dc/home/env/${key}`;
    }

    const result = await this.consul.agent.consul.kv.set({ key, value, token });

    return result;
  }

  async remove ({ key, token = this.token }) {
    if (!key) {
      throw new Error('Key is missing.');
    }

    if (!key.startsWith('dc/home/env')) {
      key = `dc/home/env/${key}`;
    }

    await this.consul.agent.consul.kv.del({ key, token });
  }

  watch ({ key }) {
    if (!key) {
      throw new Error('Key is missing.');
    }

    const eventEmitter = new EventEmitter();

    const watch = this.consul.watch({
      method: this.consul.kv.keys,
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
