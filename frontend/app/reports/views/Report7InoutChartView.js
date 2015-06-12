// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/highcharts'
], function(
  t,
  time,
  View,
  Highcharts
) {
  'use strict';

  return View.extend({

    className: 'reports-7-inout',

    localTopics: {
      'i18n.reloaded': 'cacheI18n'
    },

    initialize: function()
    {
      this.chart = null;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:' + this.options.type, this.render);

      this.cacheI18n();
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

    cacheI18n: function()
    {
      this.i18n = {
        hourSuffix: t('reports', '7:valueSuffix:hour'),
        manHourSuffix: t('reports', '7:valueSuffix:manHour'),
        decimalPoint: t('core', 'highcharts:decimalPoint')
      };
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
      var options = this.options;
      var valueSuffix = options.type === 'downtimeTimes' ? this.i18n.hourSuffix : '';
      var valueDecimals = options.type === 'downtimeTimes' ? 2 : 0;
      var dataLabelsEnabled = chartData.indoor.length <= 12;

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          plotBorderWidth: 1
        },
        exporting: {
          filename: t.bound('reports', 'filenames:7:inout:' + options.type)
        },
        title: {
          text: t.bound('reports', '7:title:' + options.type)
        },
        noData: {},
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: false,
          labels: {
            format: '{value}' + valueSuffix
          },
          min: 0
        },
        tooltip: {
          shared: true,
          valueSuffix: valueSuffix,
          valueDecimals: valueDecimals,
          headerFormatter: this.formatTooltipHeader.bind(this),
          rowNameFormatter: this.formatTooltipRowName.bind(this),
          extraRowsProvider: this.provideExtraTooltipRows.bind(this)
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            dataLabels: {
              enabled: true,
              color: '#000'
            }
          }
        },
        series: [{
          id: 'indoor',
          name: t.bound('reports', '7:series:indoor'),
          type: 'column',
          data: chartData.indoor,
          color: '#00aaff',
          group: 'indoor',
          dataLabels: {enabled: dataLabelsEnabled}
        }, {
          id: 'specificIndoor',
          name: t.bound('reports', '7:series:indoor:specific'),
          type: 'column',
          data: chartData.specificIndoor,
          color: '#0066bb',
          group: 'indoor',
          dataLabels: {enabled: dataLabelsEnabled}
        }, {
          id: 'outdoor',
          name: t.bound('reports', '7:series:outdoor'),
          type: 'column',
          data: chartData.outdoor,
          color: '#00ee00',
          group: 'outdoor',
          dataLabels: {enabled: dataLabelsEnabled}
        }, {
          id: 'specificOutdoor',
          name: t.bound('reports', '7:series:outdoor:specific'),
          type: 'column',
          data: chartData.specificOutdoor,
          color: '#00aa00',
          group: 'outdoor',
          dataLabels: {enabled: dataLabelsEnabled}
        }]
      });
    },

    updateChart: function()
    {
      var chartData = this.serializeChartData();
      var allSeries = this.chart.series;

      for (var i = 0; i < allSeries.length; ++i)
      {
        var series = allSeries[i];
        var options = series.options;
        var data = chartData[options.id];

        options.dataLabels.enabled = data.length <= 12;

        series.setData(data, false);
        series.update(options, false);
      }

      this.chart.redraw(false);
    },

    serializeChartData: function()
    {
      return this.model.get(this.options.type);
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
      this.interval = null;
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

    formatTooltipHeader: function(ctx)
    {
      var timeMoment = time.getMoment(ctx.x);
      var data;

      if (!this.interval)
      {
        this.interval = this.model.query.getDowntimesChartInterval();
      }

      if (this.interval === 'quarter')
      {
        data = {quarter: t('core', 'QUARTER:' + timeMoment.quarter())};
      }

      return timeMoment.format(t('reports', 'tooltipHeaderFormat:' + this.interval, data));
    },

    formatTooltipRowName: function(point)
    {
      var series = point.series;
      var aor = /^specific/.test(series.options.id) ? this.model.getSpecificAor() : this.model.getSingleAor();

      return aor
        ? t('reports', '7:series:' + series.options.group + ':aor', {aor: aor.getLabel()})
        : series.name;
    },

    provideExtraTooltipRows: function(points, rows)
    {
      var view = this;
      var downtimeTimes = this.options.type === 'downtimeTimes';
      var totalIndoor = 0;
      var totalIndoorWorkerCount = 0;
      var totalOutdoor = 0;
      var totalOutdoorWorkerCount = 0;

      for (var i = 0; i < points.length; ++i)
      {
        var point = points[i];
        var workerCount = point.point.workerCount || 0;

        if (/indoor$/i.test(point.series.options.id))
        {
          totalIndoor += point.y;
          totalIndoorWorkerCount += workerCount;
        }
        else
        {
          totalOutdoor += point.y;
          totalOutdoorWorkerCount += workerCount;
        }

        rows[i].extraColumns = downtimeTimes ? view.createManHourTooltipColumns(point.y, workerCount) : '';
      }

      var valueSuffix = downtimeTimes ? this.i18n.hourSuffix : '';
      var valueDecimals = downtimeTimes ? 2 : 0;
      var total = totalIndoor + totalOutdoor;
      var totalWorkerCount = totalIndoorWorkerCount + totalOutdoorWorkerCount;

      rows.push({
        color: '#000',
        name: t('reports', '7:series:indoor:total'),
        suffix: valueSuffix,
        decimals: valueDecimals,
        value: totalIndoor,
        extraColumns: downtimeTimes ? this.createManHourTooltipColumns(totalIndoor, totalIndoorWorkerCount) : ''
      }, {
        color: '#000',
        name: t('reports', '7:series:outdoor:total'),
        suffix: valueSuffix,
        decimals: valueDecimals,
        value: totalOutdoor,
        extraColumns: downtimeTimes ? this.createManHourTooltipColumns(totalOutdoor, totalOutdoorWorkerCount) : ''
      }, {
        color: '#000',
        name: t('reports', '7:series:total'),
        suffix: valueSuffix,
        decimals: valueDecimals,
        value: total,
        extraColumns: downtimeTimes ? this.createManHourTooltipColumns(total, totalWorkerCount) : ''
      });
    },

    createManHourTooltipColumns: function(hours, workerCount)
    {
      var value = hours * workerCount;
      var decimalPoint = this.i18n.decimalPoint;
      var yParts = Highcharts.numberFormat(value, 2).split(decimalPoint);
      var integer = yParts[0];
      var fraction = yParts.length === 2 ? (decimalPoint + yParts[1]) : '';
      var ySuffix = this.i18n.manHourSuffix;

      return '<td class="highcharts-tooltip-integer">' + integer + '</td>'
        + '<td class="highcharts-tooltip-fraction">' + fraction + '</td>'
        + '<td class="highcharts-tooltip-suffix">' + ySuffix + '</td>';
    }

  });
});
