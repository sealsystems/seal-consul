'use strict';

const assert = require('assertthat');
const { EventEmitter2 } = require('eventemitter2');

const EventEmitter = require('../../lib/util/EventEmitter');

suite('util/EventEmitter', () => {
  test('is a function.', async () => {
    assert.that(EventEmitter).is.ofType('function');
  });

  test('extends EventEmitter2.', async () => {
    const eventEmitter = new EventEmitter();

    assert.that(eventEmitter).is.instanceOf(EventEmitter2);
  });
});
