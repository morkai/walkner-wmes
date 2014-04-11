define([
  'moment',
  'app/i18n',
  'app/user',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  moment,
  t,
  user,
  divisions,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'hourlyPlans.created': 'refreshCollection',
      'hourlyPlans.deleted': 'onModelDeleted'
    },

    serializeColumns: function()
    {
      return [
        {id: 'division', label: t('core', 'ORG_UNIT:division')},
        {id: 'date', label: t('hourlyPlans', 'property:date')},
        {id: 'shift', label: t('hourlyPlans', 'property:shift')}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [
          ListView.actions.viewDetails(model),
          {
            icon: 'print',
            label: t('core', 'LIST:ACTION:print'),
            href: model.genClientUrl('print')
          }
        ];

        if (model.isEditable(user))
        {
          actions.push(
            ListView.actions.edit(model),
            ListView.actions.delete(model)
          );
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      return this.collection.map(function(model)
      {
        var division = divisions.get(model.get('division'));
        var row = model.toJSON();

        row.division = division ? renderOrgUnitPath(division, false, false) : '?';
        row.date = moment(row.date).format('LL');
        row.shift = t('core', 'SHIFT:' + row.shift);

        return row;
      });
    }
  });
});
