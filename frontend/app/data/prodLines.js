// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/prodLines/ProdLineCollection',
  './createStorage'
], function(
  ProdLineCollection,
  createStorage
) {
  'use strict';

  return createStorage('PROD_LINES', 'prodLines', ProdLineCollection);
});
