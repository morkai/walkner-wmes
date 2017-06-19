// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/FilteredListPage',
  'app/opinionSurveys/OpinionSurveyCollection',
  'app/opinionSurveys/dictionaries',
  '../views/OpinionSurveyOmrResultListView',
  '../views/OpinionSurveyOmrResultFilterView'
], function(
  t,
  bindLoadingMessage,
  FilteredListPage,
  OpinionSurveyCollection,
  dictionaries,
  OpinionSurveyOmrResultListView,
  OpinionSurveyOmrResultFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,

    actions: [],

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
      return new OpinionSurveyOmrResultFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery,
          opinionSurveys: this.opinionSurveys
        }
      });
    },

    createListView: function()
    {
      return new OpinionSurveyOmrResultListView({
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
