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

      obj.paperText = /^vendor\//.test(obj.paper)
        ? t('purchaseOrders', 'paper:vendor', {vendorNo: obj.paper.split('/')[1]})
        : t('purchaseOrders', 'paper:' + obj.paper);

      obj.barcodeText = t('purchaseOrders', 'barcode:' + obj.barcode);

      return obj;
    }

  });
});
