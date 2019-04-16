// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/xiconf/XiconfResultCollection',
  'app/xiconfOrders/templates/details'
], function(
  _,
  t,
  View,
  XiconfResultCollection,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    initialize: function()
    {
      this.xiconfResultCollection = new XiconfResultCollection();
    },

    getTemplateData: function()
    {
      return {
        programPanelClassName: 'panel-' + this.model.getStatusClassName(),
        linkToResults: this.linkToResults.bind(this),
        model: this.serializeModel()
      };
    },

    serializeModel: function()
    {
      var model = this.model.toJSON();

      model.items = model.items.map(function(item)
      {
        var totalQuantityDone = item.quantityDone + item.extraQuantityDone;

        item.totalQuantityDone = totalQuantityDone;
        item.panelType = item.kind === 'gprs'
          ? 'default'
          : totalQuantityDone < item.quantityTodo
            ? 'danger'
            : totalQuantityDone > item.quantityTodo ? 'warning' : 'success';

        return item;
      });

      return model;
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenTo(this.model, 'change', this.render);
    },

    linkToResults: function(orderNo, nc12)
    {
      var rqlQuery = this.xiconfResultCollection.rqlQuery;

      rqlQuery.sort = {startedAt: 1};
      rqlQuery.selector.args = [];

      if (orderNo)
      {
        rqlQuery.selector.args.push({name: 'eq', args: ['orderNo', orderNo]});
      }

      if (nc12)
      {
        rqlQuery.selector.args.push({name: 'eq', args: ['search', nc12]});
      }

      return this.xiconfResultCollection.genClientUrl() + '?' + rqlQuery;
    }

  });
});
