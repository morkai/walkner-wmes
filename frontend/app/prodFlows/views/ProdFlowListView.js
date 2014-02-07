define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  './decorateProdFlow'
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
