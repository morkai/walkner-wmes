define([
  'app/prodFlows/ProdFlowCollection',
  './createStorage'
], function(
  ProdFlowCollection,
  createStorage
) {
  'use strict';

  return createStorage('PROD_FLOWS', 'prodFlows', ProdFlowCollection);
});
