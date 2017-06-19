// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/aors/AorCollection',
  './createStorage'
], function(
  AorCollection,
  createStorage
) {
  'use strict';

  return createStorage('AORS', 'aors', AorCollection);
});
