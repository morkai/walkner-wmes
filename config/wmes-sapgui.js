'use strict';

exports.id = 'wmes-sapgui';

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
  jobs: []
};
