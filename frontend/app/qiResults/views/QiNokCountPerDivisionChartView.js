// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/data/colorFactory',
  '../dictionaries',
  'app/reports/util/formatTooltipHeader'
], function(
  _,
  t,
  Highcharts,
  View,
  colorFactory,
  qiDictionaries,
  formatTooltipHeader
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
      var view = this;
      var series = view.serializeChartSeries();
      var model = view.model;

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 370,
          events: {
            click: function(e)
            {
              model.selectNearestGroup(view.mouseOverX || e.xAxis[0].value);
            }
          }
        },
        exporting: {
          filename: t.bound('qiResults', 'report:filenames:nokCountPerDivision'),
          chartOptions: {
            title: {
              text: t.bound('qiResults', 'report:title:nokCountPerDivision')
            },
            legend: {
              enabled: true
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
          headerFormatter: function(ctx)
          {
            view.mouseOverX = ctx.x;

            return formatTooltipHeader.apply(view, arguments);
          }
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
              },
              legendItemClick: function()
              {
                if (this.options.isDivision)
                {
                  model.toggleDivision(this.options.id, !this.visible);
                }
              }
            }
          },
          column: {
            borderWidth: 0,
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              style: {
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 6px #000, 0 0 3px #000'
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
            marker: view.getMarkerStyles(series.length ? series[0].data.length : 0)
          }
        },
        series: series
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    serializeChartSeries: function()
    {
      var divisions = Object.keys(this.model.get('divisions')).sort(function(a, b) { return a.localeCompare(b); });
      var series = _.map(divisions, function(division)
      {
        return {
          id: division,
          type: 'column',
          name: division,
          data: [],
          color: colorFactory.getColor('divisions', division),
          isDivision: true
        };
      });
      var maxNokPerDay = qiDictionaries.settings.getMaxNokPerDay();
      var maxNokCount = [];

      _.forEach(this.model.get('groups'), function(group)
      {
        if (typeof group === 'number')
        {
          group = {
            key: group,
            workingDayCount: 0,
            nokCountPerDivision: {}
          };
        }

        _.forEach(divisions, function(division, i)
        {
          series[i].data.push({
            x: group.key,
            y: group.nokCountPerDivision[division] || 0
          });
        });

        maxNokCount.push({
          x: group.key,
          y: group.workingDayCount * maxNokPerDay
        });
      });

      series.push({
        type: 'line',
        name: t.bound('qiResults', 'report:series:maxNokCount'),
        data: maxNokCount,
        color: '#5cb85c',
        isDivision: false
      });

      return series;
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
