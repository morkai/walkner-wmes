// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader'
], function(
  _,
  t,
  time,
  Highcharts,
  View,
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
      this.listenTo(this.model, 'change:count', this.render);
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
      var count = this.model.get('count');

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          type: 'column'
        },
        exporting: {
          filename: t.bound('suggestions', 'report:filenames:summary:count'),
          chartOptions: {
            title: {
              text: t.bound('suggestions', 'report:title:summary:count')
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'datetime',
          labels: {
            formatter: function()
            {
              return time.getMoment(this.value).format('w');
            }
          }
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
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: true,
              formatter: function()
              {
                return this.y || '';
              }
            }
          }
        },
        series: [{
          id: 'cancelled',
          name: t.bound('suggestions', 'report:series:summary:cancelled'),
          data: count.cancelled,
          color: '#d9534f'
        }, {
          id: 'open',
          name: t.bound('suggestions', 'report:series:summary:open'),
          data: count.open,
          color: '#f0ad4e'
        }, {
          id: 'finished',
          name: t.bound('suggestions', 'report:series:summary:finished'),
          data: count.finished,
          color: '#5cb85c'
        }]
      });
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
