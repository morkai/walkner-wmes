define([
  'app/prodCenters/ProdCenterCollection',
  './createStorage'
], function(
  ProdCenterCollection,
  createStorage
) {
  'use strict';

  return createStorage('PROD_CENTERS', 'prodCenters', ProdCenterCollection);
});
