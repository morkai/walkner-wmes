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

    tableClassName: 'table-bordered table-hover table-condensed table-striped',

    columns: [
      {id: 'rid', className: 'is-min'},
      {id: 'survey', className: 'is-min'},
      {id: 'division', className: 'is-min'},
      {id: 'question', className: 'opinionSurveyActions-list-long'},
      {id: 'problem', className: 'opinionSurveyActions-list-long'},
      {id: 'cause', className: 'opinionSurveyActions-list-long'},
      {id: 'action', className: 'opinionSurveyActions-list-long'},
      {id: 'startDate', tdClassName: 'is-min'},
      {id: 'finishDate', tdClassName: 'is-min'},
      {id: 'owners', className: 'opinionSurveyActions-list-long'},
      'superior',
      {id: 'status', className: 'is-min'}
    ],

    serializeRows: function()
    {
      var opinionSurveys = this.opinionSurveys;

      return this.collection.map(function(action)
      {
        return action.serialize(opinionSurveys.get(action.get('survey')));
      });
    },

    serializeActions: function()
    {
      var collection = this.collection;
      var nlsDomain = collection.getNlsDomain();

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model, nlsDomain)];

        if (model.canEdit())
        {
          actions.push(ListView.actions.edit(model, nlsDomain));
        }

        if (model.canDelete())
        {
          actions.push(ListView.actions.delete(model, nlsDomain));
        }

        return actions;
      };
    }

  });
});
