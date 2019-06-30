// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
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
  'app/qiResults/templates/outgoingQuality/page'
], function(
  _,
  t,
  View,
  bindLoadingMessage,
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
  template
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
        this.t('BREADCRUMBS:base'),
        this.t('BREADCRUMBS:reports:outgoingQuality')
      ];
    },

    initialize: function()
    {
      var report = bindLoadingMessage(this.model, this);

      bindLoadingMessage(report.results, this);

      this.setView('#-filter', new FilterView({model: report}));

      this.setView('#-ppm-chart', new PpmChartView({model: report}));
      this.setView('#-ppm-table', new PpmTableView({model: report}));

      this.setView('#-where-chart', new ParetoChartView({
        model: report,
        property: 'where',
        resolveTitle: resolveWhereTitle
      }));
      this.setView('#-where-table', new ParetoTableView({
        model: report,
        property: 'where',
        resolveTitle: resolveWhereTitle
      }));

      this.setView('#-what-chart', new ParetoChartView({
        model: report,
        property: 'what',
        resolveTitle: resolveWhatTitle
      }));
      this.setView('#-what-table', new ParetoTableView({
        model: report,
        property: 'what',
        resolveTitle: resolveWhatTitle
      }));

      this.setView('#-results', new ResultListView({collection: report.results}));

      this.listenTo(report, 'filtered', this.onFiltered);

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
    }

  });
});
