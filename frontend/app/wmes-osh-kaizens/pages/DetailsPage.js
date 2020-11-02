// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/wmes-osh-common/pages/DetailsPage',
  'app/wmes-osh-common/views/AttachmentsView',
  'app/wmes-osh-common/views/PanelView',
  'app/wmes-osh-kaizens/templates/details/page',
  'app/wmes-osh-kaizens/templates/details/props'
], function(
  DetailsPage,
  AttachmentsView,
  PanelView,
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

      this.setView('#-problem', new PanelView({
        model: this.model,
        property: 'problem',
        panelType: 'danger'
      }));

      this.setView('#-reason', new PanelView({
        model: this.model,
        property: 'reason',
        panelType: 'warning'
      }));

      this.setView('#-before', new AttachmentsView({
        model: this.model,
        kind: 'before'
      }));

      this.setView('#-suggestion', new PanelView({
        model: this.model,
        property: 'suggestion',
        panelType: 'secondary'
      }));

      this.setView('#-solution', new PanelView({
        model: this.model,
        property: 'solution',
        panelType: 'success'
      }));

      this.setView('#-after', new AttachmentsView({
        model: this.model,
        kind: 'after'
      }));
    },

    getAttachmentsViewOptions: function()
    {
      return Object.assign(DetailsPage.prototype.getAttachmentsViewOptions.apply(this, arguments), {
        kind: 'other'
      });
    }

  });
});
