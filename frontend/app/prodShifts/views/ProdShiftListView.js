// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/ListView',
  'app/data/prodLines',
  'app/data/views/renderOrgUnitPath'
], function(
  ListView,
  prodLines,
  renderOrgUnitPath
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    remoteTopics: {
      'prodShifts.created.*': 'refreshIfMatches',
      'prodShifts.updated.*': 'refreshIfMatches',
      'prodShifts.deleted.*': 'refreshIfMatches'
    },

    columns: ['mrpControllers', 'prodFlow', 'prodLine', 'date', 'shift', 'createdAt', 'creator'],

    serializeRow: function(model)
    {
      return model.serialize({orgUnits: true});
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

    refreshIfMatches: function(message)
    {
      if (this.collection.hasOrMatches(message))
      {
        this.refreshCollection();
      }
    }

  });
});
