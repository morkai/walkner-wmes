'use strict';

var later = require('later');
later.date.localTime();

exports.id = 'sapgui';

exports.modules = [
  'directoryWatcher',
  'purchaseOrders/exporter',
  'sapGui'
];

exports.directoryWatcher = {
  path: 'C:/SAP/Output'
};

exports['purchaseOrders/exporter'] = {
  uploadUrl: 'http://127.0.0.1/purchaseOrders;import'
};

exports.sapGui = {
  scriptsPath: 'C:/SAP/Scripts',
  jobs: [
    {
      name: 'keepAlive',
      schedule: later.parse.text('every 10 min')
    },
    {
      name: 'zopp',
      schedule: later.parse.cron('45 */3 * * 1-5')
    },
    {
      name: 'lt23',
      schedule: later.parse.cron('10 6 * * 1-5')
    },
    {
      name: 'ls41',
      schedule: later.parse.cron('0 5 * * 1')
    }
  ]
};
