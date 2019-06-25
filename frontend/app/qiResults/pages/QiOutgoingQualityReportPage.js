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
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMBS:base'),
        this.t('BREADCRUMBS:reports:outgoingQuality')
      ];
    },

    initialize: function()
    {
      var model = bindLoadingMessage(this.model, this);

      this.setView('#-filter', new FilterView({model: model}));

      this.setView('#-ppm-chart', new PpmChartView({model: model}));
      this.setView('#-ppm-table', new PpmTableView({model: model}));

      this.setView('#-where-chart', new ParetoChartView({
        model: model,
        property: 'where',
        resolveTitle: resolveWhereTitle
      }));
      this.setView('#-where-table', new ParetoTableView({
        model: model,
        property: 'where',
        resolveTitle: resolveWhereTitle
      }));

      this.setView('#-what-chart', new ParetoChartView({
        model: model,
        property: 'what',
        resolveTitle: resolveWhatTitle
      }));
      this.setView('#-what-table', new ParetoTableView({
        model: model,
        property: 'what',
        resolveTitle: resolveWhatTitle
      }));

      this.listenTo(model, 'filtered', this.onFiltered);

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
