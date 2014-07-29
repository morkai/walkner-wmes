// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/data/views/renderOrgUnitPath'
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

    columns: ['prodLine', 'type', 'data', 'prodShift', 'prodShiftOrder', 'createdAt', 'creator'],

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
