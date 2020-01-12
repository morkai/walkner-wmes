// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../ResultsReport',
  '../views/resultsReport/FilterView',
  '../views/resultsReport/VsChartView',
  '../views/resultsReport/AvgOutputChartView',
  '../views/resultsReport/TableView',
  'app/wmes-ct-pces/templates/resultsReport/page'
], function(
  _,
  t,
  View,
  bindLoadingMessage,
  Report,
  FilterView,
  VsChartView,
  AvgOutputChartView,
  TableView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        {href: '#ct', label: this.t('BREADCRUMBS:base')},
        this.t('BREADCRUMBS:reports:results')
      ];
    },

    actions: function()
    {
      return [];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.setView('#-filter', new FilterView({model: this.model}));
      this.setView('#-vs', new VsChartView({model: this.model}));
      this.setView('#-avgOutput', new AvgOutputChartView({model: this.model}));
      this.setView('#-table', new TableView({model: this.model}));

      this.listenTo(this.model, 'filtered', this.onFiltered);
      this.listenTo(this.model, 'change:tab', this.updateUrl);
    },

    load: function(when)
    {
      return when(
        this.model.fetch()
      );
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());
      this.updateUrl();
    },

    updateUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    }

  });
});
