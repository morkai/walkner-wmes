// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    serializeColumns: function()
    {
      return [
        {id: 'status', className: 'is-min'},
        {id: 'survey', className: 'is-min'},
        {id: 'pageNumber', className: 'is-min is-number'},
        {id: 'matchScore', className: 'is-min is-number'},
        {id: 'errorCode'}
      ];
    },

    serializeRows: function()
    {
      var opinionSurveys = this.opinionSurveys;

      return this.collection.map(function(omrResult)
      {
        var survey = opinionSurveys.get(omrResult.get('survey'));
        var row = omrResult.serialize(survey);

        return row;
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

        if (model.get('status') === 'unrecognized')
        {
          actions.push(
            {
              label: t.bound(nlsDomain, 'PAGE_ACTION:edit'),
              icon: 'edit',
              href: '#opinionSurveyResponses/' + model.get('response') + ';edit?fix=' + model.id
            },
            ListView.actions.delete(model, nlsDomain)
          );
        }

        return actions;
      };
    }

  });
});
