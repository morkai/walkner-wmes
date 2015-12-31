// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/time',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  t,
  user,
  time,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  function createDescriptionTdAttrs(row)
  {
    return row.deactivatedAt === '-' ? '' : 'class="is-deleted"';
  }

  return ListView.extend({

    deactivatedVisible: false,

    columns: [
      {id: 'subdivision', className: 'is-min'},
      {id: '_id', className: 'is-min'},
      {id: 'inout', className: 'is-min'},
      {id: 'description', tdAttrs: createDescriptionTdAttrs},
      {id: 'deactivatedAt', className: 'is-min'},
      {id: 'replacedBy', className: 'is-min'}
    ],

    serializeActions: function()
    {
      var collection = this.collection;
      var nlsDomain = collection.getNlsDomain();

      return function(row)
      {
        var model = collection.get(row._id);
        var active = !model.get('deactivatedAt') || user.data.super;
        var actions = [];

        actions.push(ListView.actions.viewDetails(model, nlsDomain));

        if (active && user.isAllowedTo(model.getPrivilegePrefix() + ':MANAGE'))
        {
          actions.push(
            ListView.actions.edit(model, nlsDomain),
            ListView.actions.delete(model, nlsDomain)
          );
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      var deactivatedVisible = this.deactivatedVisible;

      return this.collection
        .filter(function(mrpController)
        {
          return deactivatedVisible || !mrpController.get('deactivatedAt');
        })
        .map(function(mrpController)
        {
          var row = mrpController.toJSON();

          row.className = row.deactivatedAt ? 'is-deactivated' : '';
          row.subdivision = renderOrgUnitPath(mrpController, true);
          row.deactivatedAt = row.deactivatedAt ? time.format(row.deactivatedAt, 'LL') : '-';
          row.inout = t('mrpControllers', 'inout:' + row.inout);
          row.replacedBy = row.replacedBy || '-';

          return row;
        });
    },

    toggleDeactivated: function(state)
    {
      this.deactivatedVisible = state;

      this.render();
    }

  });
});
