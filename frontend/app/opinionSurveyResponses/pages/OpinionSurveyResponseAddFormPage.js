// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/pages/AddFormPage',
  'app/core/util/bindLoadingMessage',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveys/OpinionSurveyCollection',
  'app/opinionSurveyOmrResults/OpinionSurveyOmrResultCollection',
  '../views/OpinionSurveyResponseFormView'
], function(
  AddFormPage,
  bindLoadingMessage,
  dictionaries,
  OpinionSurveyCollection,
  OpinionSurveyOmrResultCollection,
  OpinionSurveyResponseFormView
) {
  'use strict';

  return AddFormPage.extend({

    baseBreadcrumb: true,
    FormView: OpinionSurveyResponseFormView,

    defineModels: function()
    {
      AddFormPage.prototype.defineModels.apply(this, arguments);

      this.model.omrResults = this.options.fix ? bindLoadingMessage(new OpinionSurveyOmrResultCollection(null, {
        rqlQuery: 'select(pageNumber)&sort(pageNumber)&response=' + this.options.fix
      }), this) : null;

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
      return when(
        this.model.omrResults ? this.model.omrResults.fetch({reset: true}) : null,
        this.model.surveys.fetch({reset: true}),
        dictionaries.load()
      );
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
