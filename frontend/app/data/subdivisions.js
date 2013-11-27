define([
  'app/subdivisions/SubdivisionCollection',
  './createStorage'
], function(
  SubdivisionCollection,
  createStorage
) {
  'use strict';

  return createStorage('SUBDIVISIONS', 'subdivisions', SubdivisionCollection);
});
