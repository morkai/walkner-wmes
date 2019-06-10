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

    className: 'opinionSurveys-report-responseCountBySuperior',

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      var report = this.model.report;

      this.listenTo(report, 'request', this.onModelLoading);
      this.listenTo(report, 'sync', this.onModelLoaded);
      this.listenTo(report, 'error', this.onModelError);
      this.listenTo(report, 'change:responseCountBySuperior', this.render);
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
          type: 'pie',
          renderTo: this.el,
          height: 500
        },
        exporting: {
          filename: t.bound('opinionSurveys', 'report:responseCountBySuperior:filename')
        },
        title: {
          text: t.bound('opinionSurveys', 'report:responseCountBySuperior:title')
        },
        noData: {},
        tooltip: {
          valueDecimals: 0
        },
        legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          y: 34,
          itemStyle: {
            fontSize: '14px'
          }
        },
        plotOptions: {
          pie: {
            shadow: false,
            center: ['50%', '50%']
          },
          series: {
            point: {
              events: {
                legendItemClick: function()
                {
                  var id = this.id;

                  this.series.chart.series[1].data.forEach(function(point)
                  {
                    if (point.parentId === id)
                    {
                      point.setVisible(!point.visible);
                    }
                  });
                }
              }
            }
          }
        },
        series: [{
          name: t.bound('opinionSurveys', 'report:responseCountBySuperior:series'),
          data: chartData.superiors,
          size: '60%',
          showInLegend: true,
          dataLabels: {
            enabled: false
          }
        }, {
          name: t.bound('opinionSurveys', 'report:responseCountBySuperior:series'),
          data: chartData.employers,
          size: '80%',
          innerSize: '60%',
          dataLabels: {
            enabled: true,
            allowOverlap: true,
            formatter: function()
            {
              return this.y > 0 ? (this.point.name + ': ' + this.y) : null;
            }
          }
        }]
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    serializeChartData: function()
    {
      var model = this.model;
      var responseCount = model.report.get('responseCountBySuperior');
      var superiorToSurvey = model.report.get('superiorToSurvey');
      var surveys = model.surveys;
      var superiors = [];
      var employers = [];
      var sortedSuperiors = Object.keys(superiorToSurvey).sort(function(a, b)
      {
        a = surveys.get(superiorToSurvey[a]).cacheMaps.superiors[a];
        b = surveys.get(superiorToSurvey[b]).cacheMaps.superiors[b];

        return a.short.localeCompare(b.short);
      });

      _.forEach(sortedSuperiors, function(superiorId)
      {
        var byEmployer = responseCount[superiorId];
        var superior = surveys.get(superiorToSurvey[superiorId]).cacheMaps.superiors[superiorId];
        var superiorCount = 0;

        _.forEach(byEmployer, function(count, employerId)
        {
          var employer = dictionaries.employers.get(employerId);

          employers.push({
            parentId: superior._id,
            name: superior.short + ' \\ ' + employer.getLabel(),
            y: count,
            color: employer.get('color')
          });

          superiorCount += count;
        });

        superiors.push({
          id: superior._id,
          name: superior.full,
          y: superiorCount,
          color: colorFactory.getColor('opinionSurveys:superiors', superior._id)
        });
      });

      return {
        superiors: superiors,
        employers: employers
      };
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
