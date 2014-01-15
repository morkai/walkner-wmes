define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  './Report1CoeffsChartView',
  './Report1DowntimesChartView',
  'app/reports/templates/report1Charts'
], function(
  _,
  $,
  t,
  View,
  Report1CoeffsChartView,
  Report1DowntimesChartView,
  report1ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report1ChartsTemplate,

    initialize: function()
    {
      this.setView(
        '.reports-1-coeffs-container',
        new Report1CoeffsChartView({
          model: this.model,
          orgUnit: this.options.orgUnit
        })
      );

      this.setView(
        '.reports-1-downtimesByAor-container',
        new Report1DowntimesChartView({
          model: this.model,
          orgUnit: this.options.orgUnit,
          attrName: 'downtimesByAor'
        })
      );

      this.setView(
        '.reports-1-downtimesByReason-container',
        new Report1DowntimesChartView({
          model: this.model,
          orgUnit: this.options.orgUnit,
          attrName: 'downtimesByReason'
        })
      );
    },

    afterRender: function()
    {
      this.promised(this.model.fetch());
    }

  });
});
