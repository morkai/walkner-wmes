// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      'fte.leader.deleted': 'onModelDeleted'
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
        var row = model.toJSON();

        row.subdivision = model.getSubdivisionPath();
        row.date = moment(row.date).format('LL');
        row.shift = t('core', 'SHIFT:' + row.shift);

        return row;
      });
    }
  });
});
