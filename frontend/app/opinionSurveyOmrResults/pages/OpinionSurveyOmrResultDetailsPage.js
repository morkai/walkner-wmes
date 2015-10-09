// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/pages/DetailsPage',
  'app/opinionSurveys/dictionaries',
  '../views/OpinionSurveyOmrResultDetailsView'
], function(
  DetailsPage,
  dictionaries,
  OpinionSurveyOmrResultDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: OpinionSurveyOmrResultDetailsView,
    baseBreadcrumb: true,

    actions: [],

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    load: function(when)
    {
      return when(this.model.fetch(), dictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
