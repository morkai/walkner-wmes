// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/companies',
  './FteChartView'
], function(
  companies,
  FteChartView
) {
  'use strict';

  return FteChartView.extend({

    fteType: 'indirect',

    extremesChangeProperties: ['maxIndirectFte'],

    serializeChartData: function()
    {
      return {
        indirect: this.model.get('totals').indirect,
        byCompany: this.model.get('indirectByCompany')
      };
    },

    getYAxisMaxValues: function()
    {
      return [this.displayOptions.get('maxIndirectFte') || null];
    },

    createSeries: function(chartData)
    {
      var series = [
        this.createFteSeries('indirect', chartData.indirect)
      ];

      companies.forEach(function(company)
      {
        series.push(this.createFteSeries(
          company.id,
          chartData.byCompany ? chartData.byCompany[company.id] : null,
          company.getLabel(),
          company.get('color')
        ));
      }, this);

      return series;
    }

  });
});
