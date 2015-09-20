// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  'app/opinionSurveys/OpinionSurveyCollection',
  'app/opinionSurveys/dictionaries',
  '../views/OpinionSurveyResponseListView',
  '../views/OpinionSurveyResponseFilterView'
], function(
  t,
  bindLoadingMessage,
  FilteredListPage,
  OpinionSurveyCollection,
  dictionaries,
  OpinionSurveyResponseListView,
  OpinionSurveyResponseFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.opinionSurveys = bindLoadingMessage(new OpinionSurveyCollection(null, {
        rqlQuery: 'select(label,superiors,questions)&sort(-startDate)'
      }), this);

      this.listenToOnce(this.opinionSurveys, 'reset', function()
      {
        this.opinionSurveys.buildCacheMaps();
      });
    },

    createFilterView: function()
    {
      return new OpinionSurveyResponseFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery,
          opinionSurveys: this.opinionSurveys
        }
      });
    },

    createListView: function()
    {
      return new OpinionSurveyResponseListView({
        collection: this.collection,
        opinionSurveys: this.opinionSurveys
      });
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.opinionSurveys.fetch({reset: true}),
        dictionaries.load()
      );
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
