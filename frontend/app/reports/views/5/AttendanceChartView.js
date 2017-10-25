// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/i18n',
  'app/core/View',
  'app/data/companies'
], function(
  _,
  Highcharts,
  t,
  View,
  companies
) {
  'use strict';

  return View.extend({

    className: function()
    {
      return 'reports-chart reports-5-attendance';
    },

    initialize: function()
    {
      this.shouldRenderChart = !this.options.skipRenderChart;
      this.chart = null;
      this.isFullscreen = false;
      this.isLoading = false;

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:attendance ', _.debounce(this.render, 1));
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

    updateChart: function(redraw, updateExtremes)
    {
      var chart = this.chart;
      var chartData = this.serializeChartData();

      chart.xAxis[0].setCategories(chartData.categories, false);

      if (updateExtremes)
      {
        this.updateExtremes(false);
      }

      chart.series[0].setData(chartData.present, false, false, false);
      chart.series[1].setData(chartData.absent, false, false, false);

      if (redraw !== false)
      {
        chart.redraw(false);
      }
    },

    updateExtremes: function(redraw)
    {
      var maxAttendance = null;

      if (!this.isFullscreen && (!this.model.get('isParent') || this.displayOptions.get('extremes') === 'parent'))
      {
        maxAttendance = this.displayOptions.get('maxAttendance');
      }

      this.chart.yAxis[0].setExtremes(0, maxAttendance, redraw, false);
    },

    onDisplayOptionsChange: function()
    {
      var changes = this.displayOptions.changedAttributes();
      var redraw = false;

      if (changes.maxAttendance !== undefined)
      {
        this.updateExtremes(false);

        redraw = true;
      }

      if (changes.companies)
      {
        this.updateChart(true, false);

        redraw = false;
      }

      if (redraw)
      {
        this.chart.redraw(false);
      }
    },

    serializeChartData: function()
    {
      var report = this.model;
      var attendance = report.get('attendance');
      var categories = [];
      var present = [];
      var absent = [];

      if (_.isEmpty(attendance))
      {
        return {
          categories: categories,
          present: present,
          absent: absent
        };
      }

      var displayOptions = this.displayOptions;
      var isFullscreen = this.isFullscreen;

      _.forEach(attendance, function(companyAttendance, companyId)
      {
        if (!displayOptions.isCompanyVisible(companyId))
        {
          return;
        }

        var company = companies.get(companyId);

        if (company)
        {
          categories.push(isFullscreen ? company.get('name') : (company.get('shortName') || company.get('name')));
        }
        else
        {
          categories.push(companyId);
        }

        present.push({
          y: companyAttendance.demand - companyAttendance.absence
        });

        absent.push({
          y: companyAttendance.absence
        });
      });

      return {
        categories: categories,
        present: present,
        absent: absent
      };
    },

    onFullscreen: function(isFullscreen)
    {
      this.isFullscreen = isFullscreen;

      this.chart.series.forEach(function(serie)
      {
        serie.update({dataLabels: {enabled: isFullscreen}}, false);
      });

      this.updateChart(false);
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

    createChart: function()
    {
      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: null
        },
        exporting: {
          filename: t('reports', 'hr:attendance:filename')
        },
        title: {
          text: t('reports', 'hr:attendance:title')
        },
        noData: {},
        xAxis: {
          categories: []
        },
        yAxis: {
          title: false
        },
        tooltip: {
          shared: true,
          valueDecimals: 1
        },
        legend: {enabled: false},
        series: [
          {
            name: t('reports', 'hr:attendance:series:present'),
            type: 'column',
            color: '#00EE00',
            data: []
          },
          {
            name: t('reports', 'hr:attendance:series:absent'),
            type: 'column',
            color: '#EE0000',
            data: []
          }
        ],
        plotOptions: {
          column: {
            stacking: 'normal'
          }
        }
      });
    }

  });
});
