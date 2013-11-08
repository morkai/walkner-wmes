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
