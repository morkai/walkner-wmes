// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/delayReasons/DelayReasonCollection',
  './createStorage'
], function(
  DelayReasonCollection,
  createStorage
) {
  'use strict';

  return createStorage('DELAY_REASONS', 'delayReasons', DelayReasonCollection);
});
