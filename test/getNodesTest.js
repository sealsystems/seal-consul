'use strict';

const assert = require('assertthat');

const getNodes = require('../lib/getNodes');

suite('getNodes', () => {
  test('is a function.', (done) => {
    assert.that(getNodes).is.ofType('function');
    done();
  });
});
