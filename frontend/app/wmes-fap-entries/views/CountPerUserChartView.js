// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/wmes-fap-entries/templates/reportTable',
  'app/wmes-fap-entries/templates/tableAndChart'
], function(
  _,
  t,
  Highcharts,
  View,
  renderReportTable,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.metric, this.render);
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

      this.updateTable();
    },

    createChart: function()
    {
      var view = this;
      var metric = view.options.metric;
      var series = view.serializeSeries(true);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 0],
          type: 'column'
        },
        exporting: {
          filename: view.t('report:filenames:' + metric),
          chartOptions: {
            title: {
              text: view.t('report:title:' + metric)
            }
          },
          buttons: {
            contextButton: {
              align: 'left'
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          categories: view.serializeCategories(true)
        },
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false,
          opposite: true
        },
        tooltip: {
          shared: true,
          valueDecimals: 0
        },
        legend: {
          enabled: series.length > 1
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: true
            }
          },
          series: {
            events: {
              legendItemClick: function()
              {
                this.setVisible(!this.visible, false);
                view.updateTable(true);

                return false;
              }
            }
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

    updateTable: function(filtered)
    {
      var totalRows = this.model.get(this.options.totalProperty || 'count').rows;
      var categories = this.serializeCategories(false);
      var series = this.serializeSeries(false);
      var chart = this.chart;
      var total = 0;
      var invisible = false;
      var rectEl = this.el.querySelectorAll('svg > rect')[1];
      var oldX = +rectEl.getAttribute('x');

      _.forEach(series, function(s, i)
      {
        if (chart.series[i].visible)
        {
          total += totalRows[i].abs;
        }
        else
        {
          invisible = true;
        }
      });

      var rows = categories.map(function(label, dataIndex)
      {
        var abs = 0;

        _.forEach(series, function(s, seriesIndex)
        {
          if (chart.series[seriesIndex].visible)
          {
            abs += s.data[dataIndex];
          }
        });

        return {
          dataIndex: dataIndex,
          no: dataIndex + 1,
          label: label,
          abs: abs,
          rel: abs / total
        };
      });

      if (invisible)
      {
        rows = rows.filter(function(d) { return d.abs > 0; });

        rows.sort(function(a, b) { return b.abs - a.abs; });

        var newCategories = [];
        var newSeries = series.map(function() { return []; });

        rows.forEach(function(row, i)
        {
          row.no = i + 1;

          if (i < 15)
          {
            newCategories.push(row.label);

            _.forEach(newSeries, function(data, i)
            {
              data.push(series[i].data[row.dataIndex]);
            });
          }
        });

        categories = newCategories;
        series = newSeries;
      }
      else
      {
        series = series.map(function(s) { return s.data.slice(0, 15); });
      }

      rows.push({
        dataIndex: -1,
        no: '',
        label: this.t('report:series:total'),
        abs: total,
        rel: 1
      });

      if (filtered)
      {
        chart.xAxis[0].setCategories(categories, false);

        series.forEach(function(data, i)
        {
          chart.series[i].setData(data, false, false, false);
        });

        chart.redraw(false);
        rectEl.setAttribute('x', oldX);
      }

      this.$id('table').html(renderReportTable({
        rows: rows
      }));
    },

    serializeCategories: function(top)
    {
      var categories = this.model.get(this.options.metric).categories;

      if (top)
      {
        categories = categories.slice(0, 15);
      }

      return categories;
    },

    serializeSeries: function(top)
    {
      var series = this.model.get(this.options.metric).series;

      if (top)
      {
        series = series.map(function(s)
        {
          s = _.clone(s);
          s.data = s.data.slice(0, 15);

          return s;
        });
      }

      return series;
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
