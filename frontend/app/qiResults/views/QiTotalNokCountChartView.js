// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  '../dictionaries'
], function(
  _,
  t,
  Highcharts,
  View,
  formatTooltipHeader,
  qiDictionaries
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:groups', this.render);
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
      if (this.timers.createOrUpdate)
      {
        clearTimeout(this.timers.createOrUpdate);
      }

      this.timers.createOrUpdate = setTimeout(this.createOrUpdate.bind(this), 1);
    },

    createOrUpdate: function()
    {
      this.timers.createOrUpdate = null;

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
      var model = this.model;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 300,
          events: {
            click: function(e)
            {
              model.selectNearestGroup(e.xAxis[0].value);
            }
          }
        },
        exporting: {
          filename: t.bound('qiResults', 'report:filenames:totalNokCount'),
          chartOptions: {
            title: {
              text: t.bound('qiResults', 'report:title:totalNokCount')
            },
            legend: {
              enabled: false
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 0,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          series: {
            cursor: 'pointer',
            events: {
              click: function(e)
              {
                model.set('selectedGroupKey', e.point.x);
              }
            }
          },
          column: {
            dataLabels: {
              enabled: true,
              style: {
                color: '#000',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 6px #fff, 0 0 3px #fff'
              },
              formatter: function()
              {
                return this.y || '';
              }
            }
          },
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: this.getMarkerStyles(chartData.nokCount.length)
          }
        },
        series: [{
          type: 'column',
          name: t.bound('qiResults', 'report:series:nokCount'),
          data: chartData.nokCount,
          color: '#d9534f'
        }, {
          type: 'line',
          name: t.bound('qiResults', 'report:series:maxNokCount'),
          data: chartData.maxNokCount,
          color: '#5cb85c'
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
      var chartData = {
        nokCount: [],
        maxNokCount: []
      };
      var maxNokPerDay = qiDictionaries.settings.getMaxNokPerDay();

      _.forEach(this.model.get('groups'), function(group)
      {
        chartData.nokCount.push({
          x: group.key,
          y: group.totalNokCount
        });
        chartData.maxNokCount.push({
          x: group.key,
          y: group.workingDayCount * maxNokPerDay
        });
      });

      return chartData;
    },

    getMarkerStyles: function(dataLength)
    {
      return {
        radius: dataLength > 1 ? 0 : 3,
        states: {
          hover: {
            radius: dataLength > 1 ? 3 : 6
          }
        }
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
