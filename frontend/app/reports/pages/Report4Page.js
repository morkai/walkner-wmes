// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  '../Report4',
  '../Report4Query',
  '../views/4/FilterView',
  '../views/4/EffAndProdChartView',
  '../views/4/WorkTimesChartView',
  '../views/4/MachineTimesChartView',
  '../views/4/QuantitiesChartView',
  '../views/4/NotesListView',
  'app/reports/templates/4/page'
], function(
  t,
  View,
  Report,
  Query,
  FilterView,
  EffAndProdChartView,
  WorkTimesChartView,
  MachineTimesChartView,
  QuantitiesChartView,
  NotesListView,
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
      this.setView('.reports-4-notes-container', this.notesListView);
    },

    defineModels: function()
    {
      this.query = Query.fromQuery(this.options.query);
      this.report = new Report(null, {query: this.query});

      this.listenTo(this.query, 'change', this.onQueryChange);
    },

    defineViews: function()
    {
      this.filterView = new FilterView({model: this.query});
      this.effAndProdChartView = new EffAndProdChartView({model: this.report});
      this.workTimesChartView = new WorkTimesChartView({model: this.report});
      this.machineTimesChartView = new MachineTimesChartView({model: this.report});
      this.quantitiesChartView = new QuantitiesChartView({model: this.report});
      this.notesListView = new NotesListView({
        model: this.report
      });
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
