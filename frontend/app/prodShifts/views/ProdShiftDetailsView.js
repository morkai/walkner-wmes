// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/DetailsView',
  'app/prodShifts/templates/details'
], function(
  _,
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

    getTemplateData: function()
    {
      return _.assign(DetailsView.prototype.getTemplateData.apply(this, arguments), {
        panelType: this.panelType
      });
    },

    setPanelType: function(panelType)
    {
      this.$el.removeClass('panel-' + this.panelType).addClass('panel-' + panelType);

      this.panelType = panelType;
    }

  });
});
