// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView'
], function(
  _,
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored is-clickable',

    remoteTopics: {
      'prodDowntimes.created.*': 'refreshIfMatches',
      'prodDowntimes.updated.*': 'refreshIfMatches',
      'prodDowntimes.deleted.*': 'refreshIfMatches'
    },

    columns: [
      {id: 'rid', className: 'is-min'},
      {id: 'mrpControllers', tdClassName: 'is-min'},
      'prodFlow',
      'aor',
      {id: 'prodLine', tdClassName: 'is-min'},
      'reason',
      'startedAt',
      'finishedAt',
      {id: 'duration', tdClassName: 'is-min'}
    ],

    serializeActions: function()
    {
      if (this.options.simple)
      {
        return null;
      }

      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (model.canCorroborate())
        {
          var canChangeStatus = model.canChangeStatus();

          actions.unshift({
            id: 'corroborate',
            icon: canChangeStatus ? 'gavel' : 'comment',
            label: t('prodDowntimes', 'LIST:ACTION:' + (canChangeStatus ? 'corroborate' : 'comment')),
            href: model.genClientUrl() + '?corroborate=1'
          });
        }

        if (model.isEditable() && user.isAllowedTo('PROD_DATA:MANAGE'))
        {
          actions.push(
            ListView.actions.edit(model),
            ListView.actions.delete(model)
          );
        }

        return actions;
      };
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
