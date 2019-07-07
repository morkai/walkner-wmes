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

    className: 'opinionSurveys-report-answerCount opinionSurveys-report-answerCountBySurvey',

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
      this.listenTo(report, 'change:answerCountBySurvey', this.render);
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
      var surveyCount = Object.keys(this.model.report.get('answerCountBySurvey') || {}).length;

      return Math.max(400, 60 * (questionCount + surveyCount) + (surveyCount - 1) * 100);
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
          filename: t.bound('opinionSurveys', 'report:answerCountBySurvey:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:answerCountBySurvey:title:' + this.stacking)
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
            var answerCountBySurvey = report.get('answerCountBySurvey');
            var questionId = points[0].point.category;
            var selectedSurveyId = points[0].point.series.options.stack;

            _.forEach(answerCountBySurvey, function(byQuestion, surveyId)
            {
              var survey = view.model.surveys.get(surveyId);
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
                color: selectedSurveyId === surveyId ? 'blue' : 'black',
                name: survey ? survey.getLabel() : surveyId,
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
      var answerCountBySurvey = model.report.get('answerCountBySurvey');
      var series = [];
      var chartData = {};

      _.forEach(answerCountBySurvey, function(byQuestion, surveyId)
      {
        if (!chartData[surveyId])
        {
          chartData[surveyId] = {
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

          chartData[surveyId].yes.push(answerCount.yes);
          chartData[surveyId].na.push(answerCount.na);
          chartData[surveyId].no.push(answerCount.no);
        });

        series.push({
          id: surveyId + '_yes',
          stack: surveyId,
          name: 'yes',
          data: chartData[surveyId].yes,
          color: '#5cb85c',
          showInLegend: false
        }, {
          id: surveyId + '_na',
          stack: surveyId,
          name: 'na',
          data: chartData[surveyId].na,
          color: '#f0ad4e',
          showInLegend: false
        }, {
          id: surveyId + '_no',
          stack: surveyId,
          name: 'no',
          data: chartData[surveyId].no,
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
