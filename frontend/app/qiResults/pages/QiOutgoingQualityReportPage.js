// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/html2pdf',
  'app/data/orgUnits',
  'app/reports/util/formatTooltipHeader',
  '../dictionaries',
  '../QiOutgoingQualityReport',
  '../views/outgoingQuality/FilterView',
  '../views/outgoingQuality/PpmChartView',
  '../views/outgoingQuality/PpmTableView',
  '../views/outgoingQuality/ParetoChartView',
  '../views/outgoingQuality/ParetoTableView',
  '../views/outgoingQuality/ResultListView',
  'app/qiResults/templates/outgoingQuality/page',
  'app/qiResults/templates/outgoingQuality/print'
], function(
  _,
  $,
  t,
  viewport,
  View,
  bindLoadingMessage,
  html2pdf,
  orgUnits,
  formatTooltipHeader,
  qiDictionaries,
  QiOutgoingQualityReport,
  FilterView,
  PpmChartView,
  PpmTableView,
  ParetoChartView,
  ParetoTableView,
  ResultListView,
  template,
  printTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    remoteTopics: {
      'qi.oqlWeeks.updated': function(oqlWeek)
      {
        this.model.updateOqlWeek(oqlWeek);
      }
    },

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:base'),
        this.t('BREADCRUMB:reports:outgoingQuality')
      ];
    },

    actions: function()
    {
      return [{
        icon: 'print',
        label: this.t('report:oql:printable'),
        callback: this.print.bind(this)
      }, {
        label: this.t('PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'QI:DICTIONARIES:MANAGE',
        href: '#qi/settings?tab=reports'
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-filter', this.filterView);
      this.setView('#-ppm-chart', this.ppmChartView);
      this.setView('#-ppm-table', this.ppmTableView);
      this.setView('#-where-chart', this.whereChartView);
      this.setView('#-where-table', this.whereTableView);
      this.setView('#-what-chart', this.whatChartView);
      this.setView('#-what-table', this.whatTableView);
      this.setView('#-results', this.resultsListView);
    },

    defineModels: function()
    {
      bindLoadingMessage(this.model, this);
      bindLoadingMessage(this.model.results, this);
    },

    defineViews: function()
    {
      var report = this.model;

      this.filterView = new FilterView({model: report});
      this.ppmChartView = new PpmChartView({model: report});
      this.ppmTableView = new PpmTableView({model: report});
      this.whereChartView = new ParetoChartView({
        model: report,
        property: 'where',
        resolveTitle: resolveWhereTitle
      });
      this.whereTableView = new ParetoTableView({
        model: report,
        property: 'where',
        resolveTitle: resolveWhereTitle
      });
      this.whatChartView = new ParetoChartView({
        model: report,
        property: 'what',
        resolveTitle: resolveWhatTitle
      });
      this.whatTableView = new ParetoTableView({
        model: report,
        property: 'what',
        resolveTitle: resolveWhatTitle
      });
      this.resultsListView = new ResultListView({collection: report.results});

      function resolveWhereTitle(id)
      {
        var mrp = orgUnits.getByTypeAndId('mrpController', id);

        return mrp ? mrp.get('description') : '';
      }

      function resolveWhatTitle(id, short)
      {
        var fault = qiDictionaries.faults.get(id);

        if (!fault)
        {
          return '';
        }

        var name = fault.get('name');
        var description = fault.get('description');

        if (short || name === description)
        {
          return name;
        }

        return name + ':\n' + description;
      }
    },

    defineBindings: function()
    {
      this.listenTo(this.model, 'filtered', this.onFiltered);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    print: function()
    {
      var page = this;

      viewport.msg.loading();

      var req = $.when(
        page.exportChart(page.ppmChartView.chart, 1040, 250, {
          plotOptions: {
            line: {
              dataLabels: {
                enabled: true
              }
            }
          }
        }),
        page.exportChart(page.whereChartView.chart, 525, 200, {
          xAxis: [{
            labels: {
              formatter: function()
              {
                var point = this.chart.series[0].data[this.value];

                return point ? point.name : '';
              }
            }
          }]
        }),
        page.exportChart(page.whatChartView.chart, 525, 200, {
          xAxis: [{
            labels: {
              formatter: function()
              {
                var point = this.chart.series[0].data[this.value];

                return point ? point.name : '';
              }
            }
          }]
        })
      );

      req.always(function()
      {
        viewport.msg.loaded();
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('core', 'MSG:EXPORTING_FAILURE')
        });
      });

      req.done(function(ppmRes, whereRes, whatRes)
      {
        var charts = {
          ppm: ppmRes[0],
          where: whereRes[0],
          what: whatRes[0]
        };
        var week = page.model.get('week');
        var html = page.renderPartialHtml(printTemplate, {
          week: week,
          charts: charts,
          tables: {
            ppm: page.ppmTableView.serialize().data,
            where: page.whereTableView.serialize(),
            what: page.whatTableView.serialize()
          },
          results: page.resultsListView.serializeResults()
        });

        html2pdf(html, {
          orientation: 'landscape',
          filename: page.t('report:filenames:outgoingQuality', {
            week: week.replace('-', '_')
          })
        });
      });
    },

    exportChart: function(chart, w, h, chartOptions)
    {
      var exportingOptions = {
        handleResponse: false,
        scale: 1,
        sourceWidth: w,
        sourceHeight: h,
        formAttributes: {
          inline: '1',
          base64: '1'
        }
      };

      chartOptions = _.assign({title: false}, chartOptions);

      return chart.exportChart(exportingOptions, chartOptions);
    }

  });
});
