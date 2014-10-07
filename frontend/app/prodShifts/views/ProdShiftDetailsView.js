// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
