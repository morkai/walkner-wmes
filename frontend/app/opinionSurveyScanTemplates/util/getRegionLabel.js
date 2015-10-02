// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
