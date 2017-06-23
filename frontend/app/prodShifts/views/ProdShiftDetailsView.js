// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/prodShifts/templates/details'
], function(
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    initialize: function()
    {
      this.panelType = this.options.panelType || 'primary';
    },

    serialize: function()
    {
      var totalQuantityDone = {
        planned: 0,
        actual: 0
      };

      this.model.get('quantitiesDone').forEach(function(quantityDone)
      {
        totalQuantityDone.planned += quantityDone.planned;
        totalQuantityDone.actual += quantityDone.actual;
      });

      return {
        panelType: this.panelType,
        model: this.model.serialize({
          orgUnits: true,
          personnel: true
        }),
        totalQuantityDone: totalQuantityDone
      };
    },

    setPanelType: function(panelType)
    {
      this.$el.removeClass('panel-' + this.panelType).addClass('panel-' + panelType);

      this.panelType = panelType;
    }

  });
});
