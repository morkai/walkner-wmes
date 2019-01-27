// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView'
], function(
  _,
  t,
  time,
  user,
  viewport,
  ListView
) {
  'use strict';

  var ANSWER_TO_ICON = {
    yes: 'thumbs-up',
    no: 'thumbs-down',
    na: 'question',
    null: 'circle-o'
  };

  return ListView.extend({

    className: 'is-clickable',

    serializeColumns: function()
    {
      var columns = [
        {id: 'survey', className: 'is-min'},
        {id: 'division', className: 'is-min'},
        {id: 'superior', className: 'is-min'},
        {id: 'employer', className: 'is-min'}
      ];
      var questions = {};
      var opinionSurveys = this.opinionSurveys;

      _.forEach(this.collection.usedSurveyIds, function(surveyId)
      {
        var survey = opinionSurveys.get(surveyId);

        if (!survey)
        {
          return;
        }

        survey.get('questions').forEach(function(question)
        {
          if (questions[question._id])
          {
            return;
          }

          columns.push({
            id: 'Q-' + question._id,
            label: question.short,
            thClassName: 'is-min',
            tdClassName: 'is-min opinionSurveyResponses-answer',
            noData: ''
          });

          questions[question._id] = true;
        });
      });

      columns.push({
        id: 'null',
        label: '&nbsp;',
        noData: ''
      });

      return columns;
    },

    serializeRows: function()
    {
      var opinionSurveys = this.opinionSurveys;

      return this.collection.map(function(response)
      {
        var survey = opinionSurveys.get(response.get('survey'));
        var row = response.serialize(survey);

        response.get('answers').forEach(function(answer)
        {
          row['Q-' + answer.question] = ANSWER_TO_ICON[answer.answer]
            ? ('<i class="fa fa-' + ANSWER_TO_ICON[answer.answer] + '"></i>')
            : answer.answer;
        });

        return row;
      });
    }

  });
});
