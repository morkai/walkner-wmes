// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    className: 'opinionSurveys-report-positiveAnswerPercentByDivision',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      var report = this.model.report;

      this.listenTo(report, 'request', this.onModelLoading);
      this.listenTo(report, 'sync', this.onModelLoaded);
      this.listenTo(report, 'error', this.onModelError);
      this.listenTo(report, 'change:positiveAnswerCountByDivision', this.render);
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
          filename: t.bound('opinionSurveys', 'report:positiveAnswerPercentByDivision:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:positiveAnswerPercentByDivision:title')
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
      var report = this.model.report;
      var answerCount = report.get('positiveAnswerCountByDivision');
      var categories = [];

      _.forEach(report.get('usedDivisions'), function(nouse, divisionId)
      {
        if (answerCount[divisionId])
        {
          categories.push(dictionaries.divisions.get(divisionId).getLabel());
        }
      });

      return categories;
    },

    serializeSeries: function()
    {
      var report = this.model.report;
      var usedEmployers = Object.keys(this.model.report.get('usedEmployers'));
      var answerCount = report.get('positiveAnswerCountByDivision');
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
        var byEmployer = answerCount[divisionId];

        if (!byEmployer)
        {
          return;
        }

        _.forEach(series, function(employerSeries)
        {
          var percent = 0;

          if (byEmployer[employerSeries.id])
          {
            var num = byEmployer[employerSeries.id].num;
            var den = byEmployer[employerSeries.id].den + num;

            percent = den ? Math.round(num / den * 100) : 0;
          }

          employerSeries.data.push(percent);
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
      return dictionaries.settings.getPositiveAnswersReference();
    },

    updateChart: function()
    {
      var chart = this.chart;
      var plotLines = this.serializePlotLines();

      while (chart.series.length)
      {
        chart.series[0].remove(false);
      }

      chart.xAxis[0].setCategories(this.serializeCategories(), false);
      chart.yAxis[0].removePlotLine('refValue');

      if (plotLines.length)
      {
        chart.yAxis[0].addPlotLine(plotLines[0]);
      }

      _.forEach(this.serializeSeries(), function(series) { chart.addSeries(series, false); });

      chart.redraw();
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
