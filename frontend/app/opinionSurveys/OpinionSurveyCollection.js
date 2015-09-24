// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    rqlQuery: 'select(startDate,endDate,label)&limit(15)&sort(-startDate)',

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
