// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../data/createOnDemandStorage',
  './DelayReasonCollection'
], function(
  createOnDemandStorage,
  DelayReasonCollection
) {
  'use strict';

  return createOnDemandStorage(function()
  {
    return new DelayReasonCollection(null, {
      paginate: false
    });
  });
});
