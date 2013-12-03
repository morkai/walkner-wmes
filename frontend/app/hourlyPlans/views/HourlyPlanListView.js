define([
  'moment',
  'app/i18n',
  'app/user',
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  'i18n!app/nls/hourlyPlans'
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
      'hourlyPlans.locked': 'refreshCollection'
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
        var actions = [ListView.actions.viewDetails(model)];

        if (row.locked)
        {
          actions.push({
            icon: 'print',
            label: t('hourlyPlans', 'LIST:ACTION:print'),
            href: model.genClientUrl('print')
          });
        }
        else if (user.isAllowedTo('HOURLY_PLANS:MANAGE'))
        {
          if (!user.isAllowedTo('HOURLY_PLANS:ALL'))
          {
            var userDivision = user.getDivision();

            if (userDivision && userDivision.id !== model.get('division'))
            {
              return actions;
            }
          }

          actions.push({
            icon: 'edit',
            label: t('hourlyPlans', 'LIST:ACTION:edit'),
            href: model.genClientUrl('edit')
          });
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
