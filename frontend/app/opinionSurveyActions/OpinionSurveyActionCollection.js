// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './OpinionSurveyAction'
], function(
  Collection,
  OpinionSurveyAction
) {
  'use strict';

  return Collection.extend({

    model: OpinionSurveyAction,

    rqlQuery: 'limit(20)&sort(-createdAt)',

    initialize: function()
    {
      Collection.prototype.initialize.apply(this, arguments);

      this.usedSurveyIds = [];
    },

    parse: function(res)
    {
      var actions = Collection.prototype.parse.call(this, res);
      var surveys = {};

      for (var i = 0; i < actions.length; ++i)
      {
        surveys[actions[i].survey] = 1;
      }

      this.usedSurveyIds = Object.keys(surveys);

      return actions;
    }

  });
});
