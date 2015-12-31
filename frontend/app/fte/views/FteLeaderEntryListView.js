// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/user',
  'app/data/subdivisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  time,
  t,
  user,
  subdivisions,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    remoteTopics: {
      'fte.leader.created': 'refreshCollection',
      'fte.leader.deleted': 'onModelDeleted'
    },

    serializeColumns: function()
    {
      return [
        {id: 'subdivision', className: 'is-min', label: t('core', 'ORG_UNIT:subdivision')},
        {id: 'date', className: 'is-min', label: t(this.collection.getNlsDomain(), 'property:date')},
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

        var editable = model.isEditable(user);

        if (editable === 'yes')
        {
          actions.push(
            ListView.actions.edit(model),
            ListView.actions.delete(model)
          );
        }
        else if (editable === 'request')
        {
          actions.push({
            id: 'requestChange',
            icon: 'edit',
            label: t('fte', 'LIST:ACTION:requestChange'),
            href: model.genClientUrl() + '?change=1'
          });
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
        row.date = time.format(row.date, 'LL');
        row.shift = t('core', 'SHIFT:' + row.shift);

        return row;
      });
    }
  });
});
