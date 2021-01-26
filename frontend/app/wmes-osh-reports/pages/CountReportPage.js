// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../CountReport',
  '../views/CountReportFilterView',
  '../views/CountPerUserChartView',
  '../views/TableAndChartView',
  'app/wmes-osh-reports/templates/count/pages'
], function(
  t,
  View,
  bindLoadingMessage,
  dictionaries,
  CountReport,
  CountReportFilterView,
  CountPerUserChartView,
  TableAndChartView,
  pageTemplates
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: function()
    {
      return pageTemplates[this.model.type].apply(this, arguments);
    },

    events: {

      'click a[data-key]': function(e)
      {
        const {group, key: newKey} = e.currentTarget.dataset;
        const oldKey = this.$(`a[data-group="${group}"].active`).removeClass('active').attr('data-key');

        e.currentTarget.classList.add('active');

        this.$id(oldKey).addClass('hidden');
        this.$id(newKey).removeClass('hidden');
      }

    },

    breadcrumbs: function()
    {
      return [
        this.t('breadcrumb'),
        this.t(`count:${this.model.type}:breadcrumb`)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.filterView = new CountReportFilterView({
        model: this.model
      });

      this.model.metrics.forEach(metric =>
      {
        const ChartView = CountReport.USER_METRICS[metric]
          ? CountPerUserChartView
          : TableAndChartView;

        this.setView(`#-${metric}`, new ChartView({
          metric,
          model: this.model,
          filename: this.t(`count:filename:${metric}:${this.model.type}`),
          title: this.t(`count:title:${metric}`)
        }));
      });

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);

      this.setView('#-filter', this.filterView);
    },

    load: function(when)
    {
      return when(dictionaries.load().done(() => this.model.fetch()));
    },

    getTemplateData: function()
    {
      return {
        type: this.model.type,
        metrics: this.model.metrics.filter(metric => !dictionaries.ORG_UNITS.includes(metric)),
        orgUnits: dictionaries.ORG_UNITS
      };
    },

    afterRender: function()
    {
      const groups = new Set();

      this.$('a[data-group]').each((i, el) =>
      {
        const group = el.dataset.group;

        if (groups.has(group))
        {
          return;
        }

        groups.add(group);

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
