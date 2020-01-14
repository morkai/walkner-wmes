// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './DrillingReportPage',
  '../Report5Query',
  '../Report5DisplayOptions',
  '../views/5/HeaderView',
  '../views/5/FilterView',
  '../views/5/DisplayOptionsView',
  '../views/5/ChartsView',
  'app/prodTasks/ProdTaskCollection',
  'app/core/util/bindLoadingMessage'
], function(
  DrillingReportPage,
  Query,
  DisplayOptions,
  HeaderView,
  FilterView,
  DisplayOptionsView,
  ChartsView,
  ProdTaskCollection,
  bindLoadingMessage
) {
  'use strict';

  return DrillingReportPage.extend({

    rootBreadcrumbKey: 'BREADCRUMB:5',
    initialSettingsTab: 'hr',
    maxOrgUnitLevel: 'subdivision',

    pageId: 'report5',

    defineModels: function()
    {
      this.prodTasks = bindLoadingMessage(
        new ProdTaskCollection(null, {rqlQuery: 'select(name)&sort(name)'}),
        this
      );

      DrillingReportPage.prototype.defineModels.call(this);
    },

    load: function(when)
    {
      return when(this.settings.fetch({reset: true}), this.prodTasks.fetch({reset: true}));
    },

    createQuery: function()
    {
      return new Query(this.options.query);
    },

    createDisplayOptions: function()
    {
      var options = {
        settings: this.settings,
        prodTasks: this.prodTasks
      };

      if (typeof this.options.displayOptions === 'string')
      {
        return DisplayOptions.fromString(this.options.displayOptions, options);
      }

      return new DisplayOptions(this.options.displayOptions, options);
    },

    createHeaderView: function()
    {
      return new HeaderView({model: this.query, displayOptions: this.displayOptions});
    },

    createFilterView: function()
    {
      return new FilterView({model: this.query});
    },

    createDisplayOptionsView: function()
    {
      return new DisplayOptionsView({model: this.displayOptions});
    },

    createChartsView: function(report, skipRenderCharts)
    {
      return new ChartsView({
        model: report,
        settings: this.settings,
        displayOptions: this.displayOptions,
        skipRenderCharts: !!skipRenderCharts
      });
    }

  });
});
