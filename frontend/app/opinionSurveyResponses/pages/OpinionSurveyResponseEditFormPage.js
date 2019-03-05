// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/pages/EditFormPage',
  'app/core/util/bindLoadingMessage',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveys/OpinionSurveyCollection',
  'app/opinionSurveyOmrResults/OpinionSurveyOmrResultCollection',
  '../views/OpinionSurveyResponseFormView'
], function(
  _,
  EditFormPage,
  bindLoadingMessage,
  dictionaries,
  OpinionSurveyCollection,
  OpinionSurveyOmrResultCollection,
  OpinionSurveyResponseFormView
) {
  'use strict';

  return EditFormPage.extend({

    baseBreadcrumb: true,
    FormView: OpinionSurveyResponseFormView,

    defineModels: function()
    {
      EditFormPage.prototype.defineModels.apply(this, arguments);

      this.model.omrResults = bindLoadingMessage(new OpinionSurveyOmrResultCollection(null, {
        rqlQuery: 'select(pageNumber)&sort(pageNumber)&response=' + this.model.id
      }), this);

      this.model.surveys = bindLoadingMessage(new OpinionSurveyCollection(null, {
        rqlQuery: 'sort(-startDate)'
      }), this);

      this.listenToOnce(this.model.surveys, 'reset', function()
      {
        this.model.surveys.buildCacheMaps();
      });
    },

    getFormViewOptions: function()
    {
      return _.assign(EditFormPage.prototype.getFormViewOptions.call(this), {
        fixing: this.options.fixing
      });
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.model.omrResults.fetch({reset: true}),
        this.model.surveys.fetch({reset: true}),
        dictionaries.load()
      );
    },

    destroy: function()
    {
      EditFormPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    afterRender: function()
    {
      EditFormPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
