define([
  'app/downtimeReasons/DowntimeReasonCollection',
  './createStorage'
], function(
  DowntimeReasonCollection,
  createStorage
) {
  'use strict';

  return createStorage('DOWNTIME_REASONS', 'downtimeReasons', DowntimeReasonCollection);
});
