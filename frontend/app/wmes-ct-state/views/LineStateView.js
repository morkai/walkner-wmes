// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wmes-ct-state/templates/lineState',
  'app/wmes-ct-state/templates/_station'
], function(
  View,
  template,
  stationTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:station', this.renderStation);
    },

    getTemplateData: function()
    {
      return {
        renderStation: this.renderPartialHtml.bind(this, stationTemplate),
        model: this.model.serialize()
      };
    },

    renderStation: function(station)
    {
      var html = this.renderPartialHtml(stationTemplate, {
        station: this.model.serializeStation(station)
      });

      this.$('.ct-state-station[data-id="' + station._id + '"]').replaceWith(html);
    }

  });
});
