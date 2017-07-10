// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/paintShop/templates/orderDetails'
], function(
  $,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'paintShop-orderDetails-dialog',

    events: {

    },

    initialize: function()
    {

    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        model: this.model.serialize()
      };
    },

    afterRender: function()
    {

    }

  });
});
