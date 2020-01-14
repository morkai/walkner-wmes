// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  '../dictionaries',
  '../KaizenMetricsReport',
  '../views/KaizenMetricsReportFilterView',
  '../views/KaizenMetricsReportChartView',
  'app/kaizenOrders/templates/metricsReportPage'
], function(
  _,
  t,
  Highcharts,
  View,
  kaizenDictionaries,
  KaizenMetricsReport,
  KaizenMetricsReportFilterView,
  KaizenMetricsReportChartView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: [
      t.bound('kaizenOrders', 'BREADCRUMB:base'),
      t.bound('kaizenOrders', 'BREADCRUMB:reports:metrics')
    ],

    events: {
      'click .kaizenOrders-report-grouping': function(e)
      {
        var $el = this.$(e.currentTarget);

        if ($el.hasClass('active'))
        {
          return false;
        }

        var metric = $el[0].dataset.metric;
        var grouping = $el[0].dataset.grouping;

        this.$('.kaizenOrders-report-grouping[data-metric="' + metric + '"].active').removeClass('active');
        $el.addClass('active');

        this.model.setMetricGrouping(metric, grouping);

        return false;
      }
    },

    initialize: function()
    {
      this.setView('#-filter', new KaizenMetricsReportFilterView({model: this.model}));

      ['ipr', 'ips', 'ipc'].forEach(function(metric, i)
      {
        this.setView('#-' + metric + '-report', new KaizenMetricsReportChartView({
          metric: metric,
          model: this.model,
          unit: i === 0 ? '' : '%'
        }));
      }, this);

      this.setView('#-count-report', new KaizenMetricsReportChartView({
        metric: 'count',
        model: this.model,
        valueDecimals: 0,
        dataLabels: false
      }));

      this.setView('#-users-report', new KaizenMetricsReportChartView({
        metric: 'users',
        model: this.model,
        valueDecimals: 0
      }));

      this.setView('#-fte-report', new KaizenMetricsReportChartView({
        metric: 'fte',
        model: this.model,
        tooltipUnit: 'FTE'
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:total', this.updateSubtitles);
      this.listenTo(this.model, 'change:interval', this.updateGroupings);
    },

    destroy: function()
    {
      kaizenDictionaries.unload();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        metrics: KaizenMetricsReport.TABLE_AND_CHART_METRICS,
        grouping: {
          ipr: this.model.getMetricGrouping('ipr'),
          ips: this.model.getMetricGrouping('ips'),
          ipc: this.model.getMetricGrouping('ipc'),
          fte: this.model.getMetricGrouping('fte')
        },
        totalGroupingVisible: this.model.get('interval') !== 'none'
      };
    },

    load: function(when)
    {
      if (kaizenDictionaries.loaded)
      {
        return when(this.model.fetch());
      }

      return kaizenDictionaries.load().then(this.model.fetch.bind(this.model));
    },

    afterRender: function()
    {
      kaizenDictionaries.load();

      this.updateSubtitles();
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

    updateSubtitles: function()
    {
      var page = this;
      var total = page.model.get('total');

      ['ipr', 'ips', 'ipc', 'fte'].forEach(function(metric)
      {
        var value = metric === 'fte' ? total.fte.avg : total[metric];

        page.$id(metric + '-total').html(t('kaizenOrders', 'report:subtitle:' + metric, {
          value: Highcharts.numberFormat(value, 2)
        }));
      });

      page.$id('users-total').html(t('kaizenOrders', 'report:subtitle:users', {
        value: Highcharts.numberFormat(total.userCount, 0)
      }));

      page.$id('count-total').html(t('kaizenOrders', 'report:subtitle:count', {
        nearMisses: Highcharts.numberFormat(total.nearMissCount, 0),
        suggestions: Highcharts.numberFormat(total.suggestionCount, 0),
        observations: Highcharts.numberFormat(total.observationCount, 0),
        minutes: Highcharts.numberFormat(total.minutesCount, 0)
      }));

      var companies = page.model.get('companies');
      var fteSubtitle = [Highcharts.numberFormat(total.fte.avg, 2)];

      _.forEach(total.fteByCompany, function(fte, companyId)
      {
        if (fte.total > 0)
        {
          fteSubtitle.push(companies[companyId].name + ': ' + Highcharts.numberFormat(fte.avg, 2));
        }
      });

      page.$id('fte-total').html(t('kaizenOrders', 'report:subtitle:fte', {
        value: fteSubtitle.join('; ')
      }));
    },

    updateGroupings: function()
    {
      var view = this;
      var hidden = view.model.get('interval') === 'none';
      var className = '.kaizenOrders-report-grouping';

      view.$(className + '[data-grouping="total"][data-metric^="ip"]').toggleClass('hidden', hidden);

      ['ipr', 'ips', 'ipc'].forEach(function(metric)
      {
        var grouping = view.model.getMetricGrouping(metric);

        view.$(className + '[data-metric="' + metric + '"][data-grouping="' + grouping + '"]').click();
      });
    }

  });
});
