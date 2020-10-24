// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/pages/DetailsPage',
  '../views/RootCausesView',
  '../views/SolutionView',
  'app/wmes-osh-actions/templates/details/page',
  'app/wmes-osh-actions/templates/details/props'
], function(
  DetailsPage,
  RootCausesView,
  SolutionView,
  template,
  propsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template,
    propsTemplate,

    defineViews: function()
    {
      DetailsPage.prototype.defineViews.apply(this, arguments);

      this.rootCausesView = new RootCausesView({
        model: this.model
      });

      this.solutionView = new SolutionView({
        model: this.model
      });

      this.setView('#-rootCauses', this.rootCausesView);
      this.setView('#-solution', this.solutionView);
    }

  });
});
