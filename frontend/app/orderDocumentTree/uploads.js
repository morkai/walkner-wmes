// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './OrderDocumentUploadCollection'
], function(
  OrderDocumentUploadCollection
) {
  'use strict';

  return new OrderDocumentUploadCollection(null, {paginate: false});
});
