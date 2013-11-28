define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/core/views/ListView',
  'i18n!app/nls/prodTasks'
], function(
  _,
  t,
  user,
  divisions,
  subdivisions,
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
        var subdivisionModel = subdivisions.get(row.subdivision);

        row.subdivision = null;

        if (subdivisionModel)
        {
          var divisionModel = divisions.get(subdivisionModel.get('division'));

          if (divisionModel)
          {
            row.subdivision = _.escape(divisionModel.getLabel())
              + ' \\ '
              + _.escape(subdivisionModel.getLabel());
          }
        }

        return row;
      });
    }

  });
});
