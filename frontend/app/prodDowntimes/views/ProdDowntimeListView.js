// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  '../util/decorateProdDowntime'
], function(
  _,
  t,
  user,
  ListView,
  decorateProdDowntime
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored is-clickable prodDowntimes-list',

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

    serializeRows: function()
    {
      var options = this.options.simple ? null : {
        changesCount: true,
        maxReasonChanges: this.settings.getValue('maxReasonChanges') || Number.MAX_VALUE,
        maxAorChanges: this.settings.getValue('maxAorChanges') || Number.MAX_VALUE
      };

      return this.collection.map(function(model)
      {
        return decorateProdDowntime(model, options);
      });
    },

    serializeActions: function()
    {
      if (this.options.simple)
      {
        return null;
      }

      var collection = this.collection;
      var canChangeStatusOptions = this.settings.getCanChangeStatusOptions();
      var rejectedChangesCountTitle = t('prodDowntimes', 'changesCount:rejected');

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (model.canCorroborate())
        {
          var canChangeStatus = model.canChangeStatus(canChangeStatusOptions);
          var label = t('prodDowntimes', 'LIST:ACTION:' + (canChangeStatus ? 'corroborate' : 'comment'));
          var text = null;
          var changesCount = row.changesCount;

          if (changesCount.rejected)
          {
            text = '<span title="' + rejectedChangesCountTitle + '" class="label label-'
              + (changesCount.rejected >= canChangeStatusOptions.maxRejectedChanges ? 'danger' : 'warning')
              + '">' + changesCount.rejected + '</span>';
          }

          actions.unshift({
            id: 'corroborate',
            icon: canChangeStatus ? 'gavel' : 'comment',
            label: label,
            href: model.genClientUrl() + '?corroborate=1',
            text: text
          });
        }

        if (model.isEditable() && canChangeStatusOptions.canManageProdData)
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
        this.refreshCollection(message);
      }
    }

  });
});
