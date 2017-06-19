// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function formatQuestionResult(result)
  {
    var html = '<div class="opinionSurveys-select2">';
    html += '<h3>' + _.escape(result.short || result.question.get('short')) + '</h3>';
    html += '<p>' + _.escape(result.full || result.question.get('full')) + '</p>';
    html += '</div>';

    return html;
  };
});
