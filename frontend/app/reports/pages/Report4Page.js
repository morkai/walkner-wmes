// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  '../Report4',
  '../Report4Query',
  '../views/Report4FilterView',
  '../views/Report4EffAndProdChartView',
  '../views/Report4WorkTimesChartView',
  '../views/Report4MachineTimesChartView',
  '../views/Report4QuantitiesChartView',
  'app/reports/templates/report4Page'
], function(
  _,
  $,
  t,
  View,
  Report4,
  Report4Query,
  Report4FilterView,
  Report4EffAndProdChartView,
  Report4WorkTimesChartView,
  Report4MachineTimesChartView,
  Report4QuantitiesChartView,
  report4PageTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'report4',

    template: report4PageTemplate,

    breadcrumbs: [t.bound('reports', 'BREADCRUMBS:4')],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.setView('.filter-container', this.filterView);
      this.setView('.reports-4-effAndProd-container', this.effAndProdChartView);
      this.setView('.reports-4-workTimes-container', this.workTimesChartView);
      this.setView('.reports-4-machineTimes-container', this.machineTimesChartView);
      this.setView('.reports-4-quantities-container', this.quantitiesChartView);
    },

    defineModels: function()
    {
      this.query = Report4Query.fromQuery(this.options.query);
      this.report = new Report4(null, {query: this.query});

      this.listenTo(this.query, 'change', this.onQueryChange);
    },

    defineViews: function()
    {
      this.filterView = new Report4FilterView({model: this.query});
      this.effAndProdChartView = new Report4EffAndProdChartView({model: this.report});
      this.workTimesChartView = new Report4WorkTimesChartView({model: this.report});
      this.machineTimesChartView = new Report4MachineTimesChartView({model: this.report});
      this.quantitiesChartView = new Report4QuantitiesChartView({model: this.report});
    },

    load: function(when)
    {
      return when(this.report.fetch());
    },

    onQueryChange: function(query, options)
    {
      if (options && options.reset)
      {
        this.broker.publish('router.navigate', {
          url: this.report.url() + '?' + this.query.serializeToString(),
          replace: true,
          trigger: false
        });

        this.promised(this.report.fetch());
      }
    }

  });
});
