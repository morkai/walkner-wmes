// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/createOnDemandStorage',
  './SubCategoryCollection'
], function(
  createOnDemandStorage,
  SubCategoryCollection
) {
  'use strict';

  return createOnDemandStorage(function()
  {
    return new SubCategoryCollection(null, {
      paginate: false
    });
  });
});
