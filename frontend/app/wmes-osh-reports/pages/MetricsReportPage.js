// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../views/metrics/FilterView',
  '../views/metrics/YearlyAccidentsChartView',
  '../views/metrics/TrcView',
  '../views/metrics/IprView',
  '../views/metrics/IppView',
  '../views/metrics/ObsPlanView',
  '../views/metrics/ContactView',
  '../views/metrics/RiskyObsView',
  '../views/metrics/ObserversView',
  'app/wmes-osh-reports/templates/metrics/page'
], function(
  View,
  bindLoadingMessage,
  dictionaries,
  FilterView,
  YearlyAccidentsChartView,
  TrcView,
  IprView,
  IppView,
  ObsPlanView,
  ContactView,
  RiskyObsView,
  ObserversView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template,

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
      this.filterView = new FilterView({model: this.model});

      this.setView('#-filter', this.filterView);

      this.setView('#-yearlyAccidents', new YearlyAccidentsChartView({model: this.model}));
      this.setView('#-trc', new TrcView({model: this.model}));
      this.setView('#-ipr', new IprView({model: this.model}));
      this.setView('#-ipp', new IppView({model: this.model}));
      this.setView('#-obsPlan', new ObsPlanView({model: this.model}));
      this.setView('#-contact', new ContactView({model: this.model}));
      this.setView('#-riskyObs', new RiskyObsView({model: this.model}));
      this.setView('#-observers', new ObserversView({model: this.model}));
    },

    defineBindings: function()
    {
      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);
    },

    load: function(when)
    {
      return when(dictionaries.load().done(() => this.model.fetch()));
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
