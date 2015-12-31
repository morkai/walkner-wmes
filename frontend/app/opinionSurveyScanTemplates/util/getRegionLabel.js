// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n'
], function(
  _,
  t
) {
  'use strict';

  return function getRegionLabel(survey, questionId)
  {
    var label = '?';

    if (t.has('opinionSurveyScanTemplates', 'regionType:' + questionId))
    {
      label = t('opinionSurveyScanTemplates', 'regionType:' + questionId);
    }
    else
    {
      var questions = survey ? (survey.questions || survey.get('questions')) : [];
      var question = _.find(questions, {_id: questionId});

      if (question)
      {
        label = question.short;
      }
    }

    return label;
  };
});
