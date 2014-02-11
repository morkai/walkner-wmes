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
