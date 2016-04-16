// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/data/colorFactory'
], function(
  _,
  t,
  Highcharts,
  View,
  colorFactory
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
      this.listenTo(this.model, 'change:groups change:selectedGroupKey', _.debounce(this.render.bind(this), 1));
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

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1,
          height: 500
        },
        exporting: {
          filename: t.bound('qiResults', 'report:filenames:nokQtyPerFamily'),
          chartOptions: {
            title: {
              text: t.bound('qiResults', 'report:title:nokQtyPerFamily')
            },
            legend: {
              enabled: false
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          categories: chartData.categories
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
            return ctx.points[0].point.family;
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true,
              style: {
                color: '#000',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 6px #fff, 0 0 3px #fff'
              }
            }
          }
        },
        series: [{
          type: 'column',
          name: t.bound('qiResults', 'report:series:nokQty'),
          data: chartData.nokQty
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
        categories: [],
        nokQty: []
      };
      var group = this.model.getSelectedGroup();

      if (!group)
      {
        return chartData;
      }

      var familyData = [];

      _.forEach(group.nokQtyPerFamily, function(familyNokQty, family)
      {
        familyData.push({
          category: family,
          quantity: familyNokQty.qty,
          ridPerFault: familyNokQty.ridPerFault
        });
      });

      familyData.sort(function(a, b)
      {
        return b.quantity - a.quantity;
      });

      _.forEach(familyData, function(d)
      {
        if (familyData.length <= 20)
        {
          var faults = [];

          _.forEach(d.ridPerFault, function(rids, faultCode)
          {
            faults.push(faultCode + '-' + rids.join(','));
          });

          chartData.categories.push('<b>' + d.category + '</b><br>' + faults.join('; '));
        }
        else
        {
          chartData.categories.push(d.category);
        }

        chartData.nokQty.push({
          family: d.category,
          y: d.quantity,
          color: colorFactory.getColor('productFamily', d.category)
        });
      });

      return chartData;
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
