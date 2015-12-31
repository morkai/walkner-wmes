// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  'app/core/util/colorLabel'
], function(
  Model,
  colorLabel
) {
  'use strict';

  return Model.extend({

    urlRoot: '/opinionSurveys/employers',

    clientUrlRoot: '#opinionSurveyEmployers',

    topicPrefix: 'opinionSurveys.employers',

    privilegePrefix: 'OPINION_SURVEYS',

    nlsDomain: 'opinionSurveyEmployers',

    labelAttribute: 'short',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.color = colorLabel(obj.color);

      return obj;
    }

  });
});
