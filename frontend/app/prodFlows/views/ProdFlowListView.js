define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  './decorateProdFlow',
  'i18n!app/nls/prodTasks'
], function(
  renderOrgUnitPath,
  ListView,
  decorateProdFlow
) {
  'use strict';

  return ListView.extend({

    columns: ['subdivision', 'mrpControllers', 'name'],

    serializeRows: function()
    {
      return this.collection.map(function(prodFlow)
      {
        return decorateProdFlow(prodFlow, true);
      });
    }

  });
});
