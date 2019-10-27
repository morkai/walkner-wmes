// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  '../util/formatXData',
  'app/sapLaborTimeFixer/templates/viewer'
], function(
  _,
  $,
  View,
  formatXData,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:workCenter change:deps', this.render);
    },

    getTemplateData: function()
    {
      return {
        height: this.options.height,
        data: this.serializeData()
      };
    },

    serializeData: function()
    {
      var xData = this.model;
      var workCenter = xData.getSelectedWorkCenter();
      var requiredDeps = xData.getSelectedDeps();

      return formatXData(workCenter, requiredDeps);
    },

    resize: function(height)
    {
      this.options.height = height;
      this.el.style.height = height + 'px';
    }

  });
});
