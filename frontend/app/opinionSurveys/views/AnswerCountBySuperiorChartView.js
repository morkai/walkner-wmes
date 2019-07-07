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

    className: 'opinionSurveys-report-answerCount opinionSurveys-report-answerCountBySuperior',

    events: {
      'mouseup .highcharts-title': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        this.stacking = this.stacking === 'normal' ? 'percent' : 'normal';

        this.chart.destroy();
        this.createChart();
      }
    },

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;
      this.stacking = 'percent';

      var report = this.model.report;

      this.listenTo(report, 'request', this.onModelLoading);
      this.listenTo(report, 'sync', this.onModelLoaded);
      this.listenTo(report, 'error', this.onModelError);
      this.listenTo(report, 'change:answerCountBySuperior', this.render);
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

    calculateChartHeight: function()
    {
      var questionCount = Object.keys(this.model.report.get('answerCountTotal') || {}).length;
      var superiorCount = Object.keys(this.model.report.get('answerCountBySuperior') || {}).length;

      return Math.max(400, 60 * (questionCount + superiorCount) + (superiorCount - 1) * 100);
    },

    createChart: function()
    {
      var view = this;

      this.chart = new Highcharts.Chart({
        chart: {
          type: 'bar',
          renderTo: this.el,
          height: this.calculateChartHeight()
        },
        exporting: {
          filename: t.bound('opinionSurveys', 'report:answerCountBySuperior:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:answerCountBySuperior:title:' + this.stacking)
        },
        noData: {},
        tooltip: {
          shared: false,
          valueDecimals: 0,
          headerFormatter: function(ctx)
          {
            return dictionaries.questions.get(ctx.x).get('short');
          },
          extraRowsProvider: function(points, rows)
          {
            rows.shift();

            var report = view.model.report;
            var superiorToSurvey = report.get('superiorToSurvey');
            var answerCountBySuperior = report.get('answerCountBySuperior');
            var questionId = points[0].point.category;
            var selectedSuperiorId = points[0].point.series.options.stack;

            _.forEach(answerCountBySuperior, function(byQuestion, superiorId)
            {
              var survey = view.model.surveys.get(superiorToSurvey[superiorId]);
              var superior = survey && survey.cacheMaps.superiors[superiorId];
              var answerCount = byQuestion[questionId] || {no: 0, na: 0, yes: 0};
              var no = answerCount.no;
              var na = answerCount.na;
              var yes = answerCount.yes;

              if (view.stacking === 'percent')
              {
                no = no ? Math.round(no / answerCount.total * 100) : 0;
                na = na ? Math.round(na / answerCount.total * 100) : 0;
                yes = yes ? Math.round(yes / answerCount.total * 100) : 0;
              }

              rows.push({
                point: null,
                color: selectedSuperiorId === superiorId ? 'blue' : 'black',
                name: superior ? superior.full : superiorId,
                value: no,
                valueStyle: 'color: red',
                decimals: 0,
                extraColumns:
                  '<td class="highcharts-tooltip-integer" style="color: orange">' + na + '</td>'
                  + '<td class="highcharts-tooltip-integer" style="color: green">' + yes + '</td>'
              });
            });

            rows.reverse();
          },
          positioner: function(boxWidth, boxHeight, point)
          {
            var y = point.plotY;

            if (point.plotY + boxHeight > this.chart.chartHeight)
            {
              y -= (point.plotY + boxHeight) - this.chart.chartHeight + 20;
            }

            return {
              x: this.chart.plotLeft - boxWidth - 20,
              y: y
            };
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
          },
          allowDecimals: false
        },
        plotOptions: {
          series: {
            stacking: this.stacking,
            dataLabels: {
              enabled: true,
              color: '#FFFFFF',
              formatter: function()
              {
                return (view.stacking === 'normal' ? this.y : Math.round(this.percentage)) || '';
              }
            },
            groupPadding: 0.05
          }
        },
        series: this.serializeSeries()
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

    serializeSeries: function()
    {
      var model = this.model;
      var answerCountBySuperior = model.report.get('answerCountBySuperior');
      var series = [];
      var chartData = {};

      _.forEach(answerCountBySuperior, function(byQuestion, superiorId)
      {
        if (!chartData[superiorId])
        {
          chartData[superiorId] = {
            yes: [],
            na: [],
            no: []
          };
        }
        _.forEach(byQuestion, function(answerCount, questionId)
        {
          if (questionId === 'total')
          {
            return;
          }

          chartData[superiorId].yes.push(answerCount.yes);
          chartData[superiorId].na.push(answerCount.na);
          chartData[superiorId].no.push(answerCount.no);
        });

        series.push({
          id: superiorId + '_yes',
          stack: superiorId,
          name: 'yes',
          data: chartData[superiorId].yes,
          color: '#5cb85c',
          showInLegend: false
        }, {
          id: superiorId + '_na',
          stack: superiorId,
          name: 'na',
          data: chartData[superiorId].na,
          color: '#f0ad4e',
          showInLegend: false
        }, {
          id: superiorId + '_no',
          stack: superiorId,
          name: 'no',
          data: chartData[superiorId].no,
          color: '#d9534f',
          showInLegend: false
        });
      });

      return series;
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
