// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../views/TableAndChartView',
  '../views/metrics/FilterView',
  'app/wmes-osh-reports/templates/metrics/page'
], function(
  View,
  bindLoadingMessage,
  dictionaries,
  TableAndChartView,
  FilterView,
  template
) {
  'use strict';

  const METRICS = ['ipr', 'ips', 'ipp', 'entries', 'users', 'fte'];
  const GROUPS = ['total', 'division', 'workplace', 'department'];
  const METRIC_OPTIONS = {
    ipr: {
      valueDecimals: 3,
      allowDecimals: true,
      absDecimals: true,
      relColumn: false
    },
    ips: {
      valueDecimals: 1,
      unit: '%',
      absUnit: true,
      relColumn: false
    },
    ipp: {
      valueDecimals: 1,
      unit: '%',
      absUnit: true,
      relColumn: false
    }
  };

  return View.extend({

    layoutName: 'page',

    template,

    events: {

      'click a[data-group]': function(e)
      {
        const {metric, group: newGroup} = e.currentTarget.dataset;
        const oldGroup = this.$(`a[data-metric="${metric}"].active`).removeClass('active').attr('data-group');

        e.currentTarget.classList.add('active');

        this.$id(`${metric}-${oldGroup}`).addClass('hidden');
        this.$id(`${metric}-${newGroup}`).removeClass('hidden');
      }

    },

    breadcrumbs: function()
    {
      return [
        this.t('breadcrumb'),
        this.t(`metrics:breadcrumb`)
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.filterView = new FilterView({
        model: this.model
      });

      this.setView('#-filter', this.filterView);

      METRICS.forEach(metric =>
      {
        GROUPS.forEach(group =>
        {
          const options = {
            metric: `${metric}-${group}`,
            model: this.model,
            filename: this.t(`metrics:filename:${metric}`),
            title: this.t(`metrics:title:${metric}`),
            stackingLimit: 10
          };

          Object.assign(options, METRIC_OPTIONS[metric]);

          this.setView(`#-${metric}-${group}`, new TableAndChartView(options));
        });
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);
    },

    load: function(when)
    {
      return when(dictionaries.load().done(() => this.model.fetch()));
    },

    getTemplateData: function()
    {
      return {
        metrics: METRICS,
        groups: GROUPS
      };
    },

    afterRender: function()
    {
      const metrics = new Set();

      this.$('a[data-metric]').each((i, el) =>
      {
        const metric = el.dataset.metric;

        if (metrics.has(metric))
        {
          return;
        }

        metrics.add(metric);

        el.click();
      });
    },

    onFilterChanged: function(newRqlQuery)
    {
      this.model.rqlQuery = newRqlQuery;

      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    }

  });
});
