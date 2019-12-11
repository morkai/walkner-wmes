// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/data/companies',
  'app/reports/util/formatTooltipHeader',
  'app/reports/util/formatXAxis'
], function(
  _,
  time,
  t,
  Highcharts,
  View,
  companies,
  formatTooltipHeader,
  formatXAxis
) {
  'use strict';

  return View.extend({

    fteType: null,

    extremesChangeProperties: [],

    className: function()
    {
      return 'reports-chart reports-5-' + this.fteType;
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.settings, 'add change', this.onSettingsUpdate);
      this.listenTo(this.displayOptions, 'change', _.debounce(this.onDisplayOptionsChange, 1));
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
      if (this.chart)
      {
        this.updateChart();
      }
      else if (this.shouldRenderChart)
      {
        this.createChart();

        if (this.isLoading)
        {
          this.chart.showLoading();
        }
      }

      this.shouldRenderChart = true;
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();

      this.updateExtremes(false);

      var markerStyles = this.getMarkerStyles(chartData[this.fteType].length);
      var chart = this.chart;
      var series = chart.series;

      series.forEach(function(serie)
      {
        serie.update({marker: markerStyles}, false);

        if (chartData[serie.options.id])
        {
          serie.setData(chartData[serie.options.id], false, false, false);
        }
      });

      if (chartData.byCompany)
      {
        companies.forEach(function(company)
        {
          var serie = chart.get(company.id);

          if (serie)
          {
            serie.setData(chartData.byCompany[company.id] || null, false);
          }
        });
      }

      chart.redraw(false);
    },

    serializeChartData: function()
    {
      throw new Error();
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

    updateExtremes: function(redraw)
    {
      var chart = this.chart;

      if (!this.isFullscreen && (!this.model.get('isParent') || this.model.get('extremes') === 'parent'))
      {
        this.getYAxisMaxValues().forEach(function(max, i)
        {
          chart.yAxis[i].setExtremes(0, max, false, false);
        });
      }

      if (redraw !== false)
      {
        chart.redraw(false);
      }
    },

    getYAxisMaxValues: function()
    {
      return this.chart.yAxis.map(function() { return null; });
    },

    updateColor: function(metric, color)
    {
      var series = this.chart.get(metric);

      if (series)
      {
        series.update({color: color}, true);
      }
    },

    onSettingsUpdate: function(setting)
    {
      switch (setting.getType())
      {
        case 'color':
          return this.updateColor(setting.getMetricName(), setting.getValue());
      }
    },

    onDisplayOptionsChange: function()
    {
      var displayOptions = this.displayOptions;
      var changes = displayOptions.changedAttributes();
      var redraw = this.toggleSeriesVisibility(changes);

      var extremesChanged = _.any(this.extremesChangeProperties, function(property)
      {
        return changes[property] !== undefined;
      });

      if (extremesChanged)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      if (redraw)
      {
        this.chart.redraw(false);
      }
    },

    toggleSeriesVisibility: function(changes)
    {
      var displayOptions = this.displayOptions;
      var redraw = false;

      if (changes.series || changes.companies)
      {
        this.chart.series.forEach(function(series)
        {
          var visible = displayOptions.isSeriesVisible(series.options.id);

          if (series.visible !== visible)
          {
            series.setVisible(visible, false);

            redraw = true;
          }
        });
      }

      return redraw;
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
    },

    getChartTitle: function()
    {
      return t.bound('reports', 'hr:title:' + this.fteType);
    },

    createChart: function()
    {
      this.chart = new Highcharts.Chart(this.createChartOptions());
    },

    createChartOptions: function()
    {
      var chartData = this.serializeChartData();
      var markerStyles = this.getMarkerStyles(chartData[this.fteType].length);

      return {
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t.bound('reports', 'filenames:5:' + this.fteType),
          buttons: {
            contextButton: {
              menuItems: Highcharts.getDefaultMenuItems().concat({
                text: t('core', 'highcharts:downloadCSV'),
                onclick: this.exportChart.bind(this)
              })
            }
          }
        },
        title: {
          text: this.getChartTitle()
        },
        noData: {},
        tooltip: {
          shared: true,
          headerFormatter: this.formatTooltipHeader.bind(this)
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          line: {
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 2
              }
            },
            marker: markerStyles
          }
        },
        xAxis: this.createXAxis(),
        yAxis: this.createYAxis(),
        series: this.createSeries(chartData)
      };
    },

    formatTooltipHeader: formatTooltipHeader,

    createXAxis: function()
    {
      return {type: 'datetime', labels: formatXAxis.labels(this)};
    },

    createYAxis: function()
    {
      return [{title: false, min: 0}];
    },

    createSeries: function(chartData) // eslint-disable-line no-unused-vars
    {
      throw new Error();
    },

    createFteSeries: function(id, data, name, color)
    {
      return {
        id: id,
        name: name || t.bound('reports', 'hr:' + id),
        color: color || this.settings.getColor(id),
        type: 'line',
        yAxis: 0,
        data: data,
        visible: this.displayOptions.isSeriesVisible(id),
        tooltip: {
          valueSuffix: ' FTE',
          valueDecimals: 1
        }
      };
    },

    exportChart: function()
    {
      var req = this.ajax({
        type: 'POST',
        url: '/reports;download?filename=' + this.chart.options.exporting.filename,
        contentType: 'text/csv',
        data: this.exportCsvLines().join('\r\n')
      });

      req.done(function(key)
      {
        window.open('/reports;download?key=' + key);
      });
    },

    exportCsvLines: function()
    {
      var view = this;
      var lines = [t('reports', 'hr:' + this.fteType + ':columns')];

      this.chart.series.forEach(function(series, i)
      {
        var line = view.quoteCsvString(series.name)
          + ';' + view.quoteCsvString(series.options.tooltip.valueSuffix.trim());

        series.data.forEach(function(point)
        {
          if (i === 0)
          {
            lines[0] += ';' + view.quoteCsvString(formatTooltipHeader.call(view, point));
          }

          line += ';' + point.y.toLocaleString();
        });

        lines.push(line);
      });

      return lines;
    },

    quoteCsvString: function quote(value)
    {
      if (value === null || value === undefined || value === '')
      {
        return '""';
      }

      return '"' + String(value).replace(/"/g, '""') + '"';
    }

  });
});
