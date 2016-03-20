// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/isaPalletKinds/IsaPalletKindCollection',
  './createStorage'
], function(
  IsaPalletKindCollection,
  createStorage
) {
  'use strict';

  return createStorage('ISA_PALLET_KINDS', 'isaPalletKinds', IsaPalletKindCollection);
});
