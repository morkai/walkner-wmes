// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  'app/purchaseOrders/templates/props'
], function(
  View,
  template
) {
  'use strict';

  // TODO: rerender on model change
  return View.extend({

    template: template,

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        po: this.model.serialize()
      };
    }

  });
});
