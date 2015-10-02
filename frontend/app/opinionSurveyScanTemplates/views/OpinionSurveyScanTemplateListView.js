// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
