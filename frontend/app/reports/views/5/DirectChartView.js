// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/companies',
  './FteChartView'
], function(
  companies,
  FteChartView
) {
  'use strict';

  return FteChartView.extend({

    fteType: 'direct',

    extremesChangeProperties: ['maxDirectFte'],

    serializeChartData: function()
    {
      return {
        direct: this.model.get('totals').direct,
        byCompany: this.model.get('directByCompany')
      };
    },

    getYAxisMaxValues: function()
    {
      return [this.displayOptions.get('maxDirectFte') || null];
    },

    createSeries: function(chartData)
    {
      var series = [
        this.createFteSeries('direct', chartData.direct)
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
