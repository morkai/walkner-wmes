define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  _,
  t,
  user,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['subdivision', '_id', 'description'],

    serializeRows: function()
    {
      return this.collection.map(function(mrpControllerModel)
      {
        var row = mrpControllerModel.toJSON();

        row.subdivision = renderOrgUnitPath(mrpControllerModel, true);

        return row;
      });
    }

  });
});
