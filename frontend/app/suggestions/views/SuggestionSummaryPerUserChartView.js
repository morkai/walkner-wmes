// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/suggestions/templates/reportTable',
  'app/suggestions/templates/tableAndChart'
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
      this.limit = -1;

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
      var series = view.serializeSeries();
      var dataPointCount = series[0].data.length;
      var nlsDomain = view.model.getNlsDomain();
      var metric = view.options.metric;
      var unlimited = view.limit === -1;
      var height = unlimited ? undefined : (100 + 20 * dataPointCount);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: unlimited ? [10, 1, 1, 0] : [10, 10, 15, 10],
          height: height,
          type: unlimited ? view.options.unlimitedType : 'bar'
        },
        exporting: {
          filename: t.bound(nlsDomain, 'report:filenames:summary:' + metric),
          chartOptions: {
            title: {
              text: t.bound(nlsDomain, 'report:title:summary:' + metric)
            }
          },
          buttons: {
            contextButton: {
              align: 'left'
            }
          },
          sourceHeight: height
        },
        title: false,
        noData: {},
        xAxis: {
          categories: view.serializeCategories()
        },
        yAxis: {
          title: false,
          min: 0,
          allowDecimals: false,
          opposite: unlimited
        },
        tooltip: {
          shared: true,
          valueDecimals: 0
        },
        legend: {
          enabled: unlimited
        },
        plotOptions: {
          bar: {
            stacking: 'normal',
            dataLabels: {
              enabled: !unlimited,
              formatter: function()
              {
                return this.y || '';
              }
            }
          },
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: unlimited,
              formatter: function()
              {
                return this.y || '';
              }
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
      if (this.limit !== -1)
      {
        this.$id('table').empty();

        return;
      }

      var totalCount = this.model.get('total').count;
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
          total += totalCount[s.id];
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

    serializeCategories: function(limited)
    {
      var categories = this.model.get(this.options.metric).categories;

      if (limited !== false && this.limit !== -1)
      {
        categories = categories.slice(0, this.limit);
      }

      return categories;
    },

    serializeSeries: function(limited)
    {
      var data = this.model.get(this.options.metric);
      var limit = this.limit;
      var top = this.options.top;

      if (limited !== false)
      {
        if (limit > 0)
        {
          data = {
            cancelled: data.cancelled.slice(0, limit),
            open: data.open.slice(0, limit),
            finished: data.finished.slice(0, limit)
          };
        }
        else if (top > 0)
        {
          data = {
            cancelled: data.cancelled.slice(0, top),
            open: data.open.slice(0, top),
            finished: data.finished.slice(0, top)
          };
        }
      }

      return [{
        id: 'cancelled',
        name: t.bound('suggestions', 'report:series:summary:cancelled'),
        data: data.cancelled,
        color: '#d9534f'
      }, {
        id: 'open',
        name: t.bound('suggestions', 'report:series:summary:open'),
        data: data.open,
        color: '#f0ad4e'
      }, {
        id: 'finished',
        name: t.bound('suggestions', 'report:series:summary:finished'),
        data: data.finished,
        color: '#5cb85c'
      }];
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
