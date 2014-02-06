define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/data/views/renderOrgUnitPath',
  './decorateProdShiftOrder'
], function(
  _,
  t,
  user,
  viewport,
  ListView,
  prodLines,
  renderOrgUnitPath,
  decorateProdShiftOrder
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'production.synced.**': 'refreshCollection'
    },

    columns: [
      'mrpControllers', 'prodFlow', 'prodLine',
      'order', 'operation', 'prodShift', 'startedAt', 'duration', 'quantityDone', 'workerCount'
    ],

    serializeRows: function()
    {
      return this.collection.map(function(model)
      {
        return decorateProdShiftOrder(model, {orgUnits: true});
      });
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

    refreshCollection: function(message)
    {
      if (!message || this.collection.matches(message))
      {
        return ListView.prototype.refreshCollection.apply(this, arguments);
      }
    }

  });
});
