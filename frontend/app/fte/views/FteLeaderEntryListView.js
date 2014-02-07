define([
  'moment',
  'app/i18n',
  'app/user',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  moment,
  t,
  user,
  subdivisions,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'fte.leader.created': 'refreshCollection',
      'fte.leader.locked': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: 'subdivision', label: t('core', 'ORG_UNIT:subdivision')},
        {id: 'date', label: t(this.collection.getNlsDomain(), 'property:date')},
        {id: 'shift', label: t(this.collection.getNlsDomain(), 'property:shift')}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];
        var privilegePrefix = model.getPrivilegePrefix();

        if (row.locked)
        {
          actions.push({
            icon: 'print',
            label: t(model.getNlsDomain(), 'LIST:ACTION:print'),
            href: model.genClientUrl('print')
          });
        }
        else if (user.isAllowedTo(privilegePrefix + ':MANAGE'))
        {
          if (!user.isAllowedTo(privilegePrefix + ':ALL'))
          {
            var userDivision = user.getDivision();
            var subdivision = subdivisions.get(model.get('subdivision'));

            if (userDivision && userDivision.get('_id') !== subdivision.get('division'))
            {
              return actions;
            }
          }

          actions.push({
            icon: 'edit',
            label: t(model.getNlsDomain(), 'LIST:ACTION:edit'),
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
        var subdivision = subdivisions.get(model.get('subdivision'));
        var row = model.toJSON();

        row.subdivision = subdivision ? renderOrgUnitPath(subdivision, false, false) : '?';
        row.date = moment(row.date).format('LL');
        row.shift = t('core', 'SHIFT:' + row.shift);

        return row;
      });
    }
  });
});
