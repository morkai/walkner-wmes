define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/data/views/renderOrgUnitPath',
  './decorateProdLogEntry'
], function(
  _,
  t,
  user,
  viewport,
  ListView,
  prodLines,
  renderOrgUnitPath,
  decorateProdLogEntry
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

    columns: ['prodLine', 'type', 'data', 'prodShift', 'prodShiftOrder', 'createdAt', 'creator'],

    serializeRows: function()
    {
      return this.collection.map(decorateProdLogEntry);
    },

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
