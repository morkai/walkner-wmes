// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
