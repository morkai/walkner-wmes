// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  user,
  viewport,
  ListView,
  prodLines,
  renderOrgUnitPath
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'production.synced.**': 'refreshCollection',
      'production.edited.**': function()
      {
        this.refreshCollection();
      }
    },

    columns: [
      {id: 'prodLine', className: 'is-min'},
      {id: 'type', className: 'is-min'},
      'data',
      {id: 'prodShift', className: 'is-min'},
      {id: 'prodShiftOrder', className: 'is-min'},
      {id: 'createdAt', className: 'is-min'},
      {id: 'creator', className: 'is-min'},
      {id: 'instanceId', className: 'is-min'}
    ],

    serializeActions: function()
    {
      return null;
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
