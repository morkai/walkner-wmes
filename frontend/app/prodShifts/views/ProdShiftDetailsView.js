// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/data/downtimeReasons',
  'app/prodShiftOrders/ProdShiftOrder',
  'app/prodShifts/ProdShift',
  'app/prodShifts/templates/details'
], function(
  _,
  DetailsView,
  downtimeReasons,
  ProdShiftOrder,
  ProdShift,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      this.panelType = this.options.panelType || 'primary';

      if (this.prodShiftOrders && this.prodDowntimes)
      {
        this.once('afterRender', function()
        {
          var updateDetails = _.debounce(this.updateDetails.bind(this), 1);

          this.listenTo(this.prodShiftOrders, 'reset add remove change', updateDetails);
          this.listenTo(this.prodDowntimes, 'reset add remove change', updateDetails);
        });
      }
    },

    getTemplateData: function()
    {
      return {
        panelType: this.panelType,
        efficiency: this.calcEfficiency()
      };
    },

    updateDetails: function()
    {
      this.updateEfficiency();
    },

    updatePanelType: function(panelType)
    {
      this.$el.removeClass('panel-' + this.panelType).addClass('panel-' + panelType);

      this.panelType = panelType;
    },

    updateEfficiency: function()
    {
      var eff = this.calcEfficiency();

      this.$('div[data-prop="efficiency"] > .prop-value').text(eff >= 0 ? (eff + '%') : '');

      clearTimeout(this.timers.updateEfficiency);
      this.timers.updateEfficiency = setTimeout(this.updateEfficiency.bind(this), 30000);
    },

    calcEfficiency: function()
    {
      return ProdShift.calcEfficiency(this.prodShiftOrders, this.prodDowntimes);
    }

  });
});
