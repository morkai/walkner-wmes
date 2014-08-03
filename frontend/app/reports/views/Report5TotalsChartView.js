// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/data/companies',
  'app/data/views/renderOrgUnitPath',
  './Report5FteChartView'
], function(
  t,
  companies,
  renderOrgUnitPath,
  Report5FteChartView
) {
  'use strict';

  return Report5FteChartView.extend({

    fteType: 'total',

    extremesChangeProperties: ['maxQuantityDone', 'maxTotalFte'],

    className: 'reports-chart reports-drillingChart reports-5-totals',

    serializeChartData: function()
    {
      return this.model.get('totals');
    },

    getChartTitle: function()
    {
      var orgUnitType = this.model.get('orgUnitType');

      if (!orgUnitType)
      {
        return t('reports', 'charts:title:overall');
      }

      var orgUnit = this.model.get('orgUnit');

      if (orgUnitType === 'subdivision')
      {
        return renderOrgUnitPath(orgUnit, false, false);
      }

      return orgUnit.getLabel();
    },

    updateColor: function(metric, color)
    {
      return Report5FteChartView.prototype.updateColor.call(this, metric === 'hrTotal' ? 'total' : metric, color);
    },

    getYAxisMaxValues: function()
    {
      return [
        this.displayOptions.get('maxTotalFte') || null,
        this.displayOptions.get('maxQuantityDone') || null
      ];
    },

    createYAxis: function()
    {
      return [
        {title: false, min: 0},
        {title: false, min: 0, opposite: true}
      ];
    },

    createSeries: function(chartData)
    {
      var displayOptions = this.displayOptions;
      var settings = this.settings;
      var series = [
        {
          id: 'quantityDone',
          name: t.bound('reports', 'hr:quantityDone'),
          color: settings.getColor('quantityDone'),
          type: 'area',
          yAxis: 1,
          data: chartData.quantityDone,
          visible: displayOptions.isSeriesVisible('quantityDone'),
          tooltip: {
            valueSuffix: ' PCS',
            valueDecimals: 0
          }
        },
        this.createFteSeries('total', chartData.total, null, settings.getColor('hrTotal')),
        this.createFteSeries('direct', chartData.direct),
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
