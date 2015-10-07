// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/opinionSurveys/dictionaries'
], function(
  _,
  t,
  time,
  user,
  viewport,
  ListView,
  dictionaries
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
          row['Q-' + answer.question] = '<i class="fa fa-' + ANSWER_TO_ICON[answer.answer] + '"></i>';
        });

        return row;
      });
    }

  });
});
