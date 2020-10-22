// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/pages/DetailsPage',
  'app/wmes-osh-common/views/AttachmentsView',
  '../views/SolutionView',
  'app/wmes-osh-kaizens/templates/details/page',
  'app/wmes-osh-kaizens/templates/details/props'
], function(
  DetailsPage,
  AttachmentsView,
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

      this.solutionView = new SolutionView({
        model: this.model
      });

      this.beforeView = new AttachmentsView({
        model: this.model,
        kind: 'before'
      });

      this.afterView = new AttachmentsView({
        model: this.model,
        kind: 'after'
      });

      this.setView('#-solution', this.solutionView);
      this.setView('#-before', this.beforeView);
      this.setView('#-after', this.afterView);
    },

    getAttachmentsViewOptions: function()
    {
      return Object.assign(DetailsPage.prototype.getAttachmentsViewOptions.apply(this, arguments), {
        kind: 'other'
      });
    }

  });
});
