// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  _,
  user,
  viewport,
  ListView,
  prodLines,
  renderOrgUnitPath
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable is-colored',

    refreshDelay: 6000,

    remoteTopics: {
      'prodShiftOrders.created.*': 'refreshIfMatches',
      'prodShiftOrders.updated.*': 'refreshIfMatches',
      'prodShiftOrders.deleted.*': 'refreshIfMatches'
    },

    serializeColumns: function()
    {
      return [
        {id: 'mrpControllers', className: 'is-min'},
        'prodFlow',
        {id: 'prodLine', className: 'is-min'},
        'order',
        'operation',
        {id: 'prodShift', className: 'is-min'},
        {id: 'startedAt', className: 'is-min'},
        {id: 'duration', className: 'is-min'},
        {id: 'quantityDone', className: 'is-min'},
        {id: 'workerCount', className: 'is-min'},
        (user.isAllowedTo('PROD_DATA:VIEW:EFF') ? {id: 'efficiency', className: 'is-min'} : null)
      ];
    },

    serializeRow: function(model)
    {
      return model.serializeRow({orgUnits: true});
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        return [ListView.actions.viewDetails(collection.get(row._id))];
      };
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      var view = this;

      this.$('.list-item > td[data-id="prodLine"]')
        .popover({
          container: this.el,
          trigger: 'hover',
          placement: 'auto right',
          html: true,
          content: function()
          {
            var path = renderOrgUnitPath(prodLines.get(view.$(this).text().trim()), false, false);

            return path ? path.split(' \\ ').join('<br>\\ ') : '?';
          }
        });
    },

    refreshIfMatches: function(message, topic)
    {
      if (!this.collection.hasOrMatches(message))
      {
        return;
      }

      if (this.isQuantityDoneMessage(topic, message))
      {
        return;
      }

      this.refreshCollection();
    },

    isQuantityDoneMessage: function(topic, message)
    {
      if (!/updated/.test(topic))
      {
        return false;
      }

      return /updated/.test(topic)
        && _.isNumber(message.quantityDone)
        && _.isNumber(message.totalQuantity)
        && _.isNumber(message.avgTaktTime)
        && _.isNumber(message.lastTaktTime);
    }

  });
});
