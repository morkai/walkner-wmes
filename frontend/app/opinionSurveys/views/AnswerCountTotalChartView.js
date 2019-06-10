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

    className: 'opinionSurveys-report-answerCountTotal',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      var report = this.model.report;

      this.listenTo(report, 'request', this.onModelLoading);
      this.listenTo(report, 'sync', this.onModelLoaded);
      this.listenTo(report, 'error', this.onModelError);
      this.listenTo(report, 'change:answerCountTotal', this.render);
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
      var chartData = this.serializeChartData();

      this.chart = new Highcharts.Chart({
        chart: {
          type: 'bar',
          renderTo: this.el,
          height: 60 * dictionaries.questions.length
        },
        exporting: {
          filename: t.bound('opinionSurveys', 'report:answerCountTotal:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:answerCountTotal:title')
        },
        noData: {},
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: function(ctx)
          {
            return dictionaries.questions.get(ctx.x).get('short');
          },
          extraRowsProvider: function(points, rows)
          {
            _.forEach(rows, function(row, i)
            {
              row.extraColumns = '<td class="highcharts-tooltip-integer">' + Math.round(points[i].percentage) + '</td>'
                + '<td class="highcharts-tooltip-suffix">%</td>';
            });
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          reversed: true,
          itemStyle: {
            fontSize: '14px'
          }
        },
        xAxis: {
          categories: this.serializeCategories(),
          labels: {
            formatter: function()
            {
              var question = dictionaries.questions.get(this.value);

              return '<b>' + question.get('short').toLocaleUpperCase() + '</b>' + ' ' + question.get('full');
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            enabled: false
          }
        },
        plotOptions: {
          series: {
            stacking: 'normal'
          }
        },
        series: [{
          id: 'yes',
          name: t.bound('opinionSurveys', 'report:answer:yes'),
          data: chartData.yes,
          dataLabels: {
            enabled: true,
            color: '#FFFFFF'
          },
          color: '#5cb85c'
        }, {
          id: 'na',
          name: t.bound('opinionSurveys', 'report:answer:na'),
          data: chartData.na,
          dataLabels: {
            enabled: true,
            color: '#FFFFFF'
          },
          color: '#f0ad4e'
        }, {
          id: 'no',
          name: t.bound('opinionSurveys', 'report:answer:no'),
          data: chartData.no,
          dataLabels: {
            enabled: true,
            color: '#FFFFFF'
          },
          color: '#d9534f'
        }]
      });
    },

    serializeCategories: function()
    {
      var categories = [];

      _.forEach(this.model.report.get('answerCountTotal'), function(answers, questionId)
      {
        categories.push(questionId);
      });

      return categories;
    },

    serializeChartData: function()
    {
      var chartData = {
        yes: [],
        na: [],
        no: []
      };

      _.forEach(this.model.report.get('answerCountTotal'), function(answers)
      {
        chartData.yes.push(answers.yes);
        chartData.na.push(answers.na);
        chartData.no.push(answers.no);
      });

      return chartData;
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
