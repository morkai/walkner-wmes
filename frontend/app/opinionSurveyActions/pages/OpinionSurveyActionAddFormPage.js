// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  'app/core/util/bindLoadingMessage',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveys/OpinionSurveyCollection',
  '../views/OpinionSurveyActionFormView'
], function(
  AddFormPage,
  bindLoadingMessage,
  dictionaries,
  OpinionSurveyCollection,
  OpinionSurveyActionFormView
) {
  'use strict';

  return AddFormPage.extend({

    baseBreadcrumb: true,
    FormView: OpinionSurveyActionFormView,

    defineModels: function()
    {
      AddFormPage.prototype.defineModels.apply(this, arguments);

      this.model.surveys = bindLoadingMessage(new OpinionSurveyCollection(null, {
        rqlQuery: 'sort(-startDate)'
      }), this);

      this.listenToOnce(this.model.surveys, 'reset', function()
      {
        this.model.surveys.buildCacheMaps();
      });
    },

    load: function(when)
    {
      return when(this.model.surveys.fetch({reset: true}), dictionaries.load());
    },

    destroy: function()
    {
      AddFormPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    afterRender: function()
    {
      AddFormPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
