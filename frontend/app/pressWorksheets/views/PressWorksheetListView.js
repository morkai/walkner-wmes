define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  './decoratePressWorksheet'
], function(
  t,
  user,
  ListView,
  decoratePressWorksheet
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'companies.synced': 'render'
    },

    columns: ['date', 'shift', 'master', 'operator'],

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (user.isAllowedTo(model.getPrivilegePrefix() + ':MANAGE'))
        {
          //actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      return this.collection.toJSON().map(decoratePressWorksheet);
    }

  });
});
