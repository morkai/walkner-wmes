// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/core/views/ListView',
  '../util/decorateProdDowntime'
], function(
  _,
  t,
  user,
  time,
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

    columns: function()
    {
      return [
        {id: 'rid', className: 'is-min'},
        {id: 'orderMrp', tdClassName: 'is-min', label: t.bound('prodDowntimes', 'PROPERTY:mrpControllers')},
        {id: 'prodFlow', className: 'is-overflow w275', titleProperty: 'prodFlowText'},
        {id: 'aor', className: 'is-overflow w275'},
        {id: 'prodLine', className: 'is-overflow w125'},
        'reason',
        {id: 'startedAt', tdClassName: 'is-min'},
        {id: 'duration', tdClassName: 'is-min'}
      ];
    },

    serializeRows: function()
    {
      var options = this.options.simple ? null : {
        changesCount: true,
        maxReasonChanges: this.settings.getValue('maxReasonChanges') || Number.MAX_VALUE,
        maxAorChanges: this.settings.getValue('maxAorChanges') || Number.MAX_VALUE,
        productFamily: true
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
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);

      this.scheduleDurationsUpdate();
    },

    scheduleDurationsUpdate: function()
    {
      clearTimeout(this.timers.updateDurations);
      this.timers.updateDurations = setTimeout(this.updateDurations.bind(this), 15000);
    },

    updateDurations: function()
    {
      var view = this;
      var now = Date.now();

      this.$('td[data-id="duration"]').each(function()
      {
        var prodDowntime = view.collection.get(this.parentNode.dataset.id);

        if (!prodDowntime.get('finishedAt'))
        {
          this.textContent = prodDowntime.getDurationString(now);
        }
      });

      this.scheduleDurationsUpdate();
    }

  });
});
