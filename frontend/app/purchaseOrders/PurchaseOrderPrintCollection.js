// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './PurchaseOrderPrint'
], function(
  Collection,
  PurchaseOrderPrint
) {
  'use strict';

  return Collection.extend({

    model: PurchaseOrderPrint,

    comparator: '_id',

    initialize: function()
    {
      this.byKey = {};
      this.byItem = {};

      this.on('reset change add', function()
      {
        this.byKey = {};
        this.byItem = {};

        for (var i = 0, l = this.length; i < l; ++i)
        {
          var model = this.models[i];
          var key = model.get('key');
          var item = model.get('item');

          if (this.byKey[key] === undefined)
          {
            this.byKey[key] = [model];
          }
          else
          {
            this.byKey[key].push(model);
          }

          if (this.byItem[item] === undefined)
          {
            this.byItem[item] = [model];
          }
          else
          {
            this.byItem[item].push(model);
          }
        }
      });
    }

  });
});
