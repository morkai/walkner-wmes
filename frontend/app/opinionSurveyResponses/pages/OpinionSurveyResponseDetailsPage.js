// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/opinionSurveys/dictionaries',
  'app/opinionSurveyResponses/templates/details'
], function(
  DetailsPage,
  dictionaries,
  detailsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    detailsTemplate: detailsTemplate,
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
