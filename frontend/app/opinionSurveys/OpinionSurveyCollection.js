// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './OpinionSurvey'
], function(
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
    }

  });
});
