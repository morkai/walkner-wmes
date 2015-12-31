// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/prodFunctions/ProdFunctionCollection',
  './createStorage'
], function(
  ProdFunctionCollection,
  createStorage
) {
  'use strict';

  return createStorage('PROD_FUNCTIONS', 'prodFunctions', ProdFunctionCollection);
});
