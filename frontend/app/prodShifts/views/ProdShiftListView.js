// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  user,
  ListView,
  prodLines,
  renderOrgUnitPath
) {
  'use strict';

  return ListView.extend({

    className: 'prodShifts-list is-clickable is-colored',

    remoteTopics: {
      'prodShifts.created.*': 'refreshIfMatches',
      'prodShifts.updated.*': 'refreshIfMatches',
      'prodShifts.deleted.*': 'refreshIfMatches'
    },

    serializeColumns: function()
    {
      return [
        {id: 'mrpControllers', className: 'is-min'},
        {id: 'prodFlow', className: 'is-min'},
        {id: 'prodLine', className: 'is-min'},
        {id: 'date', className: 'is-min'},
        {id: 'shift', className: 'is-min'},
        {id: 'totalQuantityDone', className: 'is-min is-number'},
        (user.isAllowedTo('PROD_DATA:VIEW:EFF') ? {id: 'efficiency', className: 'is-min is-number'} : null),
        {id: 'fill', label: '&nbsp;'}
      ];
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
            return renderOrgUnitPath(prodLines.get(view.$(this).text().trim()), false, false)
              .split(' \\ ')
              .join('<br>\\ ');
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
        var prodShift = this.collection.get(message._id);

        if (prodShift)
        {
          prodShift.set('quantitiesDone', message.quantitiesDone);
        }

        return;
      }

      this.refreshCollection();
    },

    isQuantityDoneMessage: function(topic, message)
    {
      return /updated/.test(topic)
        && Array.isArray(message.quantitiesDone)
        && Object.keys(message).length === 2;
    }

  });
});
