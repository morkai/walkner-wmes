define([
  'app/i18n',
  'app/time',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/core/views/ListView',
  'i18n!app/nls/production'
], function(
  t,
  time,
  aors,
  downtimeReasons,
  ListView
) {
  'use strict';

  // TODO: Refresh collection on a remote status change

  return ListView.extend({

    localTopics: {
      'downtimeReasons.synced': 'render',
      'aors.synced': 'render'
    },

    remoteTopics: {},

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.collection, 'add', this.render);
      this.listenTo(this.collection, 'change', this.render);
      this.listenTo(this.collection, 'remove', this.render);
    },

    serializeColumns: function()
    {
      return [
        {id: 'startedAt', label: t('production', 'prodDowntime:startedAt')},
        {id: 'finishedAt', label: t('production', 'prodDowntime:finishedAt')},
        {id: 'reason', label: t('production', 'prodDowntime:reason')},
        {id: 'aor', label: t('production', 'prodDowntime:aor')}
      ];
    },

    serializeRows: function()
    {
      return this.collection.map(function(prodDowntime)
      {
        var row = prodDowntime.toJSON();
        var aor = aors.get(row.aor);
        var reason = downtimeReasons.get(row.reason);

        row.className = prodDowntime.getCssClassName();
        row.startedAt = time.format(row.startedAt, 'YYYY-MM-DD HH:mm:ss');
        row.finishedAt = row.finishedAt ? time.format(row.finishedAt, 'YYYY-MM-DD HH:mm:ss') : '-';

        if (aor)
        {
          row.aor = aor.get('name');
        }

        if (reason)
        {
          row.reason = reason.get('label');
        }

        return row;
      });
    },

    serializeActions: function()
    {
      return [];
    }

  });
});
