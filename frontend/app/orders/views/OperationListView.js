// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/View',
  'app/orders/templates/operationList'
], function(
  View,
  operationListTemplate
) {
  'use strict';

  return View.extend({

    template: operationListTemplate,

    serialize: function()
    {
      return {
        operations: this.model.get('operations').toJSON(),
        highlighted: this.options.highlighted
      };
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:operations', this.render);
    }

  });
});
