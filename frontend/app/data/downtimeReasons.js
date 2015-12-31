// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
