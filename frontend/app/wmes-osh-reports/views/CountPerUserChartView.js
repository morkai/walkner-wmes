// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/wmes-osh-reports/templates/table',
  'app/wmes-osh-reports/templates/tableAndChart'
], function(
  _,
  t,
  Highcharts,
  View,
  tableTemplate,
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
      this.listenTo(this.model, `change:${this.options.metric}`, this.render);
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
      const view = this;
      const series = view.serializeSeries(true);

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.$id('chart')[0],
          plotBorderWidth: 1,
          spacing: [10, 1, 1, 0],
          type: 'column'
        },
        exporting: {
          filename: this.options.filename,
          chartOptions: {
            title: {
              text: this.options.title
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
        series
      });
    },

    updateChart: function()
    {
      this.chart.destroy();
      this.createChart();
    },

    updateTable: function(filtered)
    {
      const totalRows = (this.model.get(this.options.totalProperty || 'count') || {rows: []}).rows;
      const chart = this.chart;
      const rectEl = this.el.querySelectorAll('svg > rect')[1];
      const oldX = +rectEl.getAttribute('x');
      let categories = this.serializeCategories(false);
      let series = this.serializeSeries(false);
      let total = 0;
      let invisible = false;

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

      let rows = categories.map((label, dataIndex) =>
      {
        let abs = 0;

        _.forEach(series, (s, seriesIndex) =>
        {
          if (chart.series[seriesIndex].visible)
          {
            abs += s.data[dataIndex];
          }
        });

        return {
          dataIndex,
          no: dataIndex + 1,
          label,
          abs,
          rel: abs / total
        };
      });

      if (invisible)
      {
        rows = rows.filter((d) => d.abs > 0);

        rows.sort((a, b) => b.abs - a.abs);

        const newCategories = [];
        const newSeries = series.map(() => []);

        rows.forEach((row, i) =>
        {
          row.no = i + 1;

          if (i < 15)
          {
            newCategories.push(row.label);

            _.forEach(newSeries, (data, i) =>
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
        series = series.map((s) => s.data.slice(0, 15));
      }

      rows.push({
        dataIndex: -1,
        no: '',
        label: this.t('series:total'),
        abs: total,
        rel: 1
      });

      if (filtered)
      {
        chart.xAxis[0].setCategories(categories, false);

        series.forEach((data, i) =>
        {
          chart.series[i].setData(data, false, false, false);
        });

        chart.redraw(false);
        rectEl.setAttribute('x', oldX);
      }

      this.$id('table').html(this.renderPartialHtml(tableTemplate, {
        rows: rows
      }));
    },

    serializeCategories: function(top)
    {
      let {categories} = this.model.get(this.options.metric) || {categories: []};

      if (top)
      {
        categories = categories.slice(0, 15);
      }

      return categories;
    },

    serializeSeries: function(top)
    {
      let {series} = this.model.get(this.options.metric) || {series: []};

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
