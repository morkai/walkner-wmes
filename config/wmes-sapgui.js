'use strict';

var later = require('later');
later.date.localTime();

exports.id = 'wmes-sapgui';

exports.modules = [
  'directoryWatcher',
  'sapGui',
  {id: 'sapGui/exporter', name: 'sapGui/exporter:walkner-pos'},
  {id: 'sapGui/exporter', name: 'sapGui/exporter:philips-wmes'}
];

exports.directoryWatcher = {
  path: 'C:/SAP/Output'
};

exports.sapGui = {
  jobs: []
};

exports['sapGui/exporter:walkner-pos'] = {
  maxConcurrentUploads: 1,
  secretKey: '',
  filters: []
};

exports['sapGui/exporter:philips-wmes'] = {
  maxConcurrentUploads: 1,
  secretKey: '',
  filters: []
};
