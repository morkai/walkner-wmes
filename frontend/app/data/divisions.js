define([
  'app/divisions/DivisionCollection',
  './createStorage'
], function(
  DivisionCollection,
  createStorage
) {
  'use strict';

  return createStorage('DIVISIONS', 'divisions', DivisionCollection);
});
