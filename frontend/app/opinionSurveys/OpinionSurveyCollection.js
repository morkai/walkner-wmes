// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Collection',
  './OpinionSurvey'
], function(
  _,
  Collection,
  OpinionSurvey
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurvey,

    rqlQuery: 'select(startDate,endDate,label)&limit(20)&sort(-startDate)',

    buildCacheMaps: function()
    {
      for (var i = 0; i < this.models.length; ++i)
      {
        this.models[i].buildCacheMaps();
      }
    },

    getSuperiors: function()
    {
      var superiors = {};

      this.forEach(function(survey)
      {
        _.forEach(survey.get('superiors'), function(superior)
        {
          if (!superiors[superior._id])
          {
            superiors[superior._id] = superior;
          }
        });
      });

      return _.values(superiors);
    }

  });
});
