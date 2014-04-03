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

    columns: ['rid', 'type', 'date', 'shift', 'master', 'operator'],

    serializeActions: function()
    {
      var collection = this.collection;
      var canManageProdData = user.isAllowedTo('PROD_DATA:MANAGE');
      var eightHours = 8 * 3600 * 1000;
      var now = Date.now();

      function canManage(model)
      {
        if (canManageProdData)
        {
          return true;
        }

        return user.isAllowedTo('PRESS_WORKSHEETS:MANAGE')
          && user.data._id === model.get('creator').id
          && Date.parse(model.get('createdAt')) + eightHours > now;
      }

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (canManage(model))
        {
          actions.push(ListView.actions.edit(model));
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      return this.collection.map(decoratePressWorksheet);
    }

  });
});
