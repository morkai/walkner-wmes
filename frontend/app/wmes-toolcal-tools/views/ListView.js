// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/views/ListView'
], function(
  _,
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'toolcal-tools-list is-clickable',

    serializeColumns: function()
    {
      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'type', className: 'is-min'},
        {id: 'name'},
        {id: 'sn', className: 'is-min'},
        {id: 'lastDate', className: 'is-min'},
        {id: 'interval', className: 'is-min'},
        {id: 'nextDate', className: 'is-min'},
        {id: 'users'}
      ];
    },

    serializeActions: function()
    {
      var view = this;
      var collection = view.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (model.canEdit())
        {
          actions.push(ListView.actions.edit(model));
        }

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    }

  });
});
