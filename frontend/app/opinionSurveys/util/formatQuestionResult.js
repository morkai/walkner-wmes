// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
