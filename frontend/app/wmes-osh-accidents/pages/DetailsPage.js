// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/wmes-osh-common/pages/DetailsPage',
  'app/wmes-osh-common/views/PanelView',
  'app/wmes-osh-accidents/templates/details/page',
  'app/wmes-osh-accidents/templates/details/props'
], function(
  _,
  $,
  DetailsPage,
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

      this.setView('#-description', new PanelView({
        model: this.model,
        property: 'description',
        panelType: 'danger'
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
