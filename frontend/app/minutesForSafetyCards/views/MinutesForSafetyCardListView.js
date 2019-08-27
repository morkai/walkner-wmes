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

    className: 'is-clickable',

    serializeColumns: function()
    {
      if (this.options.simple)
      {
        return [
          {id: 'rid', className: 'is-min is-number'},
          {id: 'date', className: 'is-min'},
          {id: 'section', className: 'is-min'},
          'subject'
        ];
      }

      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'date', className: 'is-min'},
        {id: 'section', className: 'is-min'},
        {id: 'owner', className: 'is-min'},
        {id: 'confirmer', className: 'is-min'},
        'subject'
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return this.options.simple ? null : function(row)
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
