// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './OpinionSurveyResponse'
], function(
  Collection,
  OpinionSurveyResponse
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurveyResponse,

    rqlQuery: 'limit(15)&sort(-createdAt)',

    initialize: function()
    {
      Collection.prototype.initialize.apply(this, arguments);

      this.usedSurveyIds = [];
    },

    parse: function(res)
    {
      var responses = Collection.prototype.parse.call(this, res);
      var surveys = {};

      for (var i = 0; i < responses.length; ++i)
      {
        surveys[responses[i].survey] = 1;
      }

      this.usedSurveyIds = Object.keys(surveys);

      return responses;
    }

  });
});
