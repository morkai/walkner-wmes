// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/DetailsView',
  'app/mechOrders/templates/details'
], function(
  t,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    serialize: function()
    {
      return {
        model: this.model.toJSON(),
        panelType: this.options.panelType || 'primary',
        panelTitle: this.options.panelTitle || t('mechOrders', 'PANEL:TITLE:details')
      };
    }

  });
});
