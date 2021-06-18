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

    events: _.assign({

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      var mechOrderTerm = this.collection.findRqlTerm('mechOrder', 'eq');
      var prodOrder = !mechOrderTerm || !mechOrderTerm.args[1];

      return [
        {
          id: 'mrpControllers',
          titleProperty: 'mrpControllersText',
          className: 'is-overflow w100',
          thClassName: 'is-filter'
        },
        {id: 'prodFlow', className: 'is-overflow w200', thClassName: 'is-filter'},
        {id: 'prodLine', className: 'is-overflow w100', thClassName: 'is-filter'},
        {
          id: 'orderId',
          className: 'is-min',
          thClassName: 'is-filter',
          visible: prodOrder
        },
        {id: 'product', className: 'is-overflow w450', thClassName: 'is-filter'},
        {id: 'operation', titleProperty: 'operationName', className: 'is-overflow w175'},
        {id: 'prodShift', className: 'is-min', width: '105px', thClassName: 'is-filter'},
        {id: 'startedAt', className: 'is-min', thClassName: 'is-filter'},
        {id: 'duration', className: 'is-min'},
        {id: 'quantityDone', className: 'is-min is-number'},
        {id: 'workerCount', className: 'is-min is-number'},
        {id: 'efficiency', className: 'is-min is-number', visible: user.isAllowedTo('PROD_DATA:VIEW:EFF')},
        {id: 'planOrderGroup', className: 'is-min', visible: prodOrder},
        '-'
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
