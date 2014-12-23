'use strict';

exports.id = 'wmes-sapgui';

exports.modules = [
  'directoryWatcher',
  'purchaseOrders/exporter',
  'warehouse/exporter',
  'sapGui'
];

exports.directoryWatcher = {
  path: 'C:/SAP/Output'
};

exports['purchaseOrders/exporter'] = {
  uploadUrl: 'http://127.0.0.1/purchaseOrders;import'
};

exports['warehouse/exporter'] = {
  maxConcurrentUploads: 1,
  uploadUrl: 'http://127.0.0.1/warehouse;import'
};

exports.sapGui = {
  scriptsPath: 'C:/SAP/Scripts',
  jobs: []
};
