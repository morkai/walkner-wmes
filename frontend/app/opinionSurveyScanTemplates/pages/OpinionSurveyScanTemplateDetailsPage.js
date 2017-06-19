// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/opinionSurveys/dictionaries',
  '../views/OpinionSurveyScanTemplateDetailsView'
], function(
  DetailsPage,
  dictionaries,
  OpinionSurveyScanTemplateDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: OpinionSurveyScanTemplateDetailsView,
    baseBreadcrumb: true,

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
