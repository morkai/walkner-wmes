// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'purchaseOrders',

    serialize: function()
    {
      var obj = this.toJSON();

      if (obj.printer === 'browser')
      {
        obj.printer = t('purchaseOrders', 'printer:browser');
      }

      obj.barcodeText = t('purchaseOrders', 'barcode:' + obj.barcode);

      var matches = obj.paper.match(/^vendor\/(.*?)\/(.*?)$/);

      if (matches === null)
      {
        obj.paperText = t('purchaseOrders', 'paper:' + obj.paper);
      }
      else
      {
        obj.paperText = t('purchaseOrders', 'paper:vendor', {
          vendorNo: matches[1],
          paper: matches[2]
        });
      }

      return obj;
    }

  });
});
