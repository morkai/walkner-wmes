// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../i18n',
  '../core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

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
