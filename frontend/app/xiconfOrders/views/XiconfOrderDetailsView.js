// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
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

    linkToResults: function(orderNo, nc12, itemKind)
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
        var property = itemKind === 'led' ? 'leds.nc12' : /[A-Z]/i.test(nc12) ? 'program._id' : 'nc12';

        rqlQuery.selector.args.push({name: 'eq', args: [property, nc12]});
      }

      return this.xiconfResultCollection.genClientUrl() + '?' + rqlQuery;
    }

  });
});
