// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/opinionSurveys/OpinionSurveyCollection',
  'app/opinionSurveys/dictionaries',
  '../views/OpinionSurveyActionListView',
  '../views/OpinionSurveyActionFilterView'
], function(
  t,
  user,
  bindLoadingMessage,
  pageActions,
  FilteredListPage,
  OpinionSurveyCollection,
  dictionaries,
  OpinionSurveyActionListView,
  OpinionSurveyActionFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: true,

    actions: function()
    {
      var collection = this.collection;

      return [
        pageActions.jump(this, collection),
        pageActions.add(collection, function()
        {
          return user.isAllowedTo('OPINION_SURVEYS:MANAGE')
            || user.data.prodFunction === 'manager'
            || user.data.prodFunction === 'master';
        })
      ];
    },

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
      return new OpinionSurveyActionFilterView({
        model: {
          nlsDomain: this.collection.getNlsDomain(),
          rqlQuery: this.collection.rqlQuery,
          opinionSurveys: this.opinionSurveys
        }
      });
    },

    createListView: function()
    {
      return new OpinionSurveyActionListView({
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
