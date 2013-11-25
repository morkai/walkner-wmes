define([
  'moment',
  'app/i18n',
  'app/data/aors',
  'app/core/views/ListView',
  'i18n!app/nls/fte'
], function(
  moment,
  t,
  aors,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'fte.leader.created': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: 'aor', label: t('fte', 'leaderEntryList:aor')},
        {id: 'date', label: t('fte', 'leaderEntryList:date')},
        {id: 'shift', label: t('fte', 'leaderEntryList:shift')}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);

        return [
          ListView.actions.viewDetails(model),
          {
            icon: 'print',
            label: t('fte', 'LIST:ACTION:print'),
            href: model.genClientUrl('print')
          }
        ];
      };
    },

    serializeRows: function()
    {
      return this.collection.map(function(model)
      {
        var aor = aors.get(model.get('aor'));
        var row = model.toJSON();

        row.aor = aor ? aor.getLabel() : '?';
        row.date = moment(row.date).format('LL');
        row.shift = t('fte', 'shift:' + row.shift);

        return row;
      });
    }
  });
});
