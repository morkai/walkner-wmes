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
