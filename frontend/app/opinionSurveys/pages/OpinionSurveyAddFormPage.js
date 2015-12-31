// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../dictionaries',
  '../views/OpinionSurveyFormView'
], function(
  AddFormPage,
  dictionaries,
  OpinionSurveyFormView
) {
  'use strict';

  return AddFormPage.extend({

    baseBreadcrumb: true,
    FormView: OpinionSurveyFormView,

    load: function(when)
    {
      return when(dictionaries.load());
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
