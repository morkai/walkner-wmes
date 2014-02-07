define([
  'app/i18n',
  'app/time',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/core/views/ListView'
], function(
  t,
  time,
  aors,
  downtimeReasons,
  ListView
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'downtimeReasons.synced': 'render',
      'aors.synced': 'render'
    },

    remoteTopics: function()
    {
      var topics = {};

      if (this.options.prodLine)
      {
        topics['prodDowntimes.corroborated.' + this.options.prodLine] = 'onCorroborated';
      }

      return topics;
    },

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
    },

    onCorroborated: function(message)
    {
      var prodDowntime = this.collection.get(message._id);

      if (prodDowntime)
      {
        prodDowntime.set(message);

        this.trigger('corroborated', message._id);
      }
    }

  });
});
