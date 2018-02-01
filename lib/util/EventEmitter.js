'use strict';

const { EventEmitter2 } = require('eventemitter2');

class EventEmitter extends EventEmitter2 {
  constructor () {
    super({
      wildcard: true,
      delimiter: '::'
    });
  }
}

module.exports = EventEmitter;
