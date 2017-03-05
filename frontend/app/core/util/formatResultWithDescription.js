// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function formatResultWithDescription(headerProp, descriptionProp, result)
  {
    if (_.isEmpty(result[descriptionProp]))
    {
      return _.escape(result[headerProp]);
    }

    var html = '<div class="select2-result-with-description">';
    html += '<h3>' + _.escape(result[headerProp]) + '</h3>';
    html += '<p>' + _.escape(result[descriptionProp]) + '</p>';
    html += '</div>';

    return html;
  };
});
