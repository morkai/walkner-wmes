// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/paintShop/templates/queue',
  'app/paintShop/templates/queueOrder'
], function(
  $,
  t,
  viewport,
  View,
  queueTemplate,
  queueOrderTemplate
) {
  'use strict';

  return View.extend({

    template: queueTemplate,

    events: {

    },

    initialize: function()
    {

    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        orders: this.model.map(function(o) { return o.toJSON(); }),
        renderQueueOrder: queueOrderTemplate
      };
    },

    afterRender: function()
    {

    }

  });
});
