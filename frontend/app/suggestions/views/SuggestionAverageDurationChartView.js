// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  'app/kaizenOrders/dictionaries'
], function(
  _,
  t,
  time,
  Highcharts,
  View,
  formatTooltipHeader,
  kaizenDictionaries
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
      this.listenTo(this.model, 'change:averageDuration', this.render);
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
      var nlsDomain = this.model.getNlsDomain();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t.bound(nlsDomain, 'report:filenames:summary:averageDuration'),
          chartOptions: {
            title: {
              text: t.bound(nlsDomain, 'report:title:summary:averageDuration')
            },
            subtitle: {
              text: this.getSubtitle()
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
          },
          tickInterval: 7 * 24 * 3600 * 1000
        },
        yAxis: {
          title: false,
          min: 0,
          decimals: 2,
          plotLines: [{
            color: '#5cb85c',
            width: 2,
            value: 5,
            zIndex: 100
          }]
        },
        tooltip: {
          shared: true,
          valueDecimals: 2,
          headerFormatter: formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              formatter: function()
              {
                return this.y === 0 ? '' : Highcharts.numberFormat(this.y, 1);
              }
            }
          }
        },
        series: [{
          id: 'averageDuration',
          type: 'column',
          name: t.bound('suggestions', 'report:series:summary:averageDuration'),
          data: this.model.get('averageDuration')
        }]
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    getSubtitle: function()
    {
      var total = this.model.get('total');
      var sections = (this.model.get('section') || []).map(function(id)
      {
        return kaizenDictionaries.sections.get(id).getLabel();
      });
      var productFamilies = (this.model.get('productFamily') || []).map(function(id)
      {
        return kaizenDictionaries.productFamilies.get(id).getLabel();
      });
      var props = [
        t('suggestions', 'report:subtitle:summary:averageDuration:short', {
          averageDuration: Highcharts.numberFormat(total.averageDuration, 2)
        })
      ];

      if (sections.length)
      {
        props.push(t('suggestions', 'report:subtitle:summary:section', {
          section: sections.join(', ')
        }));
      }

      if (productFamilies.length)
      {
        props.push(t('suggestions', 'report:subtitle:summary:productFamily', {
          productFamily: productFamilies.join(', ')
        }));
      }

      return props.join(' | ');
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
