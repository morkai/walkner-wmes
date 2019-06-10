// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/highcharts',
  'app/data/colorFactory',
  '../dictionaries'
], function(
  _,
  t,
  View,
  Highcharts,
  colorFactory,
  dictionaries
) {
  'use strict';

  return View.extend({

    className: 'opinionSurveys-report-responsePercentByDivision',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      var report = this.model.report;

      this.listenTo(report, 'request', this.onModelLoading);
      this.listenTo(report, 'sync', this.onModelLoaded);
      this.listenTo(report, 'error', this.onModelError);
      this.listenTo(report, 'change:responseCountTotal', this.render);
    },

    destroy: function()
    {
      if (this.chart !== null)
      {
        this.chart.destroy();
        this.chart = null;
      }
    },

    afterRender: function()
    {
      if (this.timers.createOrUpdateChart)
      {
        clearTimeout(this.timers.createOrUpdateChart);
      }

      this.timers.createOrUpdateChart = setTimeout(this.createOrUpdateChart.bind(this), 1);
    },

    createOrUpdateChart: function()
    {
      this.timers.createOrUpdateChart = null;

      if (this.chart)
      {
        this.updateChart();
      }
      else
      {
        this.createChart();

        if (this.isLoading)
        {
          this.chart.showLoading();
        }
      }
    },


    createChart: function()
    {
      this.chart = new Highcharts.Chart({
        chart: {
          type: 'column',
          renderTo: this.el,
          height: 500
        },
        exporting: {
          filename: t.bound('opinionSurveys', 'report:responsePercentByDivision:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:responsePercentByDivision:title')
        },
        noData: {},
        tooltip: {
          shared: true,
          valueDecimals: 0,
          valueSuffix: '%'
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          itemStyle: {
            fontSize: '14px'
          }
        },
        xAxis: {
          categories: this.serializeCategories()
        },
        yAxis: {
          min: 0,
          max: 100,
          title: {
            enabled: false
          },
          plotLines: this.serializePlotLines()
        },
        series: this.serializeSeries()
      });
    },

    serializeCategories: function()
    {
      var categories = [];
      var report = this.model.report;
      var responseCountTotal = report.get('responseCountTotal');

      _.forEach(report.get('usedDivisions'), function(nouse, divisionId)
      {
        var byEmployer = responseCountTotal[divisionId];

        if (byEmployer)
        {
          categories.push(dictionaries.divisions.get(divisionId).getLabel());
        }
      });

      return categories;
    },

    serializeSeries: function()
    {
      var model = this.model;
      var report = model.report;
      var usedSurveys = report.get('usedSurveys');
      var surveys = model.surveys.filter(function(survey) { return usedSurveys[survey.id]; });
      var usedEmployers = Object.keys(report.get('usedEmployers'));
      var responseCountTotal = report.get('responseCountTotal');
      var series = [];
      var employerToSeries = {};
      var refValue = this.getRefValue();
      var refValues = [];

      _.forEach(usedEmployers, function(employerId)
      {
        var employer = dictionaries.employers.get(employerId);
        var employerSeries = {
          id: employerId,
          name: employer.getLabel(),
          data: [],
          dataLabels: {
            enabled: true
          },
          color: employer.get('color')
        };

        series.push(employerSeries);
        employerToSeries[employerId] = employerSeries;
      });

      _.forEach(report.get('usedDivisions'), function(nouse, divisionId)
      {
        var byEmployer = responseCountTotal[divisionId];

        if (!byEmployer)
        {
          return;
        }

        _.forEach(series, function(employerSeries)
        {
          var responseCount = byEmployer[employerSeries.id];
          var employeeCount = 0;

          _.forEach(surveys, function(survey)
          {
            var surveyEmployeeCount = survey.cacheMaps.employeeCount;

            employeeCount += surveyEmployeeCount[divisionId] && surveyEmployeeCount[divisionId][employerSeries.id]
              ? surveyEmployeeCount[divisionId][employerSeries.id]
              : 0;
          });

          employerSeries.data.push(employeeCount ? Math.round(responseCount / employeeCount * 100) : 0);
        });

        refValues.push(refValue);
      });

      series.push({
        type: 'line',
        name: t('opinionSurveys', 'report:refValue'),
        data: refValues,
        color: '#5cb85c',
        showInLegend: false,
        marker: {
          radius: 0
        }
      });

      return series;
    },

    serializePlotLines: function()
    {
      var plotLines = [];
      var refValue = this.getRefValue();

      if (refValue)
      {
        plotLines.push({
          id: 'refValue',
          color: '#5cb85c',
          width: 2,
          value: refValue,
          zIndex: 1000
        });
      }

      return plotLines;
    },

    getRefValue: function()
    {
      return dictionaries.settings.getResponseReference();
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    onModelLoading: function()
    {
      this.isLoading = true;

      if (this.chart)
      {
        this.chart.showLoading();
      }
    },

    onModelLoaded: function()
    {
      this.isLoading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    },

    onModelError: function()
    {
      this.isLoading = false;

      if (this.chart)
      {
        this.chart.hideLoading();
      }
    }

  });
});
