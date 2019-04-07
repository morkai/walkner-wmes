// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  '../views/DetailsView',
  '../views/GalleryView',
  'app/wmes-snf-programs/templates/detailsPage'
], function(
  DetailsPage,
  DetailsView,
  GalleryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: true,

    pageClassName: 'page-max-flex',

    template: template,

    defineViews: function()
    {
      this.detailsView = new DetailsView({model: this.model});
      this.galleryView = new GalleryView({model: this.model});

      this.setView('#-details', this.detailsView);
      this.setView('#-gallery', this.galleryView);
    }

  });
});
