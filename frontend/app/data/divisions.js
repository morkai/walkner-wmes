// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
