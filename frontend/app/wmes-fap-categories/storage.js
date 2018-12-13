// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/createOnDemandStorage',
  './CategoryCollection'
], function(
  createOnDemandStorage,
  CategoryCollection
) {
  'use strict';

  return createOnDemandStorage(function()
  {
    return new CategoryCollection(null, {
      paginate: false
    });
  });
});
