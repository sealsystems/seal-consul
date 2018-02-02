'use strict';

const assert = require('assertthat');

const filterByStatus = require('../../lib/util/filterByStatus');

suite('util/filterByStatus', () => {
  test('is a function.', async () => {
    assert.that(filterByStatus).is.ofType('function');
  });

  test('throws an error if status is missing.', async () => {
    assert.that(() => {
      filterByStatus({});
    }).is.throwing('Status is missing.');
  });

  test('throws an error if nodes are missing.', async () => {
    assert.that(() => {
      filterByStatus({ status: 'passing' });
    }).is.throwing('Nodes are missing.');
  });

  test('throws an error if checks are missing.', async () => {
    assert.that(() => {
      filterByStatus({ status: 'passing' }, []);
    }).is.throwing('Checks are missing.');
  });

  test('returns only node whose checks return the wanted status.', async () => {
    const nodes = [{
      Node: 'foo',
      Address: '1.2.3.4',
      ServiceID: '[http].foobar@1.2.3.4:1234',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 1234
    }, {
      Node: 'bar',
      Address: '2.3.4.5',
      ServiceID: '[http].foobar@2.3.4.5:2345',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 2345
    }];

    const checks = [{
      Node: 'foo',
      CheckID: 'service:[http].foobar@1.2.3.4:1234',
      Name: 'Service \'foobar\' check',
      Status: 'passing',
      Notes: '',
      Output: '',
      ServiceID: '[http].foobar@1.2.3.4:1234',
      ServiceName: 'foobar'
    }, {
      Node: 'bar',
      CheckID: 'service:[http].foobar@2.3.4.5:2345',
      Name: 'Service \'foobar\' check',
      Status: 'warning',
      Notes: '',
      Output: '',
      ServiceID: '[http].foobar@2.3.4.5:2345',
      ServiceName: 'foobar'
    }
    ];

    const status = 'passing';

    const actual = filterByStatus({ status }, nodes, checks);

    assert.that(actual).is.equalTo([nodes[0]]);
  });

  test('filters for multiple statuses.', async () => {
    const nodes = [{
      Node: 'foo',
      Address: '1.2.3.4',
      ServiceID: '[http].foobar@1.2.3.4:1234',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 1234
    }, {
      Node: 'bar',
      Address: '2.3.4.5',
      ServiceID: '[http].foobar@2.3.4.5:2345',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 2345
    }, {
      Node: 'baz',
      Address: '3.4.5.6',
      ServiceID: '[http].foobar@3.4.5.6:3456',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 3456
    }
    ];

    const checks = [{
      Node: 'foo',
      CheckID: 'service:[http].foobar@1.2.3.4:1234',
      Name: 'Service \'foobar\' check',
      Status: 'passing',
      Notes: '',
      Output: '',
      ServiceID: '[http].foobar@1.2.3.4:1234',
      ServiceName: 'foobar'
    }, {
      Node: 'bar',
      CheckID: 'service:[http].foobar@2.3.4.5:2345',
      Name: 'Service \'foobar\' check',
      Status: 'warning',
      Notes: '',
      Output: '',
      ServiceID: '[http].foobar@2.3.4.5:2345',
      ServiceName: 'foobar'
    }, {
      Node: 'baz',
      CheckID: 'service:[http].foobar@3.4.5.6:3456',
      Name: 'Service \'foobar\' check',
      Status: 'critical',
      Notes: '',
      Output: '',
      ServiceID: '[http].foobar@3.4.5.6:3456',
      ServiceName: 'foobar'
    }];

    const status = ['passing', 'warning'];

    const actual = filterByStatus({ status }, nodes, checks);

    assert.that(actual).is.equalTo([nodes[0], nodes[1]]);
  });

  test('handles empty list of checks.', async () => {
    const nodes = [{
      Node: 'foo',
      Address: '1.2.3.4',
      ServiceID: '[http].foobar@1.2.3.4:1234',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 1234
    }, {
      Node: 'bar',
      Address: '2.3.4.5',
      ServiceID: '[http].foobar@2.3.4.5:2345',
      ServiceName: 'foobar',
      ServiceTags: [
        'http'
      ],
      ServiceAddress: '127.0.0.1',
      ServicePort: 2345
    }];

    const checks = [];
    const status = 'passing';
    const actual = filterByStatus({ status }, nodes, checks);

    assert.that(actual).is.equalTo([]);
  });
});
