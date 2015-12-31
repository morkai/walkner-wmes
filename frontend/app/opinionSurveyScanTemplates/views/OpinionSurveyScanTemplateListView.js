// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    serializeColumns: function()
    {
      return [
        {id: 'survey', className: 'is-min'},
        {id: 'pageNumber', className: 'is-min'},
        {id: 'name'}
      ];
    },

    serializeRows: function()
    {
      var opinionSurveys = this.opinionSurveys;

      return this.collection.map(function(scanTemplate)
      {
        var survey = opinionSurveys.get(scanTemplate.get('survey'));
        var row = scanTemplate.serialize(survey);

        return row;
      });
    }

  });
});
