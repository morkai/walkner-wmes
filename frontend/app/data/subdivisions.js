// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
