// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/divisions',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  time,
  t,
  user,
  divisions,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    remoteTopics: {
      'hourlyPlans.created': 'refreshCollection',
      'hourlyPlans.deleted': 'onModelDeleted'
    },

    serializeColumns: function()
    {
      return [
        {id: 'division', className: 'is-min', label: t('core', 'ORG_UNIT:division')},
        {id: 'date', className: 'is-min', label: t('hourlyPlans', 'property:date')},
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
        row.date = time.format(row.date, 'LL');
        row.shift = t('core', 'SHIFT:' + row.shift);

        return row;
      });
    }
  });
});
